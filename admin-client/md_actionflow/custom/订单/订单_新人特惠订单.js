const { mutation, payload, query, setReturn, tokenToData } = mdapi;
const new_time = new Date().getTime(); //获取当前时间戳
const user_pk = tokenToData()?.id;
const mode = "新人特惠订单";
const type = "新人特惠";
const status = "待付款";
const num = 1;
// const price = 1;
const {
    account_pk = 0,
    describe,
    // imgs = [],
} = payload;
const [resource_money] = query({
	model: "resource",
	limit: 1,
	where: { name: { _eq: '新人特惠金额' }, resource_type: { _eq: '金额' }},
	fields: ["id, mode, text"]
})
const price = Number(resource_money.text);
//2.创建订单
const order = mutation({
    action_name: "insert_order_one",
    object: {
        user_user: user_pk,
        mode,
        type,
        num,
        price: price,
        describe,
        status,
        order_process: {
            data: [{
                user_user: user_pk,
                title: "待付款",
                content: "待提交 -> 待付款",
            }]
        },
    },
    fields: "id user{account{id}}",
})
const { data, status: status2, msg } = mdapi.callActionflow({
    actionflow_name: "系统_zion微信小程序支付下单",
    payload: {
        account_pk: account_pk,
        amount: (price / 100).toFixed(2) * 1,
        description: describe || "新人特惠",
        order_id: order.id
    }
})
return setReturn(data, status2, msg)