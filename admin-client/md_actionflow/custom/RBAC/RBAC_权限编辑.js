const { query, mutation, setReturn, payload, action } = mdapi;
const {
    per_pk = 0,
    name,
    describe,
} = payload;//接收传入值
//判断传入值是否传入，传入保存没有传入就不保存
const _set = {};
if (name) _set[`name`] = name;
if (describe) _set[`describe`] = describe;


//执行传入指令至muattion并返回执行结果
const update_per_pk = mutation({
    operation: "update_per_by_pk",
    pk_columns: { id: per_pk },
    _set
})?.id

if (!update_per_pk) return setReturn({ payload }, "失败", "权限不存在，请传入有效的per_pk")
return setReturn({ per_pk: per_pk }, "成功", "权限修改成功!")
