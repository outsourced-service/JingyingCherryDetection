const { query, mutation, setReturn, payload } = mdapi;
const { name, describe } = payload;//接收传入值
const [role] = query({
    model: `role`,
    where: { name: { _eq: name } },
});
if (role?.id) return setReturn({ payload }, "失败", "角色已存在，请重新输入!");

//执行传入指令至muattion并返回执行结果
return setReturn({
    role_pk: mutation({
        operation: "insert_role_one",
        object: { name, describe }
    })?.id,
}, "成功", "角色添加成功!")
