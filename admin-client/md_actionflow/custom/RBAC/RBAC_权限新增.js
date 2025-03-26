const { query, mutation, setReturn, payload } = mdapi;
const { describe, name } = payload;//接收传入值
//1.查找用户名是否出现重复是就返回提示
const response = query({
    model: `per`,
    where: {
        name: { _eq: name },
    },
    fields: ["id"]
})
if (response.length > 0) return setReturn({ payload }, "失败", "权限已存在，请重新输入!");
//执行传入指令至muattion并返回执行结果
return setReturn({
    per_pk: mutation({
        operation: "insert_per_one",
        object: { describe, name}
    })?.id,
}, "成功", "权限添加成功!")