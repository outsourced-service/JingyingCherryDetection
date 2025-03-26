<template>
	<div class="system-dept-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="769px">
			<el-form ref="deptDialogFormRef" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="权限名称">
							<el-input v-model="state.ruleForm.name" placeholder="请输入权限名称" clearable></el-input>
						</el-form-item>
					</el-col>

					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="权限描述">
							<el-input v-model="state.ruleForm.describe" type="textarea" placeholder="请输入权限描述" maxlength="150"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit" size="default">{{ state.dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="systemDeptDialog">
import { reactive, ref, computed } from 'vue';
import { usePermissionApi } from '/@/api/system/index';
import { cloneDeep } from 'lodash-es';
const PermissionApi = usePermissionApi();
// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const deptDialogFormRef = ref();
const getDeptAdd = computed(() => state.dialog.type === 'add');
const getDeptEdit = computed(() => state.dialog.type === 'edit');

const state = reactive({
	ruleForm: {
		id: null,
		name: '', // 权限名称
		describe: '', // 权限描述
	},
	deptData: [] as DeptTreeType[], // 权限数据
	dialog: {
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

// 打开弹窗
const openDialog = (type: string, row: object) => {
	state.dialog.type = type;
	if (type === 'edit') {
		state.ruleForm = cloneDeep(row);
		state.dialog.title = '修改权限';
		state.dialog.submitTxt = '修 改';
	} else {
		state.ruleForm = {};
		state.dialog.title = '新增权限';
		state.dialog.submitTxt = '新 增';
	}
	state.dialog.isShowDialog = true;
};
// 关闭弹窗
const closeDialog = () => {
	state.dialog.isShowDialog = false;
};
// 取消
const onCancel = () => {
	closeDialog();
};
// 提交
const onSubmit = async () => {
	closeDialog();
	if (getDeptAdd.value) {
		await PermissionApi.useAddPermission(state.ruleForm);
	}

	if (getDeptEdit.value) {
		await PermissionApi.useEditPermission({
			...state.ruleForm,
			per_pk: state.ruleForm.id,
		});
	}
	await emit('refresh');
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>
