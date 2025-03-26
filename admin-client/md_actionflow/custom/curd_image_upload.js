// eslint-disable-next-line no-undef
const { mutation, payload, action, setReturn } = mdapi;
const {
	model = "user_intro_annex",
	account_pk = null, //批量删除
	where = {},
	operate = "", //新增  编辑 删除  批量删除
	fields = "id",
	tabel_id = null,
	data = {}, //新增数据必传
	_set = {}, //编辑数据必传
	_inc = {},
} = payload
if (model === "user") return setReturn({ payload }, "fail:204", "不能传入user");
const action_config = { type: "mutation" };
if (!model || !fields) return setReturn({ payload }, "fail:204", "image_id,model和fields必须传入");
if (operate === "新增") {
	if (Object.keys(data).length === 0) return setReturn({ payload }, "fail:204", "data必须传入");
	return action({
		action_name: `insert_${model}_one`,
		inputs: {
			object: data
		},
		fields
	}, action_config);
}
if (operate === "编辑") {
	if (Object.keys(_set).length === 0) return setReturn({ payload }, "fail:204", "_set必须传入");
	return action({
		action_name: `update_${model}_by_pk`,
		inputs: {
			pk_columns: { id: tabel_id },
			_set,
			...(Object.keys(_inc).length > 0 ? { _inc } : {})
		},
		fields
	}, action_config);
}
if (operate === "删除") {
	if (!tabel_id) return setReturn({ payload }, "fail:204", "tabel_id必须传入");
	return action({
		action_name: `delete_${model}_by_pk`,
		inputs: {
			id: tabel_id
		},
		fields
	}, action_config);
}
if (operate === "批量删除") {
	if (!account_pk) return setReturn({ payload }, "fail:204", "account_pk必须传入");
	return action({
		action_name: `delete_${model}`,
		inputs: {
			where: {
				...where,
				account_account: { _eq: account_pk }
			},
		},
		fields: "affected_rows returning{id}"
	}, action_config);
}
return setReturn({ payload }, "fail:204", "operate参数错误");
