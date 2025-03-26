const { batch_mutation, mutation, payload, query, setReturn, tokenToData } = mdapi;
const new_time = new Date().getTime(); //获取当前时间戳
const user_pk = tokenToData()?.id;
const {
    account_name,
    account_model = "支付宝",
    value,
    remarks,
} = payload;
const price = (value * 100).toFixed(0) * 1; //将金额转换为分
//1.先查询是否有这么多的余额
const userInfo = mutation({
    action_name: "update_user_by_pk",
    pk_columns: { id: user_pk },
    _set: { updated_at: new_time },
    fields: "id,capital,frozen_capital"
})
if (price > (userInfo?.capital ?? 0)) return setReturn({ payload }, "fail:204", `余额不足`);
//2.创建提现订单
return batch_mutation([{
    action_name: "insert_user_assets_logs_one",
    object: {
        user_user: user_pk,
        type: "冻结",
        title: "冻结金额",
        content: `用户因提现申请冻结了金额${price}分`,
        init_val: userInfo.capital,
        change_val: price,
        balance: userInfo.capital - price,
        attach_data: {
            account_name,
            account_model: "支付宝",
            value,
            remarks,
        }
    },
    fields: "id,type,title,content,init_val,change_val,balance"
}, {
    action_name: "insert_user_assets_extract_one",
    object: {
        user_user: user_pk,
        account_name,
        account_model,
        value: price,
        remarks,
        status: "审核中",
    },
    fields: "id,account_name,account_model,price:value,remarks,status"
}, {
    action_name: "update_user_by_pk",
    pk_columns: { id: user_pk },
    ... (typeof userInfo.frozen_capital != 'number' ? {
        _set: { frozen_capital: price },
        _inc: { capital: -price }
    } : {
        _inc: { frozen_capital: +price, capital: -price }
    }),
    fields: "id,capital,frozen_capital"
}])