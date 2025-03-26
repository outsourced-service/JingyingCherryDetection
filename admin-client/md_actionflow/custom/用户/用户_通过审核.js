const {
    batch_mutation,
    payload,
    query,
    setReturn,
    tokenToData
} = mdapi;
const new_time = new Date().getTime(); //获取当前时间戳
const {
    id: user_pk,
    model
} = tokenToData();
const {
    assets_pk, //提现记录ID
    user_id, //用户ID
    change_val, //变动金额
    imgs, //相关图片合集
} = payload;

//1.查询记录
const [user_assets_extract] = query({
    model: "user_assets_extract",
    limit: 1,
    where: {
        id: {
            _eq: assets_pk
        }
    },
    fields: "id"
})
if (!user_assets_extract?.id) return setReturn({
    payload
}, "fail:204", "提现申请不存在");

//2.查询用户
const [user] = query({
    model: "user",
    limit: 1,
    where: {
        id: {
            _eq: user_id
        }
    },
    fields: ["id, capital, frozen_capital"]
})
// if (user?.capital - change_val < 0) return setReturn({
//     payload
// }, "fail:204", "用户资金不足");

//3.修改状态，并添加图片
return batch_mutation([{
    action_name: "update_user_assets_extract",
    where: {
        id: {
            _eq: assets_pk
        }
    },
    _set: {
        status: "提现成功"
    }
}, {
    action_name: "update_user",
    where: {
        id: {
            _eq: user_id
        }
    },
    _set: {
        frozen_capital: user?.frozen_capital - change_val
    }
}, {
    action_name: "insert_user_logs_one",
    object: {
        user_user: user_id,
        type: '用户提现',
        title: '用户提现',
        content: `用户提现申请${change_val}分，审核通过`,
		attach_data: [payload]
    },
    fields: "id",
}, {
    action_name: "insert_user_assets_logs_one",
    object: {
        user_user: user_id,
        type: '出账',
        title: '提现金额',
        content: `用户提现申请${change_val}分，审核通过`,
        init_val: user?.capital + user?.frozen_capital,
        change_val: change_val,
        balance: user?.capital + user?.frozen_capital - change_val,
		attach_data: [payload]
    },
    fields: "id",
}, ...imgs.map(res => {
    return {
        response_key: 'insert_user_assets_extract_annex_one_' + res,
        action_name: "insert_user_assets_extract_annex_one",
        object: {
            user_assets_extract_user_assets_extract: assets_pk,
            img_id: res
        },
        fields: "id",
    }
})
])