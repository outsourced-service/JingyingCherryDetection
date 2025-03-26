<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto" style="height: 100%" body-class="el-card-tabel">
			<template #header v-if="showButton(props.order.status)">
				<div class="system-menu-search align-center justify-end">
					<!-- <span class="ml10" style="white-space: nowrap">名称：</span>
					<el-input
						size="default"
						clearable
						v-model="tableData.search"
						class="ml10"
						placeholder="请输入名称"
						style="max-width: 180px"
						@clear="getTableData"
					>
					</el-input>
					<el-button size="default" type="primary" class="ml10" @click="getTableData">
						<el-icon>
							<ele-Search />
						</el-icon>
						查询
					</el-button>
					<el-select v-model="tableData.type" size="default" class="ml10" placeholder="选择类型" @change="getTableData" style="max-width: 180px">
						<el-option v-for="item in tableData.optionsSelectAll" :key="item.value" :label="item.label" :value="item.value" />
					</el-select> -->
					<el-button size="default" type="success" class="ml10" @click="openDialogRef({})">
						<el-icon>
							<ele-FolderAdd />
						</el-icon>
						新增
					</el-button>
				</div>
			</template>
			<el-table :data="tableData.data" v-loading="tableData.loading" height="100%" style="width: 100%">
				<el-table-column type="expand">
					<template #default="props">
						<el-card shadow="hover" class="cardImage">
							<template #header>流程图片</template>
							<!-- <el-upload
								class="mt20"
								v-model:file-list="props.row.order_annex"
								list-type="picture-card"
								:on-preview="handlePictureCardPreview"
								disabled
							>
								<el-icon><Plus /></el-icon>
							</el-upload> -->
							<div class="mt20">
								<ul class="el-upload-list el-upload-list--picture-card is-disabled">
									<li class="el-upload-list__item is-success"
										v-for="(item, index) in props.row.order_annex" :key="index">
										<img class="el-upload-list__item-thumbnail" :src="item.url" alt="" />
										<span class="el-upload-list__item-actions">
											<span class="el-upload-list__item-preview">
												<i class="el-icon el-icon--zoom-in" @click="handlePictureCardPreview(item)">
													<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
														<path fill="currentColor"
															d="m795.904 750.72 124.992 124.928a32 32 0 0 1-45.248 45.248L750.656 795.904a416 416 0 1 1 45.248-45.248zM480 832a352 352 0 1 0 0-704 352 352 0 0 0 0 704m-32-384v-96a32 32 0 0 1 64 0v96h96a32 32 0 0 1 0 64h-96v96a32 32 0 0 1-64 0v-96h-96a32 32 0 0 1 0-64z">
														</path>
													</svg>
												</i>
											</span>
										</span>
									</li>
								</ul>
							</div>
						</el-card>
					</template>
				</el-table-column>
				<el-table-column prop="created_at" label="创建时间" :formatter="(res: any) => deteform(res.created_at)" />
				<el-table-column prop="user.nickname" label="操作用户" :formatter="(res: any) => res?.user?.nickname ?? res?.manager?.nickname" />
				<el-table-column prop="user.mobile" label="手机号" :formatter="(res: any) => res?.user?.mobile ?? res?.manager?.phone" />
				<el-table-column prop="title" label="标题" />
				<el-table-column prop="content" label="内容" />
				<el-table-column prop="express_name" label="物流公司" :formatter="(res: any) => res?.express_name??'-'" />
				<el-table-column prop="express_orderid" show-overflow-tooltip label="物流单号" :formatter="(res: any) => res?.express_orderid??'-'" />
				<!-- <el-table-column label="操作" width="160" fixed="right">
					<template #default="scope">
						<el-button size="small" text type="primary" @click="openDialogRef(scope.row)">编辑</el-button>
					</template>
				</el-table-column> -->
			</el-table>
			<template #footer>
				<el-pagination
					v-if="tableData.data.length > 0"
					@size-change="onHandleSizeChange"
					@current-change="onHandleCurrentChange"
					:pager-count="5"
					:page-sizes="[10, 30, 50]"
					v-model:current-page="tableData.param.pageNum"
					background
					v-model:page-size="tableData.param.pageSize"
					layout="total, sizes, prev, pager, next, jumper"
					:total="tableData.total"
				>
				</el-pagination>
			</template>
		</el-card>
		<el-dialog :title="dialog.title" v-model="dialog.isShowDialog" width="80%">
			<el-steps :active="dialog.stepId" align-center class="mb20" finish-status="success" :space="300">
				<el-step :title="item" v-for="item in tableData.optionsSelectAll" :key="item" />
			</el-steps>
			<el-form ref="curdFormRef" :model="dialog.ruleForm" size="default" label-width="auto" :rules="dialog.rules">
				<el-row :gutter="50">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="上传图片" prop="imgs">
							<el-upload
								v-model:file-list="dialog.fileList"
								ref="upimage"
								action="#"
								:limit="9"
								:auto-upload="true"
								list-type="picture-card"
								:http-request="beforeLicenseHandle"
								:before-upload="async (file: any) => await beforeImageUpload(file, dialog, 'imgs')"
								:on-remove="async (file: any) => await beforeImageRemove(file, dialog, 'imgs')"
								:on-preview="handlePictureCardPreview"
								:on-exceed="(file: any) => handleExceedMsg('最大可上传数量为9')"
								:accept="ImgType.join(',')"
								style="width: 100%"
								multiple
							>
								<el-icon class="avatar-uploader-icon">
									<Plus />
								</el-icon>
							</el-upload>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="物流公司" prop="express_name">
							<el-input v-model="dialog.ruleForm.express_name" type="text" placeholder="请输入物流公司名称" clearable />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="物流单号" prop="express_orderid">
							<el-input v-model="dialog.ruleForm.express_orderid" type="text" placeholder="请输入物流单号" clearable />
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit" size="default">{{ dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
		<el-dialog v-model="dialogVisible" width="fit-content">
			<img w-full :src="dialogImageUrl" alt="Preview Image" />
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="order_process">
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { order_process, product } from '/@/api/index';
import type { FormInstance, FormRules, UploadProps } from 'element-plus';
import rules from './rules';
const curdFun = order_process();
const productFun = product();
import upload from './upload';
const {
	beforeLicenseHandle,
	handleExceed,
	beforeVideoUpload,
	beforeImageUpload,
	beforeFileUpload,
	beforeImageRemove,
	handleExceedMsg,
	fileType,
	videoType,
	ImgType,
} = upload;

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

