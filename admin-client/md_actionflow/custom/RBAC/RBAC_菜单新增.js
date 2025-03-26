const { query, mutation, setReturn, payload } = mdapi;
const { idx, name, menu_parent_pk, icon_id, path, attach_data = {} } = payload;//接收传入值
const [menu] = query({
    model: `menu`,
    where: { name: { _eq: name } },
});
if (menu?.id) return setReturn({ payload }, "失败", "菜单已存在，请重新输入!");
//执行传入指令至muattion并返回执行结果
return setReturn({
    menu_pk: mutation({
        operation: "insert_menu_one",
        object: { idx, name, menu_parent_menu: menu_parent_pk, icon_id, path, attach_data }
    })?.id,
}, "成功", "菜单添加成功!")