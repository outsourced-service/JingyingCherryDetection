const { query, setReturn, payload, batch_mutation } = mdapi
const { order_pk } = payload;
const [order] = query({
    model: "order",
    limit: 1,
    where: {
        id: { _eq: order_pk }
    },
    fields: ["id, user_user, status, price"]
})
if (!order?.id || !order_pk) return setReturn({ payload }, "fail:204", "订单不存在");

if (order?.status == "已退款") return setReturn({ payload }, "fail:204", "当前订单已无法退款");

return batch_mutation([{
    action_name: "update_order",
    where: { id: { _eq: order.id } },
    _set: { status: "已退款" }
}, {
    action_name: "insert_order_process_one",
    object: {
        user_user: order.user_user,
        order_order: order.id,
        title: "已退款",
        content: `${order?.status} -> 已退款`
    },
    fields: "id",
}])