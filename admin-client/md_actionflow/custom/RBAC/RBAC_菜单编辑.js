const { query, mutation, setReturn, payload, action } = mdapi;
const {
    menu_pk = 0, idx, name, menu_parent_pk, icon_id, path, attach_data = null
} = payload; //接收传入值
//判断传入值是否传入，传入保存没有传入就不保存
const _set = {};
if (idx) _set[`idx`] = idx;
if (name) _set[`name`] = name;
if (path) _set[`path`] = path;
if (icon_id) _set[`icon_id`] = icon_id;
if (menu_parent_pk) _set[`menu_parent_menu`] = menu_parent_pk;
if (attach_data) _set[`attach_data`] = attach_data;
const update_menu_pk = mutation({
    operation: "update_menu_by_pk",
    pk_columns: { id: menu_pk },
    _set: _set
})?.id
//返回结果
if (!update_menu_pk) return setReturn({ payload }, "失败", "菜单不存在，请传入有效的menu_pk")
//执行传入指令至muattion并返回执行结果
return setReturn({ menu_pk: menu_pk }, "成功", "菜单修改成功!")