//定义接收参数
const props = defineProps({
	order: {
		type: Object,
		default: () => {
			return { status: '' };
		},
	},
});

const upimage = ref();
const upfile = ref();

const dialogImageUrl = ref('');
const dialogVisible = ref(false);

// 定义变量内容
const curdFormRef = ref<FormInstance>();
const tableData = reactive(<any>{
	loading: false,
	search: '',
	type: '',
	optionsSelectAll: [
		'待付款',
		'待用户发出',
		'待客户部接收',
		'待客户部发出鉴定',
		'待实验室接收',
		'待实验室发出',
		'待客户部签收',
		'待客户部发出返还',
		'待用户签收',
		'已完成',
	],
	data: [],
	total: 0,
	param: {
		pageNum: 1,
		pageSize: 10,
	},
});
const dialog = reactive({
	isShowDialog: false,
	row: <any>{},
	type: '',
	title: '',
	submitTxt: '',
	stepId: 0,
	rules: rules,
	product: 0,
	fileList: <any>[],
	dialogImageUrl: '',
	ruleForm: <any>{
		id: 0,
		imgs: [],
	},
});

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
	dialogImageUrl.value = uploadFile.url!;
	dialogVisible.value = true;
};

const addButton = (status: String) => {
	if (status != "待用户发出" && status != "待用户签收" && status != '待付款') {
		return true;
	}
};

const showButton = (status: String) => {
	if (status != "已完成" && status != "已取消") {
		return true;
	}
};

// 查询方法
const getTableData = async () => {
	tableData.loading = true;
	const { list, total_size } = await curdFun.get(
		{
			page_index: tableData.param.pageNum,
			page_size: tableData.param.pageSize,
			order_by: { __enum_keys: { id: 'desc_nulls_last' } },
			where: {
				order_order: {
					_eq: props.order.id,
				},
			},
		},
		{}
	);
	tableData.data = list.map((res: any) => {
		return {
			...res,
			order_annex: res.order_annex.map((res: any) => res.img),
		};
	});
	tableData.total = total_size;
	tableData.loading = false;
};

// 查询物品
const getProduct = async () => {
	const { list } = await productFun.get(
		{
			page_index: 1,
			page_size: 5,
			order_by: { __enum_keys: { id: 'desc_nulls_last' } },
			where: {
				order_order: {
					_eq: props.order.id,
				},
			},
		},
		{}
	);
	dialog.product = list.length;
};

