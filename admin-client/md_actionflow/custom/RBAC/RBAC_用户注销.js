const { query, mutation, setReturn, payload } = mdapi;
const { manager_pk = 0 } = payload;//接收传入值
const res = mutation({  //执行指令
    operation: "update_manager_by_pk",
    pk_columns: { id: manager_pk },
    _set: { is_deleted: true}
});//返回结果
if (!res?.id) return setReturn({ payload }, "失败", "用户不存在")
return setReturn({ manager_pk: res.id, }, "成功", "用户注销成功!")