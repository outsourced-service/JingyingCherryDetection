const { md5, mutation, setReturn, payload, tokenToData, query } = mdapi;
//获取基本信息
const {
    client_data,
    manager_pk,
    username,
    password,
} = payload;
const { id: manager_user_pk, model } = tokenToData(client_data?.token ?? null);
//验证传入到的信息
if (!manager_pk || !username || !password) return setReturn({ payload }, "失败", "请传入所有参数");

//1.比对信息,已确保用户修改的是自己的信息;
//注:超级管理员修改账户请通过其他方式修改
if ("manager" !== model) return setReturn({ payload }, "失败", "token类型不符，请重新登录后再试！！");
if (manager_pk !== manager_user_pk) return setReturn({ payload, }, "失败", "只能修改本人的信息，不能修改他人的信息！！");

//1.查找用户名是否出现重复是就返回提示
const response = query({
    model: `manager`,
    where: {
        id: { _neq: manager_user_pk },
        username: { _eq: username },
    },
    fields: ["id"]
})
if (response.length > 0) return setReturn({ username }, "失败", "用户名已存在，请更换!")
//执行指令并返回
return setReturn({
    manager_pk: mutation({
        operation: "update_manager_by_pk",
        pk_columns: { id: manager_user_pk },
        _set: {
            username,
            password: md5(password)
        }
    })?.id
}, "成功", "用户信息修改成功，请退出并重新登录！")