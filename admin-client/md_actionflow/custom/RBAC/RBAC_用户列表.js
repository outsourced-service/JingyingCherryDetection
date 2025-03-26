const { query, batch_mutation, setReturn, payload, responseQuery } = mdapi;
const { page_index = 1, page_size = 100, where = {} } = payload;
const managerListInfo = responseQuery({//执行复合查询
    model: `manager`,
    where: where,
    limit: page_size,
    offset: (page_index - 1) * page_size,
    fields: ["id username phone avatar{id url} is_deleted nickname", {
        action_name: "manager_role",
        fields: ["id role { id name describe }"],
    }]
})
//返回查询到的数据
return {
    total_size: managerListInfo.aggregate.count,
    list: managerListInfo.datas.map(res=>{
        return {
            ...res,
            role_list: res.manager_role.map(item=>item.role)
        }
    })
}