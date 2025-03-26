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
    fields: ["id, mode, status, user_user, price, is_ai_identify, preferential_price"]
})
if (order?.status != "待付款") return setReturn(payload, "失败", "订单状态不是待付款")
// 查询用户
const user = mutation({
    action_name: "update_user_by_pk",
    pk_columns: { id: order?.user_user },
    _set: { updated_at: Date.now() },
    fields: ["id, updated_at, vip_exp_time, ai_check_count, user_inviteparent{id capital frozen_capital}"]
})
if (!order || !user) return setReturn(payload, "失败", "没有查询到订单和用户信息");
// 1.判断订单是否是AI鉴定订单
const GQL = order?.is_ai_identify ? AiOrderUpdate() : orderUpdate();
if (user?.user_inviteparent) GQL.push(...distribution());
// 2.判断是否是AI鉴定订单，如果是判断是否需要减去AI鉴定次数，会员有免费鉴定权限不需要消耗次数，普通用户需要消耗次数
if (order?.is_ai_identify && order?.preferential_price && new Date(user?.vip_exp_time) > new Date()) {
    if (user?.ai_check_count) {
        GQL.push({
            action_name: "update_user_by_pk",
            pk_columns: { id: user?.id },
            _inc: { ai_check_count: -1 },
            fields: ["id, ai_check_count"]
        })
    }
}

return batch_mutation(GQL)

function distribution() {
    // 查询分销比例
    const [resource] = query({
        model: "resource",
        limit: 1,
        where: { resource_type: { _eq: '订单分销配置' } },
        fields: ["id, mode, text"]
    })
    if (resource.text > 0) {
        const money = resource.mode === "百分比" ? Math.round(order.price * resource.text / 100) * 1 : Math.round(resource.text); //计算分销金额
        if (!money) return [];
        return [{
            response_key: "update_inviter_user",
            action_name: "update_user_by_pk",
            pk_columns: { id: user?.user_inviteparent.id },
            _inc: { capital: money },
            fields: ["id, capital"]
        }, {
            // 添加父级邀请人资产变动日志
            action_name: "insert_user_assets_logs_one",
            object: {
                user_user: user?.user_inviteparent.id,
                type: '入账',
                title: '用户订单分销奖励',
                content: `因邀请的用户于${now}，支付了鉴定订单款项，获得分销金额${money}分`,
                init_val: user?.user_inviteparent?.capital + user?.user_inviteparent?.frozen_capital,
                change_val: money,
                balance: user?.user_inviteparent?.capital + user?.user_inviteparent?.frozen_capital + money,
                attach_data: [payload]
            },
            fields: "id",
        }]
    } else return []
}

function orderUpdate() {
    return [{
        // 修改订单状态
        action_name: "update_order_by_pk",
        pk_columns: { id: order?.id },
        _set: {
            status: "待用户发出",
            attach_data: [payload]
        },
        fields: ["id, status"]
    }, {
        // 添加订单流程
        action_name: "insert_order_process_one",
        object: {
            user_user: order?.user_user,
            order_order: order?.id,
            title: "待用户发出",
            content: `待付款 -> 待用户发出 (微信支付完成)`
        },
        fields: "id",
    }]
}

function AiOrderUpdate() {
    return [{
        // 修改订单状态
        action_name: "update_order_by_pk",
        pk_columns: { id: order?.id },
        _set: {
            status: "待鉴定",
            attach_data: [payload]
        },
        fields: ["id, status"]
    }, {
        // 添加订单流程
        action_name: "insert_order_process_one",
        object: {
            user_user: order?.user_user,
            order_order: order?.id,
            title: "待鉴定",
            content: `待付款 -> 待ai鉴定完成`
        },
        fields: "id",
    }]
}
