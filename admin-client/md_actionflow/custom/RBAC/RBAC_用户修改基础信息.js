const { query, mutation, setReturn, payload, action, tokenToData, md5 } = mdapi;
const {
    client_data,
    manager_pk = 0,
    nickname,
    avatar_id,
    username,
    password,
    phone,
} = payload;//接收传入值
const { id: manager_user_pk, model } = tokenToData(client_data?.token ?? null);

//验证传入到的信息
if (!manager_pk || !nickname || !avatar_id) return setReturn({ payload }, "失败", "请传入所有参数");

//1.比对信息,已确保用户修改的是自己的信息;
//注:超级管理员修改账户信息请通过其他方式修改
if ("manager" !== model) return setReturn({ payload }, "失败", "token类型不符，请重新登录后再试！！");
if (manager_pk !== manager_user_pk && authority()) return setReturn({ payload }, "失败", "只能修改本人的信息，不能修改他人的信息！！");

//1.查找用户名是否出现重复是就返回提示
if (username) {
    const response = query({
        model: `manager`,
        where: {
            id: { _neq: manager_pk },
            username: { _eq: username },
        },
        fields: ["id"]
    })
    if (response.length > 0) return setReturn({ username, phone, nickname, avatar_id }, "失败", "用户名已存在，请更换!")
}

//判断传入值是否传入，传入保存没有传入就不保存
const _set = {};
if (nickname) _set[`nickname`] = nickname;
if (avatar_id) _set[`avatar_id`] = avatar_id;
if (username) _set[`username`] = username;
if (password) _set[`password`] = md5(password);

//执行指令并返回执行结果
return setReturn({
    manager_pk: mutation({
        operation: "update_manager_by_pk",
        pk_columns: { id: manager_pk },
        _set
    })?.id
}, "成功", "用户修改基础信息成功!")

function authority() {
    const [manager] = query({
        model: `manager`,
        where: {
            id: { _eq: manager_user_pk },
            manager_role: {
                role: {
                    id: { _eq: 1 },
                    name: { _eq: "超级管理员" }
                }
            }
        },
        limit: 1,
        fields: ["id username phone avatar{id url} is_deleted nickname", {
            action_name: "manager_role",
            fields: ["id", {
                action_name: "role",
                fields: ["id", "name", "describe"]
            }],
        }]
    });
    return !manager?.id
}