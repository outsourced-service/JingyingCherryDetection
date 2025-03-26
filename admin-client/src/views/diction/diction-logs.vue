<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto" style="height: 100%" body-class="el-card-tabel">
			<template #header>
				<div class="system-menu-search align-center">
					<span class="ml10" style="white-space: nowrap">枚举名称：</span>
					<el-input
						size="default"
						clearable
						v-model="tableData.search"
						class="ml10"
						placeholder="请输入枚举名称"
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
					<el-button size="default" type="success" class="ml10" @click="openDialog({})">
						<el-icon>
							<ele-FolderAdd />
						</el-icon>
						新增枚举
					</el-button>
				</div>
			</template>
			<el-table :data="tableData.data" v-loading="tableData.loading" height="100%" style="width: 100%">
				<el-table-column prop="id" label="序号" />
				<el-table-column prop="idx" label="排序值" />
				<el-table-column prop="value" label="枚举名称" />
				<el-table-column prop="describe" label="枚举描述" />
				<!-- <el-table-column prop="idx" label="枚举排序"  /> -->
				<el-table-column label="操作" width="120" fixed="right">
					<template #default="scope">
						<el-button size="small" text type="primary" @click="openDialog(scope.row)">编辑</el-button>
						<el-button size="small" text type="primary" @click="onDel(scope.row)">删除</el-button>
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
		<el-dialog :title="dialog.title" v-model="dialog.isShowDialog">
			<el-form ref="curdFormRef" :model="dialog.ruleForm" size="default" label-width="100px" :rules="dialog.rules">
				<el-row :gutter="50">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="枚举名称" prop="value">
							<el-input v-model="dialog.ruleForm.value" type="text" placeholder="请输入枚举名称" clearable />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="枚举描述" prop="describe">
							<el-input v-model="dialog.ruleForm.describe" type="textarea" placeholder="请输入枚举描述" clearable />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="枚举排序" prop="idx">
							<el-input v-model="dialog.ruleForm.idx" type="number" placeholder="请输入排序值" clearable />
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

<script setup lang="ts" name="dictionLogs">
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import rules from './rules';
import { diction_logs } from '/@/api/index';
const curdFun = diction_logs();

const props = defineProps({
	dictionID: {
		type: Number,
		default: 0,
	},
});
// 外部变量
const emit = defineEmits(['refresh']);
// 定义变量内容
const tableData = reactive(<any>{
	loading: false,
	search: '',
	type: '',
	data: [],
	total: 0,
	param: {
		pageNum: 1,
		pageSize: 10,
	},
});
const curdFormRef = ref();
const dialog = reactive({
	isShowDialog: false,
	row: <any>{},
	type: '',
	title: '',
	submitTxt: '',
	rules: rules.curdDictionLogs,
	ruleForm: <any>{
		id: 0,
	},
});
// 查询方法
const getTableData = async () => {
	tableData.loading = true;
	const { list, total_size } = await curdFun.get(
		{
			page_index: tableData.param.pageNum,
			page_size: tableData.param.pageSize,
			order_by: { __enum_keys: { idx: 'asc_nulls_last' } },
			where: {
				diction_diction: { _eq: props.dictionID },
				_or: [
					{
						value: { _ilike: `%${tableData.search}%` },
					},
					{
						id: tableData.search ? { _eq: parseInt(tableData.search) } : {},
					},
				],
			},
		},
		{}
	);
	tableData.data = list;
	tableData.total = total_size;
	tableData.loading = false;
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

// 打开弹窗 初始化
const openDialog = (row: any = {}) => {
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
	if (!curdFormRef.value) return;
	curdFormRef.value.resetFields();
	dialog.ruleForm = {};
};
// 启动新增或删除
const onSubmit = () => {
	curdFormRef.value.validate((valid: any) => {
		if (valid) {
			if (dialog.type === 'add') onAdd(dialog.ruleForm);
			if (dialog.type === 'edit') onUpd(dialog.ruleForm);
		}
	});
};
// 新增
const onAdd = (ruleForm: any) => {
	ElMessageBox.confirm('确认新增该词典吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			delete ruleForm.id;
			await curdFun
				.inc(
					{
						...ruleForm,
						diction_diction: props.dictionID,
					},
					{}
				)
				.then(() => {
					ElMessage({
						type: 'success',
						message: '添加成功',
					});
					getTableData();
					emit('refresh');
				})
				.finally(() => {
					closeDialog();
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
	ElMessageBox.confirm('确认修改当前词典吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			const { id: ID, idx, ..._set } = ruleForm;
			await curdFun
				.set(
					ID,
					{
						_set: {
							..._set,
							idx: idx || null,
						},
					},
					{}
				)
				.then(() => {
					ElMessage({
						type: 'success',
						message: '修改成功',
					});
					getTableData();
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
				emit('refresh');
			});
		})
		.catch(() => {
			ElMessage({
				type: 'info',
				message: '已取消删除',
			});
		});
};
</script>

<style scoped lang="scss"></style>
