const { query, mutation, setReturn, payload, dataToToken, md5 } = mdapi;
const { username = "", password = "" } = payload;
const fields_String = "id idx name icon{id url}path menu_parent_menu";//查询的字段
//获取用户信息
const [manager] = query({
    model: `manager`,
    where: {
        username: { _eq: username },
        password: { _eq: md5(password) },
    },
    fields: ["id, is_deleted"]
})

if (!manager?.id) return setReturn({}, "登录失败", "用户名或密码错误，请检查");
if (manager?.is_deleted == true) return setReturn({}, "登录失败", "该账号已被注销");

//2.查询该用户的菜单列表
const menuListInfo = query({
    model: `menu`,
    where: {
        menu_parent_menu: { _is_null: true },
        role_menu: {
            role: {
                manager_role: {
                    manager_manager: { _eq: manager?.id },
                }
            }
        }
    },
    order_by: {},
    fields: [fields_String,
        getMenu(getMenu(getMenu()))//此处需要套娃才会查到自己绑定自己的数据
    ]
})

return setReturn({
    ...dataToToken({
        "id": manager?.id,
        "model": "manager",
    }),
    manager_pk: manager?.id,
    menu_list: menuListInfo
}, "成功", "登录成功，返回菜单数据！")

//套娃指令，因为不知道有几层，因此需要手动编写
function getMenu(getMenuFunction = "") {
    return {
        action_name: `menu_children`,
        fields: [fields_String,
            getMenuFunction]
    }
}