const new_time = Date.now() - (1000 * 60 * 60 * 24 * 3); //获取当前时间戳
const order = mdapi.query({
    action_name: "order",
    limit: 10,
    where: {
        status: { _eq: "待付款" },
        created_at: { _lt: new_time }
    },
    fields: "id user_user created_at status"
})
//2.修改订单状态，并添加流程信息
return mdapi.batch_mutation([{
    action_name: "delete_order",
    where: {
        created_at: { _lt: Date.now() },
        mode: { _eq: "会员开通订单" },
        status: { _eq: "待付款" }
    },
    fields: "affected_rows"
}, {
    action_name: "update_order",
    where: {
        id: { _in: order.map((item) => item.id) }
    },
    _set: { status: "已取消" },
    fields: "affected_rows"
}, {
    action_name: "insert_order_process",
    objects: order.map((item) => ({
        user_user: item.user_user,
        order_order: item.id,
        title: "已取消",
        content: `待付款 -> 已取消`
    })),
    fields: "affected_rows ",
}])
