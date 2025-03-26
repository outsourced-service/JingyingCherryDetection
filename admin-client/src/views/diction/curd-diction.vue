<template>
	<div class="system-user-dialog-container">
		<el-dialog v-model="dialog.isShowDialog" @close="closeDialog">
			<el-form ref="curdFormRef" :model="dialog.ruleForm" size="default" label-width="100px"
				:rules="dialog.rules">
				<el-row :gutter="50">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="词典名称" prop="name">
							<el-input v-model="dialog.ruleForm.name" type="text" placeholder="请输入词典名称" clearable :disabled="!!dialog.ruleForm?.id"/>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="词典描述" prop="describe">
							<el-input v-model="dialog.ruleForm.describe" type="textarea" placeholder="请输入词典描述"
								clearable />
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button size="default" @click="closeDialog">取 消</el-button>
					<el-button size="default" type="primary" @click="onSubmit">{{ dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="chatlogs">
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { diction } from '/@/api/index';
const curdFun = diction();
import rules from "./rules";

// 外部变量
const emit = defineEmits(['refresh'])
// 定义变量内容
const curdFormRef = ref();
const dialog = reactive({
	isShowDialog: false,
	row: <any>{},
	type: '',
	title: '',
	submitTxt: '',
	rules: rules.curdDiction,
	ruleForm: <any>{
		id: 0,
	},
});

const onSubmit = () => {
	curdFormRef.value.validate((valid: any) => {
		if (valid) {
			if (dialog.type === 'add') onAdd(dialog.ruleForm);
			if (dialog.type === 'edit') onUpd(dialog.ruleForm);
		}
	})
}
// 新增
const onAdd = (ruleForm: any) => {
	ElMessageBox.confirm('确认新增该词典吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(async () => {
		delete ruleForm.id;
		const { name, describe } = ruleForm
		await curdFun.inc({ name, describe }, {}).then(() => {
			ElMessage({
				type: 'success',
				message: '添加成功',
			})
			emit("refresh");
		}).finally(() => {
			closeDialog();
		})
	}).catch(() => {
		ElMessage({
			type: 'info',
			message: '已取消添加',
		})
	})
}
// 修改
const onUpd = (ruleForm: any) => {
	ElMessageBox.confirm('确认修改当前词典吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(async () => {
		const { id: ID, name, describe, ..._set } = ruleForm;
		await curdFun.set(ID, {
			_set: {
				name, describe
			}
		}, {}).then(() => {
			ElMessage({
				type: 'success',
				message: '修改成功',
			})
			emit("refresh");
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
// 打开弹窗
const openDialog = (row: any) => {
	dialog.row = row;
	dialog.type = row.id ? 'edit' : 'add';
	dialog.title = row.id ? '编辑' : '新增';
	dialog.submitTxt = row.id ? '修 改' : '新 增';
	dialog.ruleForm = JSON.parse(JSON.stringify(row));
	dialog.isShowDialog = true;
};
// 关闭弹窗
const closeDialog = () => {
	dialog.isShowDialog = false;
	if (!curdFormRef.value) return
	curdFormRef.value.resetFields();
	dialog.ruleForm = {};
};
// 新增
const add = () => {
};
// 暴露变量
defineExpose({
	openDialog,
});
</script>
