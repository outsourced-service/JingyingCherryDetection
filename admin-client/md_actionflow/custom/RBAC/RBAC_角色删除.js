const { query, mutation, setReturn, payload } = mdapi;
const { role_pk = 0 } = payload;//接收传入值
const res = mutation({//执行指令
    operation: "delete_role_by_pk",
    id: role_pk
});
//返回结果
if (!res?.id) return setReturn({ payload }, "失败", "角色不存在")
return setReturn({ role_pk: res.id, }, "成功", "角色删除成功!")