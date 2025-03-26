const { mutation, payload, query, setReturn, tokenToData, batch_mutation, dateFormat } = mdapi;
const new_time = Date.now(); //获取当前时间戳
const now = dateFormat(new_time);
const {
	zion_payment_id,
	provider_transcation_id,
} = payload
const order_id = payload?.order_id ?? payload?.order_pk
//1.查询订单
//`select * from order where order_id = ${orderID}`
const [order] = query({
	model: "order",
	limit: 1,
	where: { id: { _eq: order_id } },
	fields: ["id, mode, status, user_user, price, is_ai_identify"]
})
// // 查询用户
// const user = mutation({
// 	action_name: "update_user_by_pk",
// 	pk_columns: { id: order?.user_user },
// 	_set: { updated_at: Date.now() },
// 	fields: ["id, updated_at, vip_exp_time, user_inviteparent{id capital frozen_capital}"]
// })
// if (!order || !user) return setReturn(payload, "失败", "没有查询到订单和用户信息")
// payload.orderInfo = order;
// payload.userInfo = user;
//2.更新订单状态并启动对应订单支付流程
if (order?.mode === "会员开通订单") return mdapi.callActionflow({
	actionflow_name: "订单_支付回调会员开通订单",
	payload: payload
})
if (order?.mode === "鉴定订单") return mdapi.callActionflow({
	actionflow_name: "订单_支付回调鉴定订单",
	payload: payload
})
if (order?.mode === "新人特惠订单") return mdapi.callActionflow({
	actionflow_name: "订单_支付回调新人特惠订单",
	payload: payload
})