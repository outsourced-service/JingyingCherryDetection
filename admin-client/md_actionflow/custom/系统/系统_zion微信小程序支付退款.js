
let { payload, setReturn, action } = mdapi;
let { payment_pk = "8000000000000000", refundAmount } = payload;

const paymentId = "8000000000000000"
// 1.OTTPAY 2.STRIPE_PAY 3.WECHATPAY_MINIPROGRAM 4.WECHATPAY_MOBILE_WEB 
const pay_method = "WECHATPAY_MINIPROGRAM";
let now_time = new Date().getTime();

// 第一步：查询订单信息,取出默认退款金额
let { fz_payment_by_pk } = action({
  action_name: "fz_payment_by_pk",
  inputs: {
    id: paymentId
  },
  fields: `id order_id account_id grand_total_value status transaction_id description type`
})
refundAmount = refundAmount || fz_payment_by_pk?.grand_total_value

// 第二步：执行退款
try {
  let { refund } = action({
    action_name: "refund",
    inputs: {
      paymentId,
      __enum_keys: {
        type: pay_method
      },
      refundAmount
    }
  }, { type: "mutation" })
  if (!refund) {
    throw new Error(`退款失败,refund:${refund}`)
  }
} catch (e) {
  return setReturn({ payload, e, fz_payment_by_pk }, "失败", `退款失败:${e?.message || e}`)
}
return setReturn({ payment_pk, refundAmount,payment_logs_pk }, "成功", `退款成功`)






