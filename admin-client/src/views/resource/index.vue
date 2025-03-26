<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto" style="height: 100%" body-class="el-card-tabel">
			<template #header>
				<div class="system-menu-search align-center">
					<span class="ml10" style="white-space: nowrap">名称：</span>
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
					<el-select
						v-model="tableData.type"
						size="default"
						class="ml10"
						placeholder="选择类型"
						@change="getTableData"
						style="max-width: 180px"
						clearable
					>
						<el-option v-for="item in tableData.optionsSelectAll" :key="item" :label="item" :value="item" />
					</el-select>
					<el-button size="default" type="primary" class="ml10" @click="getTableData">
						<el-icon>
							<ele-Search />
						</el-icon>
						查询
					</el-button>
					<!-- <el-button size="default" type="" class="ml10" @click="getTableReset">
						<el-icon>
							<ele-Refresh />
						</el-icon>
						重置
					</el-button> -->
					<el-button size="default" type="success" class="ml10" @click="openDialogCurdFormRef({})">
						<el-icon>
							<ele-FolderAdd />
						</el-icon>
						新增
					</el-button>
				</div>
			</template>
			<el-table :data="tableData.data" v-loading="tableData.loading" height="100%" style="width: 100%">
				<el-table-column prop="id" label="序号" width="60" />
				<el-table-column prop="updated_at" label="更新时间" width="120">
					<template #default="scope">
						{{ new Date(scope.row.updated_at).toLocaleString() }}
					</template>
				</el-table-column>
				<el-table-column prop="dir" label="资源目录" width="120" show-overflow-tooltip />
				<el-table-column prop="name" label="资源名称" width="160" show-overflow-tooltip />
				<el-table-column prop="title" label="配置标题" width="180" show-overflow-tooltip />
				<el-table-column prop="text" label="内容" :show-overflow-tooltip="true" min-width="340px">
					<template #default="scope">
						<div v-if="scope.row.resource_type === '图片'">
							<div class="flex-row">
								<el-image
									:src="scope.row.img?.url"
									:alt="scope.row.name"
									fit="cover"
									style="width: 60px; height: 60px"
									:preview-src-list="[scope.row?.img?.url]"
									preview-teleported
								/>
							</div>
						</div>
						<!-- <div v-if="scope.row.resource_type === '文件'">
							<span v-if="scope.row.file">
								<a :href="scope.row.file.url" target="_blank">{{ scope.row.text || scope.row.title }}</a>
							</span>
							<div v-else>暂无内容</div>
						</div> -->
						<!-- <div v-if="scope.row.resource_type === '开关'">
							<el-switch v-model="scope.row.attach_data.switch" class="ml-2" disabled />
						</div>
						<div v-if="scope.row.resource_type === '时间范围'">
							<div class="flex-row">
								<el-time-picker v-model="scope.row.attach_data.timeFrame[0]" placeholder="开始时间" disabled />
								<el-text class="ml10 mr10">To</el-text>
								<el-time-picker v-model="scope.row.attach_data.timeFrame[1]" placeholder="结束时间" disabled />
							</div>
						</div> -->
						<div v-if="scope.row.mode === '百分比'">
							<el-text class="mx-1" type="primary" v-if="scope.row.text">{{ scope.row.text }}%</el-text>
							<div v-else>暂未设置</div>
						</div>
						<div v-else-if="scope.row.mode === '固定（人民币：元）'">
							<el-text v-if="scope.row.text">{{ Number(scope.row.text) / 100 }} 元</el-text>
							<div v-else>暂未设置</div>
						</div>
					</template>
				</el-table-column>

				<!-- <el-table-column prop="resource_type" label="类型" width="80" />
				<el-table-column prop="name" label="名称" show-overflow-tooltip />
				<el-table-column prop="dir" label="分类目录" />

				<el-table-column prop="" label="附件" show-overflow-tooltip>
					<template #default="scope">
						<el-text v-if="scope.row.file?.url" :truncated="true">
							<el-link :href="scope.row.file?.url" type="primary" target="_blank">{{ scope.row.file?.url }}</el-link>
						</el-text>
						<video v-else-if="scope.row.video?.url" :poster="scope.row?.img?.url" width="180px" height="120px" id="upvideo" controls>
							<source :src="scope.row?.video?.url" />
						</video>
						<div v-else-if="scope.row.img?.url">
							<el-image
								:src="scope.row.img?.url"
								:alt="scope.row.name"
								fit="cover"
								style="width: 60px; height: 60px"
								:preview-src-list="[scope.row?.img?.url]"
								preview-teleported
							/>
						</div>
						<div v-else>-</div>
					</template>
				</el-table-column>

				<el-table-column prop="idx" label="排序" width="60" />
				<el-table-column prop="title" label="标题" />
				<el-table-column prop="text" label="文本内容/描述" show-overflow-tooltip />
				<el-table-column prop="attach_data.appid" label="小程序appid" show-overflow-tooltip />
				<el-table-column prop="path" label="跳转路径" show-overflow-tooltip /> -->

				<el-table-column label="操作" width="160" fixed="right">
					<template #default="scope">
						<el-button size="small" text type="primary" @click="openDialogCurdFormRef(scope.row)">编辑</el-button>
						<el-button v-if="!scope.row.is_not_deleted" size="small" text type="primary" @click="onDel(scope.row)">删除</el-button>
						<el-button v-else size="small" text type="danger" disabled>不可删除</el-button>
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
		<el-dialog :title="dialog.title" v-model="dialog.isShowDialog" width="60%">
			<el-form ref="resourceFormRef" :model="dialog.ruleForm" size="default" label-width="auto" :rules="dialog.rules">
				<el-row :gutter="50">
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="分类目录" prop="dir">
							<el-select v-model="dialog.ruleForm.dir" size="default" placeholder="选择分类目录" @change="getselect" allow-create disabled>
								<el-option v-for="item in tableData.optionsDirSelectAll" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="类型" prop="resource_type">
							<el-select v-model="dialog.ruleForm.resource_type" size="default" placeholder="选择类型" @change="getselect" disabled>
								<el-option v-for="item in tableData.optionsSelectAll" :key="item" :label="item" :value="item" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="名称" prop="name">
							<el-input
								v-model="dialog.ruleForm.name"
								type="text"
								placeholder="请输入名称"
								:disabled="!['图片'].includes(dialog.ruleForm.resource_type)"
							/>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="标题" prop="title">
							<el-input v-model="dialog.ruleForm.title" type="text" placeholder="请输入标题" />
						</el-form-item>
					</el-col>
					<el-col v-if="['图片'].includes(dialog.ruleForm.resource_type)" :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="排序" prop="idx">
							<el-input v-model="dialog.ruleForm.idx" type="number" placeholder="请输入排序" />
						</el-form-item>
					</el-col>
					<el-col v-if="dialog.ruleForm.resource_type === '文本'" :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="内容/描述" prop="text">
							<el-input v-model="dialog.ruleForm.text" type="textarea" placeholder="请输入文本内容/描述" rows="4" />
						</el-form-item>
					</el-col>
					<el-col v-if="!['文本', '图片'].includes(dialog.ruleForm.resource_type)" :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="分销模式" prop="mode">
							<el-select
								v-model="dialog.ruleForm.mode"
								placeholder="请选择分销模式"
								size="default"
								:disabled="dialog.ruleForm.resource_type === '推荐佣金分销配置' || dialog.ruleForm.resource_type === '金额'"
							>
								<el-option
									v-for="item in tableData.optionsModeAll"
									:key="item.value"
									:label="item.label"
									:value="item.value"
								/>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col v-if="!['文本', '图片'].includes(dialog.ruleForm.resource_type) && dialog.ruleForm.mode === '固定（人民币：元）'" :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item :label="dialog.ruleForm.title" prop="text">
							<el-input-number placeholder="请输入金额" v-model="dialog.ruleForm.text"
								:precision="2" :min="0.00" type="number"/>
							<div style="margin-left: 10px">元</div>
						</el-form-item>
					</el-col>
					<el-col v-if="!['文本', '图片'].includes(dialog.ruleForm.resource_type) && dialog.ruleForm.mode === '百分比'" :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item :label="dialog.ruleForm.title" prop="text">
							<el-input @change="handleNumber(dialog.ruleForm)" v-model="dialog.ruleForm.text" type="number" placeholder="请输入百分比比例,最低为0," min="0" max="100" ><template #append>%</template></el-input>
						</el-form-item>
					</el-col>
					<el-col v-if="!['文本', '会员配置'].includes(dialog.ruleForm.resource_type)" :xs="24" :sm="24" :md="24" :lg="24" :xl="12" class="mb20">
						<el-form-item v-if="dialog.ruleForm.resource_type === '图片'" label="图片" prop="img_id">
							<el-upload
								v-model:file-list="dialog.fileList"
								ref="upimage"
								action="#"
								:limit="1"
								:auto-upload="true"
								list-type="picture-card"
								:http-request="beforeLicenseHandle"
								:before-upload="async (file: any) => await beforeImageUpload(file, dialog)"
								:on-remove="() => (dialog.ruleForm.img_id = null)"
								:on-preview="handlePictureCardPreview"
								:on-exceed="(file: any) => handleExceed(upimage, file, 'image', dialog)"
								:accept="ImgType.join(',')"
								style="width: 100%"
							>
								<el-icon class="avatar-uploader-icon">
									<Plus />
								</el-icon>
							</el-upload>
						</el-form-item>
						<el-form-item v-else-if="dialog.ruleForm.resource_type === '文件'" label="文件" prop="file_id">
							<el-upload
								v-model:file-list="dialog.fileList"
								ref="upfile"
								action="#"
								:limit="1"
								:http-request="beforeLicenseHandle"
								:auto-upload="true"
								:on-remove="() => (dialog.ruleForm.file_id = null)"
								:before-upload="async (file: any) => await beforeFileUpload(file, dialog)"
								:on-exceed="(file: any) => handleExceed(upfile, file, 'file', dialog)"
								:accept="fileType.join(',')"
								style="width: 100%"
							>
								<!--:on-progress="progressUpload"  -->
								<el-button type="primary">上传文件</el-button>
								<template #tip>
									<div class="el-upload__tip">建议上传pdf文件.</div>
								</template>
							</el-upload>
						</el-form-item>
						<el-form-item v-else-if="dialog.ruleForm.resource_type === '视频'" label="视频" prop="video_id">
							<el-upload
								v-model:file-list="dialog.fileList"
								ref="upvideo"
								action="#"
								:limit="1"
								:http-request="beforeLicenseHandle"
								:auto-upload="true"
								:on-remove="() => (dialog.ruleForm.video_id = null)"
								:before-upload="async (file: any) => await beforeVideoUpload(file, dialog)"
								:on-exceed="(file: any) => handleExceed(upvideo, file, 'video', dialog)"
								:accept="videoType.join(',')"
								style="width: 100%"
							>
								<!--:on-progress="progressUpload"  -->
								<el-button type="primary">上传视频</el-button>
								<template #tip>
									<div class="el-upload__tip">建议上传60MB以下得视频.</div>
								</template>
								<template #file="{ file }">
									<video :src="dialog.dialogImageUrl" width="100%" height="100%" class="videoshow" id="upvideo" controls></video>
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

