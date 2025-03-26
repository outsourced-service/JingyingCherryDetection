<template>
	<div class="system-role-dialog-container">
		<el-dialog v-model="dialog.isShowDialog" @close="closeDialog">
			<el-form ref="curdFormRef" :model="dialog.ruleForm" size="default" label-width="100px" :rules="dialog.rules">
				<el-row :gutter="20">
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12" class="mb20">
						<el-form-item label="角色名称" prop="name">
							<el-input v-model="dialog.row.name" type="text" placeholder="请输入名称" clearable disabled />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12" class="mb20">
						<el-form-item label="角色类型" prop="name">
							<el-input v-model="dialog.row.type" type="text" placeholder="请输入名称" clearable disabled />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="菜单权限">
							<el-tree
								style="width: 100%"
								:data="dialog.menuList"
								:props="{ children: 'menu_children', label: 'name' }"
								node-key="id"
								:default-checked-keys="dialog.menu_pk_list"
								show-checkbox
								class="menu-data-tree"
								@check="handleCheckChange"
							/>
						</el-form-item>
					</el-col>
					<!-- <el-col v-if="getRoleMenu" :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="权限">
							<el-tree :data="state.permissionList" node-key="id" :props="state.menuProps"
								:default-checked-keys="state.checkersPermission" @check="handlePerCheckChange"
								show-checkbox class="menu-data-tree" />
						</el-form-item>
					</el-col> -->
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

<script setup lang="ts" name="systemRoleDialog">
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useRoleApi, useMenuApi, usePermissionApi } from '/@/api/system/index';
const roleApi = useRoleApi();
const useMenu = useMenuApi();
const PermissionApi = usePermissionApi();

// 外部变量
const emit = defineEmits(['refresh']);
// 定义变量内容
const curdFormRef = ref();
const dialog = reactive({
	isShowDialog: false,
	row: <any>{},
	type: 'edit',
	title: '设置菜单',
	submitTxt: '确认',
	menuList: [],
	menu_pk_list: [],
	per_pk_list: [],
	perList: [],
	ruleForm: <any>{
		role_pk: 0,
		menu_pk_list: [],
		per_pk_list: [],
	},
});

const getTableData = async (row: RowRoleType) => {
	if (dialog.menuList.length === 0) {
		useMenu.useMenuList({ role_pk: row.id }).then((res) => {
			dialog.menuList = res.list;
		});
	} else {
		dialog.menuList = JSON.parse(JSON.stringify(dialog.menuList));
	}

	if (false) PermissionApi.usePermissionList({ role_pk: row.id }).then((res) => {});
};

const onSubmit = () => {
	curdFormRef.value.validate((valid: any) => {
		if (valid) {
			if (dialog.type === 'add') onAdd(dialog.ruleForm);
			if (dialog.type === 'edit') onUpd(dialog.ruleForm);
		}
	});
};
// 修改
const onUpd = (ruleForm: any) => {
	ElMessageBox.confirm('确认修改吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			await roleApi
				.useRolePermission(ruleForm)
				.then(() => {
					ElMessage({
						type: 'success',
						message: '修改成功',
					});
					emit('refresh');
				})
				.finally(() => {
					closeDialog();
				});
		})
		.catch(() => {
			ElMessage({
				type: 'info',
				message: '已取消修改',
			});
		});
};
const handleCheckChange = (data: any, checked: any) => {
	const { checkedNodes, checkedKeys, halfCheckedNodes, halfCheckedKeys } = checked;
	dialog.ruleForm.menu_pk_list = [...checkedKeys, ...halfCheckedKeys];
};
// 打开弹窗
const openDialog = (row: any) => {
	//查询角色和菜单
	getTableData(row);
	dialog.row = JSON.parse(JSON.stringify(row));
	dialog.isShowDialog = true;
	dialog.ruleForm = {
		role_pk: row.id,
		menu_pk_list: [],
		per_pk_list: [],
	};
	dialog.menu_pk_list = row.menu.length === 0 ? [0] : row.menu.map((res) => res.menu.id);
	dialog.per_pk_list = row.per.length === 0 ? [0] : row.per.map((res) => res.per.id);
};
// 关闭弹窗
const closeDialog = () => {
	dialog.isShowDialog = false;
	if (!curdFormRef.value) return;
	curdFormRef.value.resetFields();
	dialog.ruleForm = {};
};
// 新增
const add = () => {};
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