//删除
const onDel = (row: any) => {
	ElMessageBox.confirm('此操作将永久删除该数据, 是否继续?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			await curdFun.del(row.id, true, {}).then(() => {
				ElMessage({
					type: 'success',
					message: '删除成功',
				});
				getTableData();
			});
		})
		.catch(() => {
			ElMessage({
				type: 'info',
				message: '已取消删除',
			});
		});
};
// 新增
const onAdd = (ruleForm: any) => {
	ElMessageBox.confirm('确认新增该数据吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			const { id: ID, express_name, express_orderid, imgs, ..._set } = ruleForm;
			await curdFun
				.addProcess({
					order_py: props.order.id, //订单ID
					title: props.order.status, //订单状态
					express_name, //物流名称
					express_orderid, //物流单号
					imgs, //相关图片合集
				})
				.then(() => {
					ElMessage({
						type: 'success',
						message: '添加成功',
					});
					props.order.status = tableData.optionsSelectAll[dialog.stepId + 1];
					getTableData();
					emit('refresh');
				})
				.finally(() => {
					onCancel();
				});
		})
		.catch(() => {
			ElMessage({
				type: 'info',
				message: '已取消添加',
			});
		});
};
// 修改
const onUpd = (ruleForm: any) => {
	ElMessageBox.confirm('确认修改当前数据吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			const { id: ID, express_name, express_orderid, imgs, ..._set } = ruleForm;
			await curdFun
				.addProcess({
					order_py: props.order.id, //订单ID
					title: props.order.status, //订单状态
					express_name, //物流名称
					express_orderid, //物流单号
					imgs, //相关图片合集
				})
				.then(() => {
					ElMessage({
						type: 'success',
						message: '修改成功',
					});
					getTableData();
				})
				.finally(() => {
					onCancel();
				});
		})
		.catch(() => {
			ElMessage({
				type: 'info',
				message: '已取消修改',
			});
		});
};

//初始化
const openDialogRef = (row: any = {}) => {
	if( addButton(props.order.status) != true ) { return ElMessage({ type: 'info', message: '当前流程需用户操作' });}
	if (curdFormRef.value) curdFormRef.value.resetFields();
	dialog.row = row;
	dialog.type = row.id ? 'edit' : 'add';
	dialog.title = row.id ? '编辑' : '新增';
	dialog.submitTxt = row.id ? '修 改' : '新 增';
	dialog.ruleForm = JSON.parse(JSON.stringify(row));
	dialog.isShowDialog = true;
	dialog.fileList = [];
	const { image, file, video, attach_data = {}, order_annex = [], ..._set } = row;
	dialog.ruleForm.title = props.order.status;
	dialog.stepId = tableData.optionsSelectAll.findIndex((res: any) => res === props.order.status);
	dialog.ruleForm[`imgs`] = order_annex || [];
};
// 取消
const onCancel = () => {
	dialog.isShowDialog = false;
	if (!curdFormRef.value) return;
	curdFormRef.value.resetFields();
};

const onSubmit = () => {
	if (!curdFormRef.value) return;
	getProduct();
	if (dialog.product == 0 && props.order.status == '待客户部发出返还') {
		return ElMessage({ type: 'info', message: '请先添加该订单物品鉴定结果' });
	}
	curdFormRef.value.validate((valid: any) => {
		if (valid) {
			if(props.order.status == '待客户部发出鉴定' || props.order.status == '待实验室发出' || props.order.status == '待客户部发出返还') {
				if(!dialog.ruleForm.express_name) { return ElMessage({ type: 'error', message: '请输入物流公司名称' }); }
				if(!dialog.ruleForm.express_orderid) { return ElMessage({ type: 'error', message: '请输入物流单号' }); }
			}
			if (dialog.ruleForm.imgs.length < 3) {
				return ElMessage({ type: 'info', message: '流程图片上传不足3张'})
			}
			if (dialog.type === 'add') onAdd(dialog.ruleForm);
			if (dialog.type === 'edit') onUpd(dialog.ruleForm);
		}
	});
};
const deteform = (date: string | number | Date) => (date ? new Date(date).toLocaleString() : '-');
// 分页改变
const onHandleSizeChange = (val: number) => {
	tableData.param.pageSize = val;
	getTableData();
};
// 分页改变
const onHandleCurrentChange = (val: number) => {
	tableData.param.pageNum = val;
	getTableData();
};

// 页面加载时
onMounted(async () => {
	getTableData();
});
</script>

<style scoped lang="scss">
:deep(.el-step__icon-inner) {
	font-size: 16px !important;
}
.cardImage {
	:deep(.el-upload),
	:deep(.el-upload--picture-card),
	:deep(.el-list-move) {
		display: none;
	}
	:deep(.el-upload-list__item-status-label) {
		opacity: 0;
	}
}
</style>