<script setup lang="ts" name="resource">
/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable no-unused-vars */
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { resource } from '/@/api/index';
import type { FormInstance, FormRules, UploadProps } from 'element-plus';
import rules from './rules';
const curdFun = resource();
import upload from './upload';
const { beforeLicenseHandle, handleExceed, beforeVideoUpload, beforeImageUpload, beforeFileUpload, fileType, videoType, ImgType } = upload;

const upvideo = ref();
const upimage = ref();
const upfile = ref();
const dialogImageUrl = ref('');
const dialogVisible = ref(false);
// 定义变量内容
const resourceFormRef = ref<FormInstance>();
const tableData = reactive(<any>{
	loading: false,
	search: '',
	type: '',
	optionsSelectAll: ['图片', '文本', '会员配置'], //'文件', '视频',
	optionsDirSelectAll: [
		{
			value: '/首页/轮播图/',
			label: '/首页/轮播图/',
		},
	],
	optionsModeAll: [{
			value: '百分比',
			label: '百分比',
		},{
			value: '固定（人民币：元）',
			label: '固定（人民币：元）',
		},], //'百分比', '固定（人民币：元）',
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
	rules: rules,
	fileList: <any>[],
	dialogImageUrl: '',
	ruleForm: <any>{
		id: 0,
		resource_type: '',
		text: '',
		img_id: null,
		file_id: null,
		video_id: null,
	},
});
const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
	dialogImageUrl.value = uploadFile.url!;
	dialogVisible.value = true;
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
				name: tableData.search ? { _ilike: `%${tableData.search}%` } : {},
				is_variable: { _eq: true },
				resource_type: tableData.type ? { _ilike: `%${tableData.type}%` } : {},
			},
		},
		{}
	);
	tableData.data = list;
	tableData.total = total_size;
	tableData.loading = false;
};

