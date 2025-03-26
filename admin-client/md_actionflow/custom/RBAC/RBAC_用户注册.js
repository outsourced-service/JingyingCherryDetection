const { md5, query, mutation, setReturn, payload, tokenToData } = mdapi;
const {
    username = "", password, phone, nickname, avatar_id, role_pk: rolePk = null,
} = payload;//接收传入值
const role_pk = rolePk ? (Array.isArray(rolePk) ? rolePk : [rolePk]) : null;
if (!username || !password || !phone || !nickname) return setReturn({ username, phone, nickname, avatar_id }, "失败", "请填写所有信息后进行注册!")
//1.查找用户名是否出现重复是就返回提示
const response = query({
    model: `manager`,
    where: {
        username: { _eq: username },
    },
    fields: ["id"]
})
if (response.length > 0) return setReturn({ payload }, "失败", "用户名已存在，请更换!")
//执行传入指令至muattion并返回执行结果
return setReturn({
    manager_pk: mutation({
        operation: "insert_manager_one",
        object: {
            username,
            password: md5(password),
            phone,
            nickname,
            avatar_id,
            is_deleted: false,
            ...(role_pk ? {
                manager_role: {
                    data: role_pk.map(res => {
                        return { role_role: res }
                    })
                }
            } : {})
        }
    })?.id,
}, "成功", "注册成功，请登录!")
