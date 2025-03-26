const { query, mutation, setReturn, payload } = mdapi;
const { menu_pk = 0 } = payload;//接收传入值
const res = mutation({  //执行指令
    operation: "delete_menu_by_pk",
    id:menu_pk
});
//返回结果
if (!res?.id) return setReturn({ payload }, "失败", "菜单不存在，请传入有效的menu_pk")
return setReturn({ menu_pk: res.id, }, "成功", "菜单删除成功!")