// 重置按钮
const getTableReset = () => {
	tableData.search = '';
	tableData.type = '';
	getTableData();
};

const handleNumber = (form: any) => {
	if(form.text < 0) {
		dialog.ruleForm.text = 0;
	} else if(form.text > 100) {
		dialog.ruleForm.text = 100;
	}
}

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
			const { id, attach_data = {}, ...inc } = ruleForm;
			await curdFun
				.inc(
					{
						...inc,
						is_variable: true,
						attach_data,
					},
					{}
				)
				.then(() => {
					ElMessage({
						type: 'success',
						message: '添加成功',
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
			if(ruleForm.mode === '固定（人民币：元）') { ruleForm.text = String(ruleForm.text * 100) }
			const { id: ID, file, img, video, ..._set } = ruleForm;
			await curdFun
				.set(
					ID,
					{
						_set: _set,
					},
					{}
				)
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

const getselect = () => {
	dialog.fileList = [];
	dialog.ruleForm.img_id = null;
	dialog.ruleForm.file_id = null;
	dialog.ruleForm.video_id = null;
};
//初始化
const openDialogCurdFormRef = (row: any = {}) => {
	if (resourceFormRef.value) resourceFormRef.value.resetFields();
	dialog.row = row;
	dialog.type = row.id ? 'edit' : 'add';
	dialog.title = row.id ? '编辑' : '新增';
	dialog.submitTxt = row.id ? '修 改' : '新 增';
	dialog.ruleForm = JSON.parse(JSON.stringify(row));
	dialog.isShowDialog = true;
	dialog.fileList = [];
	const { img, file, video, attach_data = {}, ..._set } = row;
	dialog.ruleForm[`attach_data`] = { appid: null, ...attach_data };
	if (row?.id) {
		if(dialog.ruleForm.mode === '固定（人民币：元）') { dialog.ruleForm.text = Number(dialog.ruleForm.text / 100) }
		dialog.ruleForm[`img_id`] = img?.id;
		dialog.ruleForm[`file_id`] = file?.id;
		dialog.ruleForm[`video_id`] = video?.id;
		if (file?.url) dialog.fileList = [{ name: file?.url, url: file?.url }];
		if (img?.url) dialog.fileList = [{ name: img?.id, url: img?.url }];
		if (video?.url) {
			dialog.fileList = [{ name: video?.id, url: video?.url }];
			dialog.dialogImageUrl = video?.url;
		}
	} else {
		dialog.ruleForm[`dir`] = '/首页/轮播图/';
		dialog.ruleForm[`resource_type`] = '图片';
	}
};
// 取消
const onCancel = () => {
	dialog.isShowDialog = false;
	if (!resourceFormRef.value) return;
	resourceFormRef.value.resetFields();
};

const onSubmit = () => {
	if (!resourceFormRef.value) return;
	resourceFormRef.value.validate((valid: any) => {
		if (valid) {
			if (dialog.type === 'add') onAdd(dialog.ruleForm);
			if (dialog.type === 'edit') onUpd(dialog.ruleForm);
		}
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
});
</script>

<style scoped lang="scss"></style>
