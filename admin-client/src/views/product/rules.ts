export default {
    category_category: { required: true, message: '请选择产品类型', trigger: 'change' },
	client: { required: true, message: '请输入委托人名称', trigger: 'blur' },
	nickname: { required: true, message: '请输入鉴定师名称', trigger: 'blur' },
    condition: { required: true, message: '请输入品相/规格', trigger: 'blur' },
	appraisal_time: { required: true, message: '请选择鉴定时间', trigger: 'blur' },
	title: { required: true, message: '请输入标题(藏品昵称)', trigger: 'blur' },
	// dynasty: { required: true, message: '请输入朝代', trigger: 'blur' },
	result: { required: true, message: '请选择鉴定结果', trigger: 'change' },
	describe: { required: true, message: '请输入评价', trigger: 'blur' },
	img: { required: true, message: '请上传鉴定师头像', trigger: 'blur' },
	product_appraisal_details_annex_img: { required: true, message: '请上传图片', trigger: 'blur' },
}