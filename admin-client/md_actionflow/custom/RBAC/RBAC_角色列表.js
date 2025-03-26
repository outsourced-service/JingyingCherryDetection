const { query, batch_mutation, setReturn, payload, responseQuery } = mdapi;
const { page_index = 1, page_size = 100, where = {} } = payload;
const roleListInfo = responseQuery({ //执行复合查询
    model: `role`,
    where: where,
    limit: page_size,
    offset: (page_index - 1) * page_size,
    order_by: { id: "asc" },
    fields: ["id name describe type",
        {
            response_key: "menu",
            action_name: "role_menu",
            fields: ["id menu{id idx name icon{id url}path menu_parent_menu attach_data}"],
        }, {
            response_key: "per",
            action_name: "role_per",
            fields: ["id per{id name describe}"],
        },{
            response_key: "manager_role",
            action_name: "manager_role_aggregate",
            fields: ["aggregate{count}"],
        },{
            response_key: "user_role",
            action_name: "user_role_aggregate",
            fields: ["aggregate{count}"],
        }]
})
//返回查询到的数据
return {
    total_size: roleListInfo.aggregate.count,
    list: roleListInfo.datas.map(res => {
        return {
            ...res,
            menu: res.menu.map(res=>res.menu),
            per: res.per.map(res=>res.per),
        }
    })
}