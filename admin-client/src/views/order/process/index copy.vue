<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto" style="height: 100%" body-class="el-card-tabel">
			<template #header>
				<div class="system-menu-search align-center">
					<span class="ml10" style="white-space: nowrap">内容:</span>
					<el-input
						size="default"
						clearable
						v-model="tableData.search"
						class="ml10"
						placeholder="请输入内容"
						style="max-width: 200px"
						@clear="getTableData"
					>
					</el-input>
					<el-button size="default" type="primary" class="ml10" @click="getTableData">
						<el-icon>
							<ele-Search />
						</el-icon>
						查询
					</el-button>
					<!-- <el-select
						v-model="tableData.type"
						size="default"
						class="ml10"
						placeholder="选择类型"
						clearable
						style="max-width: 180px"
						@change="getTableData"
					>
						<el-option v-for="(item, index) in tableData.optionsSelectAll" :key="index" :label="item" :value="item" />
					</el-select> -->
					<el-button size="default" type="success" class="ml10" @click="openDialogCurdFormRef({})">
						<el-icon>
							<ele-FolderAdd />
						</el-icon>
						新增
					</el-button>
					<!-- <div v-for="(item, index) in tableData.staus" :key="index">
						{{index.name}}
					</div> -->
				</div>
			</template>
			<el-table :data="tableData.data" v-loading="tableData.loading" height="100%" style="width: 100%">
				<el-table-column prop="id" label="序号" width="60" />
				<el-table-column prop="order.id" label="订单ID" width="100" />
				<el-table-column prop="user.nickname" label="操作用户" width="120" />
				<el-table-column prop="title" label="标题" width="120" />
				<el-table-column prop="content" label="内容" />
				<el-table-column prop="express_name" label="物流公司" width="120" />
				<el-table-column prop="express_orderid" show-overflow-tooltip label="物流单号" width="160" />
				<el-table-column label="操作" width="200" fixed="right">
					<template #default="scope">
						<div class="buttonAggregate">
							<!-- <el-button size="small" text type="primary"
								@click="popusDutiesRef.openDialog(scope.row)">查看详情</el-button> -->
							<el-button size="small" text type="primary" @click="openDialogCurdFormRef(scope.row)">编辑</el-button>
						</div>
					</template>
				</el-table-column>
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
			<el-steps :active="dialog.stepId" align-center style="margin-bottom: 30px;">
			    <el-step title="待付款" />
			    <el-step title="待用户发出" />
			    <el-step title="待客户部接收" />
				<el-step title="待客户部发出鉴定" />
				<el-step title="待实验室接收" />
				<el-step title="待实验室发出" />
				<el-step title="待客户部签收" />
				<el-step title="待客户部发出返还" />
				<el-step title="待用户签收" />
				<el-step title="已完成" />
			</el-steps>
			<el-form ref="processFormRef" :model="dialog.ruleForm" size="default" label-width="auto" :rules="dialog.rules">
				<el-row :gutter="50">
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
					<el-form-item label="图片" prop="">
						<!-- <el-upload
							v-model:file-list="dialog.fileList"
							ref="upimage"
							multiple
							action="#"
							:auto-upload="true"
							list-type="picture-card"
							:http-request="beforeLicenseHandle"
							:before-upload="async (file: any) => await beforeImageUpload(file, dialog)"
							:on-remove="() => (image = null)"
							:on-preview="handlePictureCardPreview"
							:on-exceed="(file: any) => handleExceed(upimage, file, 'image', dialog)"
							:accept="ImgType.join(',')"
							style="width: 100%"
						>
							<el-icon class="avatar-uploader-icon">
								<Plus />
							</el-icon>
						</el-upload> -->
						<uplodeImage ref="imageRef" @imageList="getImageList" :key="dialog.componentKey"></uplodeImage>
					</el-form-item>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit" size="default">{{ dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
		<!-- <el-dialog v-model="dialogVisible" width="fit-content">
			<img w-full :src="dialogImageUrl" alt="Preview Image" />
		</el-dialog> -->
	</div>
</template>

<script setup lang="ts" name="process">
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import type { FormInstance, FormRules, UploadProps, UploadUserFile } from 'element-plus';
import { order_process } from '/@/api/index';
import rules from './rules';
import upload from './upload';
const { beforeLicenseHandle, handleExceed, beforeVideoUpload, beforeImageUpload, beforeFileUpload, fileType, videoType, ImgType } = upload;
const processFun = order_process();

const upimage = ref();
const dialogImageUrl = ref('');
const dialogVisible = ref(false);
const imageRef = ref();

// 引入组件
const uplodeImage = defineAsyncComponent(() => import('/@/components/uplodeImage/index.vue'));

//定义接收参数
const props = defineProps({
	order_id: {
		type: Number,
		default: 0,
	},
	order_status: {
		type: String,
		default: '',
	}
});

// 外部变量
// const emit = defineEmits(['refresh']);

const processFormRef = ref<FormInstance>();
const fileList = ref<UploadUserFile[]>([]);

