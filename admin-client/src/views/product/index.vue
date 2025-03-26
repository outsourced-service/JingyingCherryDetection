<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto" style="height: 100%" body-class="el-card-tabel">
			<template #header>
				<div class="system-menu-search align-center">
					<div class="align-center">
						<!-- <div v-if="props.category_id == 0 && props.order_id == 0">
							<span class="ml10" style="white-space: nowrap">物品类型：</span>
							<el-select v-model="tableData.search" placeholder="请选择物品类型" size="default" @change="getTableData" class="ml10" style="width: 180px">
								<el-option v-for="item in tableData.categoryData" :key="item.id" :label="item.name" :value="item.id" />
							</el-select>
						</div> -->
						<span class="ml10" style="white-space: nowrap">鉴定结果：</span>
						<el-select v-model="tableData.resultSearch" placeholder="请选择鉴定结果" size="default"
							@change="getTableData" class="ml10" style="width: 180px">
							<el-option v-for="item in tableData.resultData" :key="item.id" :label="item.name"
								:value="item.name" />
						</el-select>
						<!-- <el-button size="default" type="primary" class="ml10" @click="getTableData">
							<el-icon>
								<ele-Search />
							</el-icon>
							查询
						</el-button> -->
						<el-button size="default" type="" class="ml10" @click="getTableReset">
							<el-icon>
								<ele-Refresh />
							</el-icon>
							重置
						</el-button>
						<el-button size="default" type="success" class="ml10" @click="openDialogCurdFormRef({})">
							<el-icon>
								<ele-FolderAdd />
							</el-icon>
							新增
						</el-button>
					</div>
				</div>
			</template>
			<el-table :data="tableData.data" v-loading="tableData.loading" height="100%" style="width: 100%">
				<el-table-column type="expand">
					<template #default="props">
						<el-collapse>
							<el-collapse-item title="物品图片">
								<div class="mt20">
									<ul class="el-upload-list el-upload-list--picture-card is-disabled">
										<div v-for="(item, index) in props.row.product_appraisal_details_annex"
											:key="index">
											<li class="el-upload-list__item is-success" v-if="item?.img">
												<img class="el-upload-list__item-thumbnail"
													:src="item?.img?.url + '?x-oss-process=image/format,webp'" alt="" />
												<span class="el-upload-list__item-actions">
													<span class="el-upload-list__item-preview">
														<i class="el-icon el-icon--zoom-in"
															@click="handlePictureCardPreview(item?.img)">
															<svg xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 1024 1024">
																<path fill="currentColor"
																	d="m795.904 750.72 124.992 124.928a32 32 0 0 1-45.248 45.248L750.656 795.904a416 416 0 1 1 45.248-45.248zM480 832a352 352 0 1 0 0-704 352 352 0 0 0 0 704m-32-384v-96a32 32 0 0 1 64 0v96h96a32 32 0 0 1 0 64h-96v96a32 32 0 0 1-64 0v-96h-96a32 32 0 0 1 0-64z">
																</path>
															</svg>
														</i>
													</span>
												</span>
											</li>
										</div>
									</ul>
								</div>
							</el-collapse-item>
							<el-collapse-item title="物品鉴定文件" name="2">
								<div v-for="(item, index) in props.row.product_appraisal_details_annex" :key="index">
									<div data-v-690b902b="" style="width: 100%;"><!--v-if-->
										<ul class="el-upload-list el-upload-list--text" v-if="item?.file">
											<li class="el-upload-list__item is-success" tabindex="0" style="">
												<!--v-if-->
												<div class="el-upload-list__item-info" @click="downloadFile(item.file)">
													<a class="el-upload-list__item-name"><i
															class="el-icon el-icon--document"><svg
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 1024 1024">
																<path fill="currentColor"
																	d="M832 384H576V128H192v768h640zm-26.496-64L640 154.496V320zM160 64h480l256 256v608a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32m160 448h384v64H320zm0-192h160v64H320zm0 384h384v64H320z">
																</path>
															</svg></i><span class="el-upload-list__item-file-name"
															:title="item.file.name">{{ item.file.name
															}}</span></a><!--v-if-->
												</div>
											</li>
										</ul>
									</div>
								</div>
							</el-collapse-item>
						</el-collapse>
					</template>
				</el-table-column>
				<el-table-column prop="id" show-overflow-tooltip label="序号" width="60" />
				<el-table-column prop="title" label="标题(藏品昵称)" width="140" show-overflow-tooltip />
				<el-table-column prop="cover" label="封面" width="120">
					<template #default="scope">
						<div v-if="scope.row.cover?.url">
							<el-image :src="scope.row.cover?.url + '?x-oss-process=image/format,webp'"
								:alt="scope.row.name" fit="cover" style="width: 60px; height: 60px; border-radius: 10%"
								:preview-src-list="[scope.row?.cover?.url+ '?x-oss-process=image/format,webp']" preview-teleported />
						</div>
						<div v-else>-</div>
					</template>
				</el-table-column>
				<el-table-column prop="category.name" label="物品类型" width="100" show-overflow-tooltip />
				<el-table-column prop="order.id" label="所属订单" width="100" show-overflow-tooltip />
				<el-table-column prop="condition" label="品相" width="100" show-overflow-tooltip />
				<!-- <el-table-column prop="dynasty" label="朝代" width="100" show-overflow-tooltip /> -->
				<el-table-column prop="result" label="鉴定结果" width="100" />
				<el-table-column prop="price" label="一口价" width="100"
					:formatter="(row: any) => row.price ? row.price + '元' : ''" />
				<el-table-column prop="client" label="委托人" width="120" show-overflow-tooltip />

				<el-table-column prop="" label="估值(单位: 元)" show-overflow-tooltip>
					<template #default="scope">
						<div style="display: flex;">
							<div v-if="scope.row.min_estimate != null">
								{{ scale2Format(Number(scope.row.min_estimate) / 100) }}
							</div>
							<div v-else>未知</div>
							&nbsp;{{ '~' }}&nbsp;
							<div v-if="scope.row.max_estimate != null">
								{{ scale2Format(Number(scope.row.max_estimate) / 100) }}
							</div>
							<div v-else>未知</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="reason" label="无法估值原因" show-overflow-tooltip width="140" />
				<el-table-column prop="describe" label="描述" show-overflow-tooltip />
				<el-table-column label="操作" width="200" fixed="right">
					<template #default="scope">
						<div class="buttonAggregate" v-if="props.category_id == 0">
							<el-button size="small" text type="primary"
								@click="openDialogCurdFormRef(scope.row)">编辑</el-button>
							<el-button size="small" text type="primary" @click="onDel(scope.row)">删除</el-button>
						</div>
						<div class="buttonAggregate" v-else>
							<el-button v-if="!scope.row?.order?.id" size="small" text type="primary"
								@click="openDialogCurdFormRef(scope.row)">编辑</el-button>
							<el-button v-if="!scope.row?.order?.id" size="small" text type="primary"
								@click="onDel(scope.row)">删除</el-button>
							<el-button v-else size="small" text type="danger" disabled>请在对应订单中操作</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<template #footer>
				<el-pagination v-if="tableData.data.length > 0" @size-change="onHandleSizeChange"
					@current-change="onHandleCurrentChange" :pager-count="5" :page-sizes="[10, 30, 50]"
					v-model:current-page="tableData.param.pageNum" background
					v-model:page-size="tableData.param.pageSize" layout="total, sizes, prev, pager, next, jumper"
					:total="tableData.total">
				</el-pagination>
			</template>
		</el-card>
		<el-dialog :title="dialog.title" v-model="dialog.isShowDialog" width="65%">
			<el-form ref="productFormRef" :model="dialog.ruleForm" size="default" label-width="auto"
				:rules="dialog.rules">
				<el-row :gutter="50">
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="物品类型" prop="category_category">
							<el-select v-model="dialog.ruleForm.category_category" placeholder="请选择物品类型" size="default"
								disabled>
								<el-option v-for="item in tableData.categoryData" :key="item.id" :label="item.name"
									:value="item.id" />
							</el-select>
						</el-form-item>
						<!-- <el-form-item label="朝代" prop="dynasty">
							<el-input v-model="dialog.ruleForm.dynasty" type="text" placeholder="请输入朝代" clearable />
						</el-form-item> -->
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="标题(藏品昵称)" prop="title">
							<el-input v-model="dialog.ruleForm.title" type="text" placeholder="请输入标题(藏品昵称)" clearable />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="品相/规格" prop="condition">
							<el-input v-model="dialog.ruleForm.condition" type="text" placeholder="请输入品相/规格"
								clearable />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="委托人" prop="client">
							<el-autocomplete v-model="dialog.ruleForm.client" :fetch-suggestions="querySearchAsync"
								placeholder="请输入委托人名称" @select="handleSelect" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="鉴定时间" prop="appraisal_time">
							<el-date-picker v-model="dialog.ruleForm.appraisal_time" type="datetime"
								placeholder="请选择鉴定时间" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="鉴定结果" prop="result">
							<el-radio-group v-model="dialog.ruleForm.result" class="ml-4">
								<el-radio value="鉴定为真">鉴定为真</el-radio>
								<el-radio value="鉴定为假">鉴定为假</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="一口价(单位:元)" prop="price">
							<el-input-number placeholder="请输入价格" v-model="dialog.ruleForm.price" :precision="2"
								:min="0.00" type="number" style="min-width: 220px;" />
						</el-form-item>
					</el-col>

					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="估值(单位: 元)" prop="">
							<el-tooltip class="box-item" effect="dark" content="已填写无法估值,清空无法估值原因可恢复填写"
								placement="bottom" :disabled="!openInput">
								<div style="display: flex; flex-direction: row">
									<el-input-number placeholder="最小估值" v-model="dialog.ruleForm.min_estimate"
										:precision="2" :min="0.00" :disabled="openInput" type="number" />
									<div style="margin-right: 10px; margin-left: 10px">~</div>
									<el-input-number :min="0.00" :disabled="openInput" placeholder="最大估值"
										v-model="dialog.ruleForm.max_estimate" :precision="2" type="number" />
								</div>
							</el-tooltip>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="版权数字证书备案" prop="is_certificate">
							<el-switch v-model="dialog.ruleForm.is_certificate" active-text="是" inactive-text="否" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="无法估值原因" prop="reason">
							<el-input @change="changeReason(dialog.ruleForm.reason)" v-model="dialog.ruleForm.reason"
								type="text" placeholder="请输入无法估值原因" clearable />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="评价" prop="describe">
							<el-input v-model="dialog.ruleForm.describe" type="textarea" placeholder="请输入评价"
								clearable />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="鉴定师" prop="nickname">
							<el-autocomplete v-model="dialog.ruleForm.nickname" :fetch-suggestions="querySearchAsync"
								placeholder="请输入鉴定师名称" @select="handleSelect" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="鉴定师头像" prop="img">
							<div :class="dialog.imgList.length != 0 ? 'cardImage_one' : ''">
								<el-upload v-model:file-list="dialog.imgList" ref="upimage" action="#" :limit="1"
									:auto-upload="true" list-type="picture-card" :http-request="beforeLicenseHandle"
									:before-upload="async (file: any) => await beforeImageUpload(file, dialog, 'img')"
									:on-remove="async (file: any) => await beforeImageRemove(file, dialog, 'img')"
									:on-preview="handlePictureCardPreview"
									:on-exceed="(file: any) => handleExceedMsg('最大可上传数量为1')" :accept="ImgType.join(',')"
									style="width: 100%">
									<el-icon class="avatar-uploader-icon">
										<Plus />
									</el-icon>
								</el-upload>
							</div>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="上传鉴定图片" prop="product_appraisal_details_annex_img">
							<el-upload v-model:file-list="dialog.fileList" ref="upimage" action="#" :limit="9"
								:auto-upload="true" list-type="picture-card" :http-request="beforeLicenseHandle"
								:before-upload="async (file: any) => await beforeImageUpload(file, dialog, 'product_appraisal_details_annex_img')"
								:on-remove="async (file: any) => await beforeImageRemove(file, dialog, 'product_appraisal_details_annex_img')"
								:on-preview="handlePictureCardPreview"
								:on-exceed="(file: any) => handleExceedMsg('最大可上传数量为9')" :accept="ImgType.join(',')"
								style="width: 100%" multiple>
								<el-icon class="avatar-uploader-icon">
									<Plus />
								</el-icon>
							</el-upload>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="上传鉴定文件" prop="product_appraisal_details_annex_file">
							<el-upload v-model:file-list="dialog.pdfList" ref="upfile" action="#" :limit="9"
								:auto-upload="true" :http-request="beforeLicenseHandle"
								:before-upload="async (file: any) => await beforeFileUpload(file, dialog, 'product_appraisal_details_annex_file')"
								:on-remove="async (file: any) => await beforeImageRemove(file, dialog, 'product_appraisal_details_annex_file')"
								:on-preview="downloadFile" :on-exceed="(file: any) => handleExceedMsg('最大可上传数量为9')"
								:accept="fileType.join(',')" style="width: 100%" multiple>
								<template #trigger>
									<el-button type="primary">上传pdf文件</el-button>
								</template>
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

