const { mutation, payload, query, setReturn, tokenToData, batch_mutation, dateFormat } = mdapi;
const new_time = Date.now(); //获取当前时间戳
const now = dateFormat(new_time);
const {
    order_id,
    zion_payment_id,
    provider_transcation_id,
} = payload
//1.查询订单
const [order] = query({
    model: "order",
    limit: 1,
    where: { id: { _eq: order_id } },
    fields: ["id, mode, status, user_user, price, is_ai_identify"]
})
if (order?.status != "待付款") return setReturn(payload, "失败", "订单状态不是待付款")
// 查询用户
const user = mutation({
    action_name: "update_user_by_pk",
    pk_columns: { id: order?.user_user },
    _set: { updated_at: Date.now() },
    fields: ["id, updated_at, newbie_discount_count"]
})
if (!order || !user) return setReturn(payload, "失败", "没有查询到订单和用户信息")
payload.orderInfo = order;
payload.userInfo = user;

//2.更新订单状态并启动对应订单支付流程  
if (order?.mode === "新人特惠订单") {
    return batch_mutation([
        {// 修改新人特惠订单状态为"已完成"
            action_name: "update_order_by_pk",
            pk_columns: { id: order?.id },
            _set: { status: "已完成", attach_data: [payload] },
            fields: ["id, status"]
        },
        {// 将user中的"newbie_discount_count"字段设为0
            action_name: "update_user_by_pk",  
            pk_columns: { id: order?.user_user },
            _set: { newbie_discount_count: 0 },
            fields: ["id, newbie_discount_count"]
        },
        {// 添加用户个人信息操作日志
            action_name: "insert_user_logs_one",
            object: { 
                user_user: user?.id, 
                type: '新人特惠', 
                title: '新人特惠', 
                content: `用户购买新人特惠`, 
                attach_data: [payload] 
            },
            fields: "id",
        }
    ])
}

return setReturn(payload, "失败", "不是新人特惠订单")