// 定义变量内容
const dialog = reactive({
	isShowDialog: false,
	row: <any>{},
	type: '',
	rules: rules,
	title: '',
	submitTxt: '',
	fileList: <any>[],
	imageList: <any>[],
	order_status: '',
	ruleForm: <any>{
		id: 0,
		express_name: '',
		express_orderid: '',
		order_py: props.order_id,
		title: ''
	},
	stepId: 0,
	componentKey: 1
});

const tableData = reactive(<any>{
	loading: false,
	search: '',
	type: '',
	dateTime: [],
	data: [],
	total: 0,
	param: {
		pageNum: 1,
		pageSize: 10,
	},
});

const getImageList = (img: any) => {
	dialog.fileList = img;
}

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
	dialogImageUrl.value = uploadFile.url!;
	dialogVisible.value = true;
};

const deteform = (date: string | number | Date) => (date ? new Date(date).toLocaleString() : '-');
// 查询方法
const getTableData = async () => {
	tableData.loading = true;
	const { list, total_size } = await processFun.get(
		{
			page_index: tableData.param.pageNum,
			page_size: tableData.param.pageSize,
			// order_by: { __enum_keys: { idx: 'asc_nulls_last' } },
			where: {
				order_order: { _eq: props.order_id },
				content: { _ilike: `%${tableData.search}%` },
			},
		},
		{}
	);
	tableData.data = list;
	tableData.total = total_size;
	
	tableData.loading = false;
};

//初始化
const openDialogCurdFormRef = (row: any = {}) => {
	if (processFormRef.value) processFormRef.value.resetFields();
	dialog.row = row;
	dialog.type = row.id ? 'edit' : 'add';
	dialog.title = row.id ? '编辑' : '新增';
	dialog.submitTxt = row.id ? '修 改' : '新 增';
	dialog.ruleForm = JSON.parse(JSON.stringify(row));
	dialog.fileList = [];
	dialog.imageList = [];
	dialog.isShowDialog = true;
	const { image } = row;
	if (row?.id) {
		dialog.ruleForm[`image_id`] = image?.id;
		if (image?.url) dialog.fileList = [{ name: image?.id, url: image?.url }];
	} else {
		dialog.ruleForm.order_py = props.order_id;
		dialog.ruleForm.title = dialog.order_status;
		dialog.stepId = Number(getStatusID(dialog.order_status));
	}
};

// 取消
const onCancel = () => {
	dialog.isShowDialog = false;
	if (!processFormRef.value) return;
	processFormRef.value.resetFields();
	dialog.componentKey += 1;
};

//提交
const onSubmit = () => {
	processFormRef.value.validate((valid: any) => {
		if (valid) {
			for(var i = 0; i < dialog.fileList.length; i++) {
				dialog.imageList.push(dialog.fileList[i].url + ',');
			}
			if (dialog.type === 'add') onAdd(dialog.ruleForm);
			if (dialog.type === 'edit') onUpd(dialog.ruleForm);
		}
	});
};

//删除
const onDel = (row: any) => {
	ElMessageBox.confirm('此操作将永久删除该数据, 是否继续?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			await processFun.del(row.id, true, {}).then(() => {
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
			const { id, ...inc } = ruleForm;
			await processFun.addProcess({
					...inc,
					imgs: dialog.imageList
				}	
			).then(() => {
				ElMessage({
				  type: 'success',
				  message: '添加成功！',
				})
				dialog.order_status = String(getStatus(ruleForm.title));
				getTableData();
			}).catch(() => {
				ElMessage({
				  type: 'error',
				  message: '添加失败！',
				})
			}).finally(() => {
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
			delete ruleForm.order;
			delete ruleForm.order_order;
			delete ruleForm.user;
			const { id: ID, ..._set } = ruleForm;
			await processFun.set(
				ID,
				{
					_set: {
						..._set,
					},
				},{}
			).then(() => {
				ElMessage({
				  type: 'success',
				  message: '编辑成功！',
				})
				getTableData();
			}).catch(() => {
				ElMessage({
				  type: 'error',
				  message: '编辑失败！',
				})
			}).finally(() => {
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
	dialog.order_status = props.order_status;
});

const getStatusID = (title: any) =>  {
    if (title == "待付款") return 1;
    if (title == "待用户发出") return 2;
	if (title == "待客户部接收") return 3;
	if (title == "待客户部发出鉴定") return 4;
	if (title == "待实验室接收") return 5;
	if (title == "待实验室发出") return 6;
	if (title == "待客户部签收") return 7;
	if (title == "待客户部发出返还") return 8;
	if (title == "待用户签收") return 9;
	if (title == "待用户签收") return 10;
}

const getStatus = (title: any) => {
    if (title == "待付款") return "待用户发出";
    if (title == "待用户发出") return "待客户部接收";
	if (title == "待客户部接收") return "待客户部发出鉴定";
	if (title == "待客户部发出鉴定") return "待实验室接收";
	if (title == "待实验室接收") return "待实验室发出";
	if (title == "待实验室发出") return "待客户部签收";
	if (title == "待客户部签收") return "待客户部发出返还";
	if (title == "待客户部发出返还") return "待用户签收";
	if (title == "待用户签收") return "已完成";
}
</script>

<style scoped lang="scss">
	::v-deep(.el-step__icon-inner) {
		font-size: 16px !important;
	}
</style>
