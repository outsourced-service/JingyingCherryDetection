<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto" style="height: 100%" body-class="el-card-tabel">
			<template #header>
				<div class="system-menu-search align-center">
					<span style="white-space: nowrap">创建时间：</span>
					<el-date-picker v-model="tableData.created_at" type="daterange" size="default" range-separator="至"
						start-placeholder="开始日期" end-placeholder="结束日期" style="max-width: 280px"
						@change="getTableData" />
					<el-select v-model="tableData.statusSearch" size="default" class="ml10" placeholder="选择提现状态"
						@change="getTableData" style="max-width: 180px">
						<el-option v-for="item in tableData.optionsSelectAll" :key="item.value" :label="item.label"
							:value="item.value" />
					</el-select>
					<el-button size="default" type="primary" class="ml10" @click="getTableData">
						<el-icon>
							<ele-Search />
						</el-icon>
						查询
					</el-button>
					<el-button size="default" type="" class="ml10" @click="getTableReset">
						<el-icon>
							<ele-Refresh />
						</el-icon>
						重置
					</el-button>
				</div>
			</template>
			<el-table :data="tableData.data" v-loading="tableData.loading" height="100%" style="width: 100%">
				<el-table-column type="expand">
					<template #default="props">
						<el-card shadow="hover" class="cardImage">
							<template #header>审核图片</template>
							<!-- <el-upload
								class="mt20"
								v-model:file-list="props.row.user_assets_extract_annex"
								list-type="picture-card"
								:on-preview="handlePictureCardPreview"
								disabled
							>
								<el-icon><Plus /></el-icon>
							</el-upload> -->
							<div class="mt20">
								<ul class="el-upload-list el-upload-list--picture-card is-disabled">
									<li class="el-upload-list__item is-success"
										v-for="(item, index) in props.row.user_assets_extract_annex" :key="index">
										<img class="el-upload-list__item-thumbnail" :src="item.img.url" alt="" />
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
				<el-table-column prop="id" label="序号" width="60" />
				<el-table-column prop="created_at" label="创建时间" min-width="120"
					:formatter="(res: any) => new Date(res.created_at).toLocaleString()" />
				<el-table-column prop="user.nickname" label="申请用户" show-overflow-tooltip />
				<!-- <el-table-column prop="user_assets_extract_annex" label="申请用户" show-overflow-tooltip /> -->
				<el-table-column prop="avatar" label="用户头像" >
					<template #default="scope">
						<div v-if="scope.row?.user?.avatar?.url">
							<el-image
								:src="scope.row?.user?.avatar?.url"
								:alt="scope.row?.user?.name"
								fit="cover"
								style="width: 30px; height: 30px; border-radius: 50%"
								:preview-src-list="[scope.row?.user?.avatar?.url]"
								preview-teleported
							/>
						</div>
						<div v-else>-</div>
					</template>
				</el-table-column>
				<el-table-column prop="user.mobile" label="手机号" show-overflow-tooltip />
				<el-table-column prop="account_name" label="账户名" show-overflow-tooltip />
				<el-table-column prop="account_model" label="账户类型" show-overflow-tooltip />
				<el-table-column prop="value" width="200" label="提现金额(单位: 元)" :formatter="(res: any) => Number.parseFloat(res.value/100).toFixed(2)" show-overflow-tooltip/>
				<el-table-column prop="remarks" label="备注" show-overflow-tooltip />
				<el-table-column prop="status" label="提现状态" />
				<el-table-column label="操作" width="200" fixed="right">
					<template #default="scope">
						<div class="buttonAggregate" >
							<el-button size="small" text type="primary"
								@click="openDialogRef(scope.row)" v-if="scope.row.status == '审核中'">审核通过</el-button>
							<!-- <el-button size="small" text type="primary"
								@click="popusDutiesRef.openDialog(scope.row)">拒绝</el-button> -->
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
		<el-dialog :title="dialog.title" v-model="dialog.isShowDialog" width="40%">
			<el-form ref="assetsFormRef" :model="dialog.ruleForm" size="default" label-width="auto" :rules="dialog.rules">
				<el-row :gutter="50">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="上传转账图片" prop="user_assets_extract_annex_img">
							<el-upload
								v-model:file-list="dialog.fileList"
								ref="upimage"
								action="#"
								:limit="9"
								:auto-upload="true"
								list-type="picture-card"
								:http-request="beforeLicenseHandle"
								:before-upload="async (file: any) => await beforeImageUpload(file, dialog, 'user_assets_extract_annex_img')"
								:on-remove="async (file: any) => await beforeImageRemove(file, dialog, 'user_assets_extract_annex_img')"
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