<script setup lang="ts" name="product">
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import type { FormInstance, FormRules, UploadProps } from 'element-plus';
import { product, category, user_role } from '/@/api/index';
import rules from './rules';
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
const productFun = product();
const categoryFun = category();
const userFun = user_role();
const upimage = ref();
const upfile = ref();
const dialogImageUrl = ref('');
const dialogVisible = ref(false);
const openInput = ref(false);
const loading = ref(false)
// 引入组件
// const image = defineAsyncComponent(() => import('/@/components/image/index.vue'));

//定义接收参数
const props = defineProps({
	category_id: {
		type: Number,
		default: 0,
	},
	category_name: {
		type: String,
		default: '',
	},
	order_id: {
		type: Number,
		default: 0,
	},
	order_type: {
		type: String,
		default: '',
	}
});

// 定义变量内容
const productFormRef = ref<FormInstance>();
const dialog = reactive({
	isShowDialog: false,
	row: <any>{},
	type: '',
	rules: rules,
	fileList: <any>[],
	imgList: <any>[],
	pdfList: <any>[],
	title: '',
	submitTxt: '',
	dialogImageUrl: '',
	ruleForm: <any>{
		id: 0,
		category_category: 0,
		condition: '',
		title: '',
		result: '',
		describe: '',
		reason: '',
		client: '',
		is_certificate: false,
		appraisal_time: '',
		min_estimate: null,
		max_estimate: null,
		product_appraisal_details_annex_img: [],
		product_appraisal_details_annex_file: [],
		img: ''
	},
});
const tableData = reactive(<any>{
	loading: false,
	search: '',
	resultSearch: '',
	vip: '',
	data: [],
	total: 0,
	param: {
		pageNum: 1,
		pageSize: 10,
	},
	time: '',
	categoryData: [],
	resultData: [
		{ name: '鉴定为真', id: 1 },
		{ name: '鉴定为假', id: 2 }
	],
	userList: []
});

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
	dialogImageUrl.value = uploadFile.url!;
	dialogVisible.value = true;
};

