
let { setReturn, md5, system, action, query, errlog, callActionflow, payload } = mdapi;

// 1.取出数据并验证
//let body = context.getArg('fz_callback_body');
const callback = payload?.fz_payment_callback_input ?? context.getArg('fz_payment_callback_input');

// 2.计算密钥并解密

// 3.取出paymentId, out_trade_no格式："wechat_0_7"
const paymentId = convertWechatCallbackToFzPaymentId(callback?.out_trade_no);
const transaction_id = callback?.transaction_id;

if (callback?.result_code !== "SUCCESS" || callback?.return_code !== "SUCCESS" || !paymentId || !transaction_id) {
    return setReturn({ callback }, "失败", "支付回调验证失败");
}

const [fz_payment_one] = query({
    model: "fz_payment",
    where: {
        id: {
            _eq: paymentId
        }
    },
    limit: 1,
    field_string: `id status order_id account_id transaction_id`
})

if (fz_payment_one?.status === "SUCCESSFUL") return setReturn({ callback, fz_payment_one }, "成功", "支付已完成");

if (fz_payment_one?.status !== "PENDING") return setReturn({ callback, fz_payment_one }, "失败", "支付状态异常");

// 4.更新fz_payment数据表状态并返回数据
const { update_fz_payment_by_pk: fz_payment } = action({
    action_name: "update_fz_payment_by_pk",
    inputs: {
        pk_columns: {
            id: paymentId
        },
        _set: {
            status: "SUCCESSFUL",
            transaction_id
        }
    },
    fields: ["id", "status", "transaction_id", "grand_total_value", "order_id", "account_id"]
}, { type: "mutation" })

// 写入payment表

// 5.调用订单执行处理
const actionRes = callActionflow({
    actionflow_name: "订单_支付回调成功",
    payload: {
        order_id: fz_payment?.order_id,
        zion_payment_id: fz_payment?.id,
        provider_transcation_id: fz_payment?.transaction_id,
    }
})

// 最终结果返回
return actionRes;

function convertWechatCallbackToFzPaymentId(outTradeNo) {
    const BASE_WECHAT_PAYMENT_ID = 8000000000000000;
    return BASE_WECHAT_PAYMENT_ID + Number(outTradeNo.slice(outTradeNo.lastIndexOf('_') + 1));
}

