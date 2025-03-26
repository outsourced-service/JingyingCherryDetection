<template>
	<div class="system-dept-dialog-container">
		<el-dialog :title="dialog.title" v-model="dialog.isShowDialog" width="769px" @close="closeDialog">
			<el-form ref="curdFormRef" :model="dialog.ruleForm" size="default" label-width="auto" :rules="rules">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="昵称" prop="nickname">
							<el-input v-model="dialog.ruleForm.nickname" placeholder="请输入昵称" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="手机号" prop="phone">
							<el-input v-model="dialog.ruleForm.phone" placeholder="请输入手机号" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col v-if="dialog.type === 'add'" :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="账户" prop="username">
							<el-input v-model="dialog.ruleForm.username" placeholder="请输入账户" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col v-if="dialog.type === 'add'" :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="账户密码" prop="password">
							<el-input v-model="dialog.ruleForm.password" placeholder="请输入账户初始密码" type="password"
								clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="配置角色" prop="role_pk">
							<el-select multiple v-model="dialog.ruleForm.role_pk" placeholder="请选择配置角色" size="default">
								<el-option v-for="item in dialog.typeOptions" :key="item.id" :label="item.name"
									:value="item.id" />
							</el-select>
						</el-form-item>
					</el-col>
					<!-- <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="配置企业" prop="company_company">
							<el-select v-model="dialog.ruleForm.company_company" placeholder="请选择企业" size="default">
								<el-option v-for="item in dialog.optionsSelectEnterpriseAll" :key="item.id"
									:label="item.name" :value="item.id" />
							</el-select>
						</el-form-item>
					</el-col> -->
					<!-- <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="后台登录" prop="is_login">
							<el-switch v-model="dialog.ruleForm.is_login" active-text="允许" inactive-text="不允许"
								:id="'add' + dialog.ruleForm?.id" />
						</el-form-item>
					</el-col> -->
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="头像" prop="avatar_id">
							<el-upload v-model:file-list="dialog.imageList" ref="upimage" action="#" :limit="1"
								:auto-upload="true" list-type="picture-card" :http-request="beforeLicenseHandle"
								:before-upload="async (file: any) => await beforeImageUpload(file, dialog, 'avatar_id')"
								:on-remove="() => dialog.ruleForm.avatar_id = null"
								:on-preview="handlePictureCardPreview"
								:on-exceed="(file: any) => handleExceed(upimage, file, 'image', dialog, 'avatar_id')"
								:accept="ImgType.join(',')" style="width: 100%;">
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
					<el-button @click="closeDialog" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit" size="default">{{ dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
		<el-dialog v-model="dialogVisible" width="fit-content">
			<img w-full :src="dialogImageUrl" alt="Preview Image" />
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="systemDeptDialog">
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import md5 from 'md5';
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import { useUserApi, useRoleApi } from '/@/api/system/index';
import rules from "./rules";
import upload from "./upload";
const { beforeLicenseHandle, handleExceed, beforeVideoUpload, beforeImageUpload, beforeFileUpload, fileType, videoType, ImgType } = upload
const RoleApi = useRoleApi();
const userApi = useUserApi();
// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const upimage = ref();
const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const curdFormRef = ref();
const dialog = reactive({
	isShowDialog: false,
	type: '',
	isAcction: false,
	typeOptions: <any>[],
	optionsSelectEnterpriseAll: <any>[],
	row: {},
	title: '',
	submitTxt: '',
	rules: rules,
	fileList: <any>[],
	imageList: <any>[],
	videoList: <any>[],

	dialogImageUrl: "",
	ruleForm: <any>{
		id: 0,
	},
});
const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
	dialogImageUrl.value = uploadFile.url!
	dialogVisible.value = true
}

// 新增
const onAdd = (ruleForm: any) => {
	ElMessageBox.confirm('确认新增该数据吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(async () => {
		await userApi.userRegistration({
			username: ruleForm.username,
			password: md5(ruleForm.password),
			phone: ruleForm.phone,
			nickname: ruleForm.nickname,
			avatar_id: ruleForm.avatar_id,
			is_login: ruleForm.is_login,
			role_pk: ruleForm.role_pk,
			company_pk: ruleForm.company_pk,
		}).then(() => {
			ElMessage({
				type: 'success',
				message: '注册成功',
			})
			emit('refresh');
		}).finally(() => {
			closeDialog();
		})
	}).catch(() => {
		ElMessage({
			type: 'info',
			message: '已取消',
		})
	})
}
// 修改
const onUpd = (ruleForm: any) => {
	ElMessageBox.confirm('确认修改当前数据吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(async () => {
		await userApi.userBaseInfo({
			manager_pk: ruleForm.id,
			// username:  ruleForm.username,
			// password: md5( ruleForm.password),
			phone: ruleForm.phone,
			nickname: ruleForm.nickname,
			avatar_id: ruleForm.avatar_id,
			is_login: ruleForm.is_login,
			role_pk: ruleForm.role_pk,
			company_company: ruleForm.company_company,

		}).then(() => {
			ElMessage({
				type: 'success',
				message: '修改成功',
			})
			emit('refresh');
		}).finally(() => {
			closeDialog();
		})
	}).catch(() => {
		ElMessage({
			type: 'info',
			message: '已取消修改',
		})
	})
}
//提交
const onSubmit = () => {
	curdFormRef.value.validate((valid: any) => {
		if (valid) {
			if (dialog.type === 'add') onAdd(dialog.ruleForm);
			if (dialog.type === 'edit') onUpd(dialog.ruleForm);
		}
	})
}
// 取消
const closeDialog = () => {
	dialog.isShowDialog = false;
	if (!curdFormRef.value) return
	curdFormRef.value.resetFields();
	dialog.ruleForm = {};
};
//初始化
const openDialog = (row: any) => {
	getType();
	if (curdFormRef.value) curdFormRef.value.resetFields();
	dialog.isShowDialog = true;
	dialog.type = row?.id ? "edit" : "add";
	dialog.title = row?.id ? "修改" : "新增";
	dialog.submitTxt = row?.id ? "修改" : "新增";
	dialog.imageList = [];
	dialog.row = row;
	const { avatar, manager_role, company, is_login = false, ...rowInfo } = row || {};
	dialog.ruleForm = { ...rowInfo, is_login: is_login, avatar_id: avatar?.id ?? null };
	if (avatar?.id) dialog.imageList = [{ name: avatar?.id, url: avatar?.url }]
	if (manager_role?.length > 0) dialog.ruleForm.role_pk = manager_role.map((res: any) => res.role?.id ?? null).filter((res: any) => res);
}
// 类型查询
const getType = async () => {
	await RoleApi.useRoleList({
		page_index: 1,
		page_size: 1000,
		where:{
			type:{_eq:"后台角色"},
			name: {_neq: "超级管理员" }
		}
	}).then((res: any) => {
		dialog.typeOptions = res.list;
	});
};
// 暴露变量
defineExpose({
	openDialog,
});
</script>
