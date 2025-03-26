const { query, batch_mutation, setReturn, payload, responseQuery } = mdapi;
const { page_index = 1, page_size = 100, role_pk = 0, where = {} } = payload;//接收传入值
const fields_String = "id idx name icon{id url}path menu_parent_menu attach_data";//查询的字段
const menuListInfo = responseQuery({ //执行复合查询
    model: `menu`,
    where: {
        menu_parent_menu: { _is_null: true },
        ...where,
    },
    limit: page_size,
    offset: (page_index - 1) * page_size,
    order_by: { idx: "asc" },
    fields: [fields_String, roleMenu(),
        getMenu(getMenu(getMenu()))//此处需要套娃才会查到自己绑定自己的数据
    ]
})
//返回查询到的数据
return {
    total_size: menuListInfo.aggregate.count,
    list: menuListInfo.datas
}
//套娃指令，因为不知道有几层，因此需要手动编写
function getMenu(getMenuFunction = "") {
    return {
        action_name: `menu_children`,
        inputs: {
            order_by: { __enum_keys: { idx: "asc_nulls_last" } },
        },
        fields: [fields_String, roleMenu(),
            getMenuFunction]
    }
}
function roleMenu() {
    return {
        action_name: "role_menu",
        inputs: { where: { role_role: { _eq: role_pk } } },
        fields: ["id"],
    }
}