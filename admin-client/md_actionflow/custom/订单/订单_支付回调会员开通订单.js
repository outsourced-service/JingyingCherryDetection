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
    fields: ["id, updated_at, vip_exp_time, user_inviteparent{id capital frozen_capital}"]
})
if (!order || !user) return setReturn(payload, "失败", "没有查询到订单和用户信息")
payload.orderInfo = order;
payload.userInfo = user;
// 如果 user.vip_exp_time 存在且有效，则使用它；否则使用当前时间
const vipExpTime = user.vip_exp_time ? new Date(user.vip_exp_time) : new Date();
// 在 vipExpTime 基础上加一月
const new_vip_exp_time = new Date(vipExpTime.setMonth(vipExpTime.getMonth() + 1));
const GQL = openVip();
if (user?.user_inviteparent) GQL.push(...distribution());
return batch_mutation(GQL)
function distribution() {
    // 查询分销比例
    const resource = query({
        model: "resource",
        limit: 2,
        where: {
            _or: [{ resource_type: { _eq: '会员分销配置' } }, { name: { _eq: '会员开通金额' }, resource_type: { _eq: '金额' } }]
        },
        fields: ["id, mode, text resource_type"]
    })

    let resource_money = resource.find(item => item.resource_type == '金额') || {};
    let resource_rule = resource.find(item => item.resource_type == '会员分销配置') || {};
    if (resource_rule.text > 0) {
        const money = resource_rule.mode === "百分比" ? Math.round(resource_money.text * resource_rule.text / 100) * 1 : Math.round(resource_rule.text); // 是固定金额还是百分比
        if (!money) return [];
        return [{
            response_key: "update_inviter_user",
            action_name: "update_user_by_pk",
            pk_columns: { id: user?.user_inviteparent.id },
            _inc: { capital: money },
            fields: ["id, capital"]
        }, { // 添加父级邀请人资产变动日志
            action_name: "insert_user_assets_logs_one",
            object: {
                user_user: user?.user_inviteparent.id,
                type: '入账',
                title: '会员开通分销奖励',
                content: `因邀请的用户于${now}，开通了会员，获得分销金额${money}分`,
                init_val: user?.user_inviteparent?.capital + user?.user_inviteparent?.frozen_capital,
                change_val: money,
                balance: user?.user_inviteparent?.capital + user?.user_inviteparent?.frozen_capital + money,
                attach_data: [payload]
            },
            fields: "id",
        }]
    } else return []
}

function openVip() {
    return [{// 修改会员订单状态
        action_name: "update_order_by_pk",
        pk_columns: { id: order?.id },
        _set: { status: "已完成", attach_data: [payload] },
        fields: ["id, status"]
    }, {// 会员时间修改
        response_key: "update_my_user",
        action_name: "update_user_by_pk",
        pk_columns: { id: user?.id },
        _set: { vip_exp_time: new_vip_exp_time.getTime(), vip_label: "月度" },
        _inc: { ai_check_count: 50 },
        fields: ["id, vip_exp_time"]
    }, {// 添加用户个人信息操作日志
        action_name: "insert_user_logs_one",
        object: { user_user: user?.id, type: '开通会员', title: '开通会员', content: `用户开通会员`, attach_data: [payload] },
        fields: "id",
    }]
}
