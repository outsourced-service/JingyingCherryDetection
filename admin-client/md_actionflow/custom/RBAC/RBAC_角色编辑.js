const { query, mutation, setReturn, payload, action } = mdapi;
const {
    role_pk = 0, name, describe
} = payload;//接收传入值
//判断传入值是否传入，传入保存没有传入就不保存
const _set = {};
if (name) _set[`name`] = name;
if (describe) _set[`describe`] = describe;
//执行传入指令至muattion并返回执行结果
const update_role_pk = mutation({
    operation: "update_role_by_pk",
    pk_columns: { id: role_pk },
    _set
})?.id
if (!update_role_pk) return setReturn({ payload }, "失败", "角色不存在，请传入有效的role_pk")
return setReturn({  role_pk: role_pk }, "成功", "角色修改成功!")