const changeReason = (res: any) => {
	if (!res) {
		openInput.value = false;
	} else {
		openInput.value = true;
		dialog.ruleForm.min_estimate = null;
		dialog.ruleForm.max_estimate = null;
	}
}

const downloadFile: UploadProps['onPreview'] = (uploadFile) => {
	window.open(uploadFile.url, '_blank');
}

// 重置按钮
const getTableReset = () => {
	tableData.search = "";
	tableData.resultSearch = "";
	getTableData();
}

// 查询方法
const getTableData = async () => {
	tableData.loading = true;
	const { list, total_size } = await productFun.get(
		{
			page_index: tableData.param.pageNum,
			page_size: tableData.param.pageSize,
			order_by: { __enum_keys: { id: 'desc_nulls_last' } },
			where: {
				category_category: props.category_id == 0 ? tableData.search ? { _eq: tableData.search } : {} : { _eq: props.category_id },
				result: tableData.resultSearch ? { _ilike: `%${tableData.resultSearch}%` } : {},
				order_order: props.order_id == 0 ? {} : { _eq: props.order_id }
			},
		},
		{}
	);
	tableData.data = list;
	tableData.total = total_size;
	tableData.loading = false;
};

const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
	let results = tableData.userList;
	results = queryString ? results.filter(createFilter(queryString)) : results
	cb(results)
}

