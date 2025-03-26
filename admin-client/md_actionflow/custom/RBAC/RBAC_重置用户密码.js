const { query, mutation, setReturn, payload, md5 } = mdapi;
const { manager_pk = 0 } = payload;//接收传入值
const manager_by_pk = query({  //执行指令
    model: "manager_by_pk",
    id: manager_pk,
    fields: "id password phone",
})

const res = mutation({  //执行指令
    operation: "update_manager_by_pk",
    pk_columns: { id: manager_pk },
    _set: {
        password: md5(md5(manager_by_pk.phone))
    }
});//返回结果
if (!res?.id) return setReturn({ payload }, "失败", "用户不存在")
return setReturn({ manager_pk: res.id, }, "成功", "用户重置成功!")