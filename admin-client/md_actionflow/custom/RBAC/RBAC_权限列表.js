const { query, batch_mutation, setReturn, payload, responseQuery } = mdapi;
const { page_index = 1, page_size = 100, role_pk, where = {} } = payload;
const perListInfo = responseQuery({ //执行复合查询
    model: `per`,
    where: where,
    limit: page_size,
    offset: (page_index - 1) * page_size,
    fields: ["id", "name", "describe", roleMenu()]
})
//返回查询到的数据
return {
    total_size: perListInfo.aggregate.count,
    list: perListInfo.datas
}
function roleMenu() {
    return {
        action_name: "role_per",
        inputs: { where: { role_role: { _eq: role_pk } } },
        fields: ["id"],
    }
}