const createFilter = (queryString: string) => {
	return (item: { value: string; }) => {
		return item?.value?.toLowerCase().includes(queryString.toLowerCase())
	}
}

const handleSelect = (item: Record<string, any>) => {
	console.log(item)
}

// 查询鉴定师方法
const getUser = async () => {
	const { list } = await userFun.get(
		{
			order_by: { __enum_keys: { id: 'desc_nulls_last' } },
			where: {
				// role_role: { _eq: 7 }
			},
		},
		{}
	);
	tableData.userList = list.map((res: any) => {
		return {
			value: res?.user?.nickname,
		};
	});
};

//获取物品类型
const getcategoryList = async () => {
	const { list } = await categoryFun.get(
		{
			order_by: { __enum_keys: { idx: 'asc_nulls_last' } },
			where: {},
		},
		{}
	);
	tableData.categoryData = list;
};

//初始化
const openDialogCurdFormRef = (row: any = {}) => {
	getUser();
	if (productFormRef.value) productFormRef.value.resetFields();
	dialog.row = row;
	dialog.type = row.id ? 'edit' : 'add';
	dialog.title = row.id ? '编辑' : '新增';
	dialog.submitTxt = row.id ? '修 改' : '新 增';
	dialog.ruleForm = JSON.parse(JSON.stringify(row));
	dialog.fileList = [];
	dialog.pdfList = [];
	dialog.imgList = [];
	openInput.value = false;
	if (row?.id) {
		dialog.ruleForm.category_category = row.category.id;
		dialog.ruleForm.min_estimate = dialog.ruleForm.min_estimate / 100;
		dialog.ruleForm.max_estimate = dialog.ruleForm.max_estimate / 100;
		if (dialog.ruleForm.reason) { openInput.value = true; }
		dialog.ruleForm["img"] = row.avatar?.id;
		dialog.imgList.push(row.avatar)
		let image = [];
		let file = [];
		for (let i = 0; i < row?.product_appraisal_details_annex.length; i++) {

			if (row?.product_appraisal_details_annex[i]?.img) {
				dialog.fileList.push(row?.product_appraisal_details_annex[i].img)
				image.push(row?.product_appraisal_details_annex[i].img.id);
			} else if (row?.product_appraisal_details_annex[i]?.file) {
				dialog.pdfList.push(row?.product_appraisal_details_annex[i].file)
				file.push(row?.product_appraisal_details_annex[i].file.id);
			}
		}
		dialog.ruleForm["product_appraisal_details_annex_img"] = image;
		dialog.ruleForm["product_appraisal_details_annex_file"] = file;
	} else {
		if (props.order_id != 0) {
			dialog.ruleForm.category_category = props.order_type ? tableData.categoryData.find((res: any) => res.name === props.order_type)?.id : '';
			dialog.ruleForm.order_order = props.order_id == 0 ? '' : props.order_id;
		}
		if (props.category_id != 0) {
			dialog.ruleForm.category_category = props.category_id;
		}
		const { image, file, video, attach_data = {}, product_appraisal_details_annex = [], img = '', ..._set } = row;
		dialog.ruleForm["product_appraisal_details_annex_img"] = product_appraisal_details_annex || [];
		dialog.ruleForm["product_appraisal_details_annex_file"] = product_appraisal_details_annex || [];
		dialog.ruleForm["img"] = img || '';
	}
	dialog.isShowDialog = true;
};

