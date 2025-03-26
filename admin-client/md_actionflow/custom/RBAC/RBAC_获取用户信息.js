const { query, batch_query, mutation, setReturn, payload, tokenToData, dataToToken } = mdapi;
const { id: manager_pk, model } = tokenToData(payload?.client_data?.token ?? null);
//验证token的信息
if (model !== "manager" || !manager_pk) return setReturn({}, "失败", "登录已过期，请重新登录！");
const fields_String = "id idx name icon{id url}path menu_parent_menu attach_data";//查询的字段

//2.查询该用户的菜单列表
const info = batch_query([{
    model: `menu`,
    where: {
        menu_parent_menu: { _is_null: true },
        role_menu: {
            role: {
                manager_role: {
                    manager_manager: { _eq: manager_pk },
                }
            }
        }
    },
    order_by: { idx: "asc_nulls_last" },
    fields: [fields_String,
        getMenu(getMenu(getMenu())) //此处需要套娃才会查到自己绑定自己的数据
    ]
}, {
    model: `manager`,
    where: { id: { _eq: manager_pk } },
    fields: ["id username phone avatar{id url} is_deleted nickname", {
        action_name: "manager_role",
        fields: ["id", {
            action_name: "role",
            fields: ["id", "name", "describe", {
                action_name: "role_per",
                fields: ["id", "per{id name describe}"]
            }]
        }],
    }]

}])

return setReturn({
    manager_pk: manager_pk,
    menu_list: info?.menu,
    manager: info?.manager?.reduce((object, item) => {
        return {
            ...item,
            manager_role: item.manager_role.map(res => res.role)
        }
    }, {})
}, "成功", "获取用户信息成功，返回菜单数据！")

//套娃指令，因为不知道有几层，因此需要手动编写
function getMenu(getMenuFunction = "") {
    return {
        action_name: `menu_children`,
        inputs: {
            order_by: { __enum_keys: { idx: "asc_nulls_last" } },
        },
        fields: [fields_String,
            getMenuFunction]
    }
}