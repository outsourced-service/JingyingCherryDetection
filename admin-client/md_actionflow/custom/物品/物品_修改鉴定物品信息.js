const { query, mutation, setReturn, payload, batch_mutation } = mdapi;
const {
	id,
	form,
	avatar_id,
	cover_id,
	annexImg = [],
	annexFile = []
} = payload;
//1.进行数据验证
const product = query({
	model: `product_appraisal_details`,
	where: { id: { _eq: id } },
	fields: "id"
});
if (product?.id) return setReturn({ payload }, "失败", "该条鉴定物品信息不存在！");
const { cover, ..._set } = form || {};

//先删除数据在进行添加
//2.删除附件

//3.修改信息重新添加附件
return mdapi.batch_mutation([{
	action_name: "delete_product_appraisal_details_annex",
	where: { product_appraisal_details_product_appraisal_details: { _eq: id } }
}, {
	action_name: "update_product_appraisal_details", // 修改信息
	where: { id: { _eq: id } },
	_set: {
		..._set,
		avatar_id: avatar_id,
		cover_id: cover_id
	}
}, ...annexImg.map((res, index) => {
	return {
		response_key: 'insert_product_appraisal_details_annex_one_' + res + index,
		action_name: "insert_product_appraisal_details_annex_one",
		object: {
			product_appraisal_details_product_appraisal_details: id,
			dir: '图片',
			img_id: res
		},
		fields: "id"
	}
}), ...annexFile.map((res, index) => {
	return {
		response_key: 'insert_product_appraisal_details_annex_one_' + res + index,
		action_name: "insert_product_appraisal_details_annex_one",
		object: {
			product_appraisal_details_product_appraisal_details: id,
			dir: '报告/证书',
			file_id: res
		},
		fields: "id"
	}
})])