// 取消
const onCancel = () => {
	dialog.isShowDialog = false;
	if (!productFormRef.value) return;
	productFormRef.value.resetFields();
	dialog.fileList = [];
	dialog.pdfList = [];
	dialog.imgList = [];
	dialog.ruleForm["img"] = '';
};

//提交
const onSubmit = () => {
	if (!productFormRef.value) return;
	productFormRef.value.validate((valid: any) => {
		if (valid) {
			if (dialog.ruleForm.product_appraisal_details_annex_img.length < 5) {
				return ElMessage({ type: 'info', message: '鉴定图片上传不足5张' })
			}
			if (dialog.pdfList.length == 0) {
				return ElMessage({ type: 'info', message: '请上传鉴定文件' })
			}
			if (dialog.type === 'add') onAdd(dialog.ruleForm);
			if (dialog.type === 'edit') onUpd(dialog.ruleForm);
		}
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
			if (ruleForm.reason) {
				ruleForm.min_estimate = null;
				ruleForm.max_estimate = null;
			} else {
				ruleForm.min_estimate = ruleForm.min_estimate * 100;
				ruleForm.max_estimate = ruleForm.max_estimate * 100;
			}
			delete ruleForm.id;
			const { id, product_appraisal_details_annex_img, img, product_appraisal_details_annex_file, ..._set } = ruleForm;
			const product_appraisal_details_annex = product_appraisal_details_annex_img.map((res: any) => { return { img_id: res, dir: '图片' } });
			const annexFile = dialog.pdfList.map((res: any) => { return { file_id: res.raw.fileId, dir: '报告/证书' } });
			await productFun.inc(
				{
					..._set,
					// category_category: tableData.categoryData.find((res: any) => res.name === category_category).id,
					avatar_id: img,
					cover_id: product_appraisal_details_annex_img.find((res: any) => res),
					product_appraisal_details_annex: {
						data: [...product_appraisal_details_annex, ...annexFile]
					}
				}, {})
				.then(() => {
					ElMessage({
						type: 'success',
						message: '添加成功！',
					});
					getTableData();
				})
				.catch(() => {
					ElMessage({
						type: 'error',
						message: '添加失败！',
					});
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
	ElMessageBox.confirm('确认修改该数据吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			ruleForm.min_estimate = ruleForm.min_estimate * 100;
			ruleForm.max_estimate = ruleForm.max_estimate * 100;
			const { id, avatar, img, category_category, order_order, category, order, product_appraisal_details_annex_img, product_appraisal_details_annex_file, product_appraisal_details_annex, ..._set } = ruleForm;
			const annexFile = [];
			for (let i = 0; i < dialog.pdfList.length; i++) {
				if (dialog.pdfList[i]?.raw) { annexFile.push(dialog.pdfList[i]?.raw.fileId) }
				else { annexFile.push(dialog.pdfList[i]?.id) }
			}
			await productFun.updateProduct(
				{
					id: id,
					form: _set,
					avatar_id: img,
					cover_id: product_appraisal_details_annex_img.find((res: any) => res),
					annexImg: product_appraisal_details_annex_img,
					annexFile: annexFile
				}
			).then(() => {
				ElMessage({
					type: 'success',
					message: '修改成功！',
				});
				getTableData();
			}).catch(() => {
				ElMessage({
					type: 'error',
					message: '修改失败！',
				});
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

//删除
const onDel = (row: any) => {
	ElMessageBox.confirm('此操作将永久删除该数据, 是否继续?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			await productFun.del(row.id, true, {}).then(() => {
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
	getcategoryList();
});

const scale2Format = (value: string = '0') => {
	return Number.parseFloat(value).toFixed(2);
};
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

.cardImage_one {

	:deep(.el-upload),
	:deep(.el-upload--picture-card) {
		display: none;
	}

	// 	:deep(.el-upload-list__item-status-label) {
	// 		opacity: 0;
	// 	}
}
</style>