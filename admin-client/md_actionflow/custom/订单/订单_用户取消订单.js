const { mutation, payload, query, setReturn, tokenToData, batch_mutation } = mdapi;
const new_time = new Date().getTime(); //获取当前时间戳
const user_pk = tokenToData()?.id;
const {
	order_pk
	// imgs = [],
} = payload;
//2.查询鉴定订单
const [order] = query({
	model: "order",
	limit: 1,
	where: {
		id: {
			_eq: order_pk
		}
	},
	fields: ["id, status, price"]
})

if (!order?.id) return setReturn({ payload }, "fail:204", "订单不存在");

if (order?.status != "待付款") return setReturn({ payload }, "fail:204", "当前订单已无法取消");

//2.修改订单状态，并添加流程信息
return batch_mutation([{
    action_name: "update_order",
    where: {
        id: {
            _eq: order_pk
        }
    },
    _set: {
        status: "已取消"
    }
}, {
    action_name: "insert_order_process_one",
    object: {
		user_user: user_pk,
        order_order: order_pk,
        title: "已取消",
        content: `待付款 -> 已取消`
    },
    fields: "id",
}])