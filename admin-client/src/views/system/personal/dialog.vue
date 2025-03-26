<template>
	<div class="system-role-dialog-container">
		<el-dialog :title="dialog.title" v-model="dialog.isShowDialog" width="30%">
			<!-- <el-form ref="roleDialogFormRef" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="密码" label-width="auto">
							<el-input v-model="state.ruleForm.password" type="password" placeholder="请输入密码"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form> -->
			<el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" status-icon :rules="rules"
				label-width="auto" class="demo-ruleForm">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="密码" prop="pass">
							<el-input v-model="ruleForm.pass" type="password" autocomplete="off" placeholder="请输入密码" show-password> </el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="确认密码" prop="checkPass">
							<el-input v-model="ruleForm.checkPass" type="password" autocomplete="off" placeholder="请确认密码" show-password> </el-input>
						</el-form-item>
					</el-col>
				</el-row>


			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="resetForm(ruleFormRef)">取 消</el-button>
					<el-button type="primary" @click="submitForm(ruleFormRef)">{{ dialog.submitTxt }}</el-button>

					<!-- <el-button @click="onCancel" >取 消</el-button>
					<el-button type="primary" @click="onSubmit" size="default"></el-button> -->
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="systemRoleDialog">
import { FormInstance, FormRules } from 'element-plus';
import { reactive, ref } from 'vue';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const ruleFormRef = ref();
const ruleForm = reactive({
	pass: '',
	checkPass: '',
})
const dialog = reactive({
	isShowDialog: false,
	type: '',
	title: '',
	submitTxt: '',
});

const valiPass = (value: any, callback: any) => {
	if (value.length < 6) {
		return '密码长度不能小于6位'

	} else if (value === '') {
		return '请输入密码'
	}
	return ""
}

const validatePass = (rule: any, value: any, callback: any) => {
	const isValiPass = valiPass(value, callback);
	if (isValiPass) {
		callback(new Error(isValiPass))
	} else {
		if (ruleForm.checkPass !== '') {
			if (!ruleFormRef.value) return
			ruleFormRef.value.validateField('checkPass', () => null)
		}
		callback()
	}
}
const validatePass2 = (rule: any, value: any, callback: any) => {
	const isValiPass = valiPass(value, callback);
	if (isValiPass) {
		callback(new Error(isValiPass))
	} else if (value !== ruleForm.pass) {
		callback(new Error("密码不一致!"))
	} else {
		callback()
	}
}

const rules = reactive<FormRules<typeof ruleForm>>({
	pass: [{ validator: validatePass, trigger: 'blur' }],
	checkPass: [{ validator: validatePass2, trigger: 'blur' }],
})
const submitForm = (formEl: FormInstance | undefined) => {
	if (!formEl) return
	formEl.validate((valid) => {
		if (valid) {
			onSubmit()
		} else {
			console.log('error submit!')
			return false
		}
	})
}
const resetForm = (formEl: FormInstance | undefined) => {
	if (!formEl) return
	formEl.resetFields();
	onCancel()
}
// 打开弹窗
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const openDialog = (type: string, row: RowRoleType) => {
	dialog.title = '修改密码';
	dialog.submitTxt = '确定';
	dialog.isShowDialog = true;
};
// 关闭弹窗
const closeDialog = () => {
	ruleForm.pass = '';
	ruleForm.checkPass = '';
	dialog.isShowDialog = false;
};
// 取消
const onCancel = () => {
	closeDialog();
};
// 提交
const onSubmit = () => {
	emit('refresh', ruleForm.pass);
	closeDialog();
};
// 暴露变量
defineExpose({
	openDialog,
});
</script>

<style scoped lang="scss">
.system-role-dialog-container {
	.menu-data-tree {
		width: 100%;
		border: 1px solid var(--el-border-color);
		border-radius: var(--el-input-border-radius, var(--el-border-radius-base));
		padding: 5px;
	}
}
</style>
