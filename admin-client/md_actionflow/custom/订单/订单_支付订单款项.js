const { mutation, payload, query, setReturn, tokenToData } = mdapi;
const user_pk = tokenToData()?.id;
const {
	order_pk, //订单id
	account_pk, //账户id
	describe  //支付描述
} = payload;
//2.查询鉴定订单
const [order] = query({
	model: "order",
	limit: 1,
	where: { id: { _eq: order_pk } },
	fields: ["id, status, price,is_ai_identify"]
})
if (!order?.id) return setReturn({ payload }, "fail:204", "订单不存在");
if (order?.status != "待付款") return setReturn({ payload }, "fail:204", "当前订单状态无需付款");

// 判断是否需要支付，如果不需要支付直接调用支付成功回调
if (order?.price > 0) {
	const price = order?.price;
	const { data, status: status2, msg } = mdapi.callActionflow({
		actionflow_name: "系统_zion微信小程序支付下单",
		payload: {
			account_pk: account_pk,
			amount: (price / 100).toFixed(2) * 1,
			description: describe || (order?.is_ai_identify ? "AI鉴定订单" : "鉴定订单"),
			order_id: order.id
		}
	})
	return setReturn(data, status2, msg)
} else if (order?.is_ai_identify) {
	// 3.支付成功回调
	const { data, status: status2, msg } = mdapi.callActionflow({
		actionflow_name: "订单_支付回调成功",
		payload: {
			user_pk,
			order_id: order_pk,
		}
	})
	return setReturn(data, status2, msg)
}
