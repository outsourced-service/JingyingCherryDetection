
let { payload, setReturn, action } = mdapi;
let { account_pk = 0, amount = 0.01, description = "产品购买", order_id } = payload;

// 1.OTTPAY 2.STRIPE_PAY 3.WECHATPAY_MINIPROGRAM 4.WECHATPAY_MOBILE_WEB 
const pay_method = "WECHATPAY_MINIPROGRAM";
let now_time = new Date().getTime();
order_id = order_id || now_time;

// 第一步：创建一个支付订单
let { insert_fz_payment_one } = action({
    action_name: "insert_fz_payment_one",
    inputs: {
        object: {
            status: "PENDING",
            currency: "CNY",
            grand_total_value: amount,
            description,
            type: pay_method,
            order_id,
            account_id: account_pk,
            created_at: now_time,
            updated_at: now_time
        }
    },
    fields: ['id', 'status', 'currency', 'grand_total_value', "description", "type", 'order_id', "account_id", "created_at", "updated_at"]
}, { type: "mutation" })

// 第二步：生成签名

let { signedPaymentInfo } = action({
    action_name: "signedPaymentInfo",
    inputs: {
        paymentId: insert_fz_payment_one.id,
        __enum_keys: {
            type: pay_method
        }
    },
    fields: ['status', 'message']
}, { type: "mutation" })


// 第三步：返回签名信息
if (signedPaymentInfo?.status != "SUCCESS") {
    return setReturn({ signedPaymentInfo, insert_fz_payment_one }, "失败", "生成签名失败")
}

return { message: signedPaymentInfo.message, payment_pk: 0 }