<script setup lang="ts" name="assets">
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import type { FormInstance, FormRules, UploadProps } from 'element-plus';
import { user_assets } from '/@/api/index';
import rules from './rules';
import upload from './upload';
const assetsFun = user_assets();
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

//定义接收参数
const props = defineProps({
	user_id: {
		type: Number,
		default: 0,
	},
});

const upimage = ref();
const upfile = ref();
const dialogImageUrl = ref('');
const dialogVisible = ref(false);

// 定义变量内容
const assetsFormRef = ref<FormInstance>();
const tableData = reactive(<any>{
	loading: false,
	search: '',
	statusSearch: '',
	data: [],
	total: 0,
	param: {
		pageNum: 1,
		pageSize: 10,
	},
	optionsSelectAll: [
		{ value: '审核中', name: '审核中' },
		{ value: '提现成功', name: '提现成功' },
	]
});

const dialog = reactive({
	isShowDialog: false,
	row: <any>{},
	type: '',
	title: '',
	submitTxt: '',
	rules: rules,
	product: 0,
	fileList: <any>[],
	dialogImageUrl: '',
	ruleForm: <any>{
		id: 0,
		user_assets_extract_annex_img: [],
		user_id: 0
	},
});

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
	dialogImageUrl.value = uploadFile.url!;
	dialogVisible.value = true;
};

// 查询方法
const getTableData = async () => {
	tableData.loading = true;
	const { list, total_size } = await assetsFun.get(
		{
			page_index: tableData.param.pageNum,
			page_size: tableData.param.pageSize,
			order_by: { __enum_keys: { id: 'desc_nulls_last' } },
			where: {
				user_user: props.user_id == 0 ? {} : { _eq: props.user_id },
				status: tableData.statusSearch ? { _eq: tableData.statusSearch} : {},
				created_at: tableData.created_at?.length === 2 ? { _gte: tableData.timeRange[0], _lte: tableData.timeRange[1] }
					: {},
			},
		},
		{}
	);
	tableData.data = list;
	tableData.total = total_size;
	tableData.loading = false;
};

// 修改
const onUpd = (ruleForm: any) => {
	ElMessageBox.confirm('确认通过当前用户的提现请求吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			const { id: ID, user_id, value, user_assets_extract_annex, user_assets_extract_annex_img, ..._set } = ruleForm;
			await assetsFun
				.updatePass({
					assets_pk: ID,
					user_id: user_id,
					change_val: value,
					imgs: user_assets_extract_annex_img
				})
				.then(() => {
					ElMessage({
						type: 'success',
						message: '通过提现请求',
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
	if (assetsFormRef.value) assetsFormRef.value.resetFields();
	dialog.row = row;
	dialog.type = row.id ? 'edit' : 'add';
	dialog.title = row.id ? '审核' : '新增';
	dialog.submitTxt = row.id ? '通 过' : '新 增';
	dialog.ruleForm = JSON.parse(JSON.stringify(row));
	dialog.ruleForm.user_id = dialog.ruleForm?.user.id;
	dialog.isShowDialog = true;
	dialog.fileList = [];
	const { imgs, user_assets_extract_annex = [], ..._set } = row;
	dialog.ruleForm[`user_assets_extract_annex_img`] = user_assets_extract_annex || [];
};

// 取消
const onCancel = () => {
	dialog.isShowDialog = false;
	if (!assetsFormRef.value) return;
	assetsFormRef.value.resetFields();
};

const onSubmit = () => {
	if (!assetsFormRef.value) return;
	assetsFormRef.value.validate((valid: any) => {
		if (valid) {
			// if (dialog.type === 'add') onAdd(dialog.ruleForm);
			if (dialog.type === 'edit') onUpd(dialog.ruleForm);
		}
	});
};

// 重置按钮
const getTableReset = () => {
	tableData.statusSearch = "";
	getTableData();
}

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
