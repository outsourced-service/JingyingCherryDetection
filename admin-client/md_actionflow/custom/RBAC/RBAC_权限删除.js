const { query, mutation, setReturn, payload } = mdapi;
const { per_pk = 0 } = payload;
const res = mutation({//执行指令
    operation: "delete_per_by_pk",
    id:per_pk
});
//返回结果
if (!res?.id) return setReturn({ payload }, "失败", "权限不存在")
return setReturn({ per_pk: res.id, }, "成功", "权限删除成功!")