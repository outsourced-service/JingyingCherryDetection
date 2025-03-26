const { query, batch_mutation, setReturn, payload, action } = mdapi;
const { role_pk, menu_pk_list = [], per_pk_list = [] } = payload;
//1.验证角色是否存在
const role = query({
    model: `role`,
    where: { id: { _eq: role_pk } },
    fields: ["id"]
})
if (role.length < 1) return setReturn({ payload }, "失败", "角色不存在，请先创建角色后调用!");
//先删除数据在进行添加
const mutation_GQL = [];
//2.菜单数据添加
//需要判断是否传入只有传入了才会添加
if (menu_pk_list?.length > 0) {
    //2.1删除菜单
    mutation_GQL.push({
        operation: "delete_role_menu",
        where: { role_role: { _eq: role_pk } },
    });
    //2.2重新添加菜单
    mutation_GQL.push({
        operation: "insert_role_menu",
        objects: menu_pk_list.map(item => {
            return {
                role_role: role_pk,
                menu_menu: item
            }
        })
    })
}
//3.权限数据添加
//需要判断是否传入只有传入了才会添加
if (per_pk_list?.length > 0) {
    //3.1删除权限
    mutation_GQL.push({
        operation: "delete_role_per",
        where: { role_role: { _eq: role_pk } },
    });
    //3.2重新添加权限
    mutation_GQL.push({
        operation: "insert_role_per",
        objects: per_pk_list.map(item => {
            return {
                role_role: role_pk,
                per_per: item
            }
        })
    })
}
//判断并返回相应结果
if (mutation_GQL.length < 1) return setReturn({ payload }, "失败", "角色设置菜单和权限失败，至少需要传入一种权限或菜单！")
const response = batch_mutation(mutation_GQL);//执行指令
return setReturn({ role_pk: role_pk, }, "成功", "角色设置菜单和权限成功!")