// eslint-disable-next-line no-undef
const { responseQuery, payload, action, setReturn } = mdapi;
const {
	model = "account",
	operate = "列表", //新增 列表 编辑 删除  详情
	isForceDelete = false, //删除时，传入表示是否为强制删除
	data, //新增、编辑时传入
	data_pk, //编辑、删除、详情时传入
	where,
	order_by,
	page_index = 1,
	page_size = 100,
	fields = "id"
} = payload
if (!model || !fields) return setReturn({ payload }, "fail:204", "model和fields必须传入");
const __actionBody = { action_name: model, inputs: {}, fields: fields }, action_config = { type: "query" };
switch (operate) {
	case "列表": queryDATA(); break;
	case "详情": queryDATA_pk(); break;
	case "新增": insertDATA(); break;
	case "编辑": updateDATA(); break;
	case "删除": deleteDATA(); break;
	default:
		return setReturn({ payload }, "fail:204", `不存在的operate，可选值：1.新增 2.列表 3.编辑 4.删除 5.详情`)
}
if (operate == "列表") {
	const result = responseQuery(__actionBody)
	return {
		__actionBody,
		total_size: result.aggregate.count,
		list: result.datas
	}
}
const result = action(__actionBody, action_config);
const response = result?.[__actionBody.action_name];
if (!response) {
	return setReturn({
		__actionBody,
		payload,
		result
	}, "失败", "操作失败")
}
response.__actionBody = __actionBody;
return response

//查询
function queryDATA() {
	const inputs = {};
	if (where) inputs.where = where;
	if (page_size) inputs.limit = page_size
	if (order_by) inputs.order_by = order_by
	if (page_index && page_size) inputs.offset = (page_index - 1) * page_size
	__actionBody.inputs = inputs;
	__actionBody.action_name = model;
	__actionBody.action_type = "query";
}
function queryDATA_pk() {
	if (!data_pk) throw new Error("data_pk必须传入")
	__actionBody.inputs.id = data_pk
	__actionBody.action_name = `${model}_by_pk`
	__actionBody.action_type = "query";
}
//新增
function insertDATA() {
	action_config.type = "mutation";
	if (!data) throw new Error("data必须传入");
	if (Array.isArray(data)) {
		__actionBody.action_name = `insert_${model}`
		__actionBody.inputs[`objects`] = data
		__actionBody.fields = ["affected_rows ", {
			action_name: "returning",
			fields
		}]
	} else {
		__actionBody.action_name = `insert_${model}_one`
		__actionBody.inputs[`object`] = data
	}
}
//修改
function updateDATA() {
	action_config.type = "mutation";
	if (!data) throw new Error("data必须传入");
	if (!data_pk) throw new Error("data_pk必须传入");
	const { _set = {}, _inc = {}, ...other } = data;
	__actionBody.inputs[`_set`] = { ...other, ..._set, };
	if (Object.keys(_inc).length > 0) __actionBody.inputs[`_inc`] = _inc;
	const isArray = Array.isArray(data_pk);
	//如果传入的是数组，则批量删除	
	if (isArray) __actionBody.inputs[`where`] = { id: { _in: data_pk } };
	else __actionBody.inputs[`pk_columns`] = { id: data_pk }

	__actionBody.action_name = `update_${model}` + (!isArray ? "_by_pk" : '');
}
//删除
function deleteDATA() {
	action_config.type = "mutation";
	if (!data_pk) throw new Error("data_pk必须传入");
	const isArray = Array.isArray(data_pk);

	//如果传入的是数组，则批量删除	
	if (isArray) __actionBody.inputs[`where`] = { id: { _in: data_pk } };
	else if (isForceDelete === true) __actionBody.inputs['id'] = data_pk;
	else __actionBody.inputs[`pk_columns`] = { id: data_pk }

	//判断真删除还是假删除
	if (isForceDelete === true) {
		__actionBody.action_name = `delete_${model}` + (!isArray ? "_by_pk" : '');
	} else {
		__actionBody.action_name = `update_${model}` + (!isArray ? "_by_pk" : '');
		__actionBody.inputs[`_set`] = { is_deleted: true }
	}

	//是否需要包裹返回值
	if (isArray) __actionBody.fields = ["affected_rows ", {
		action_name: "returning",
		fields
	}]
}