const { query, mutation, setReturn, payload, batch_mutation } = mdapi;
const { user_pk = 0, role_pk_list = [] } = payload;
//1.进行数据验证
if (!role_pk_list?.length) return setReturn({ payload }, "失败", "用户绑定角色失败，至少需要传入一种角色！")
const role = query({
    model: `role`,
    where: { id: { _in: role_pk_list } },
});
if (role?.length < role_pk_list?.length) return setReturn({ payload }, "失败", "传入的角色当中，有不存在的角色，请检查后再试！")

const mutation_GQL = [];
//先删除数据在进行添加
//2.删除用户角色
mutation_GQL.push({
    operation: "delete_user_role",
    where: { user_user: { _eq: user_pk } },
});
//3.重新添加用户角色
mutation_GQL.push({
    operation: "insert_user_role",
    objects: role_pk_list.map(item => {
        return {
            user_user: user_pk,
            role_role: item
        }
    })
})
//执行指令并返回结果
const response = batch_mutation(mutation_GQL);
return setReturn({ user_pk: user_pk, }, "成功", "用户绑定角色成功!")