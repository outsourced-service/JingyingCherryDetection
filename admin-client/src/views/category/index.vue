<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto" style="height: 100%" body-class="el-card-tabel">
			<template #header>
				<div class="system-menu-search align-center">
					<div class="align-center">
						<span class="ml10" style="white-space: nowrap">产品类型：</span>
						<el-input
							size="default"
							clearable
							v-model="tableData.search"
							class="ml10"
							placeholder="请输入产品类型名称"
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
				<el-table-column prop="id" show-overflow-tooltip label="序号" width="60" />
				<el-table-column prop="name" label="名称" />
				<el-table-column prop="price" label="价格（单位：元）" >
					<template #default="scope">{{ scale2Format(Number(scope.row.price)/100) }}</template>
				</el-table-column>
				<el-table-column prop="idx" label="排序" />
				<el-table-column label="操作" fixed="right">
					<template #default="scope">
						<div class="buttonAggregate">
							<el-button size="small" text type="primary" @click="popusProductRef.openDialog(scope.row)">查看对应鉴定物品</el-button>
							<el-button size="small" text type="primary" @click="openDialogCurdFormRef(scope.row)">编辑</el-button>
							<el-button size="small" text type="primary" @click="onDel(scope.row)">删除</el-button>
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
		<el-dialog :title="dialog.title" v-model="dialog.isShowDialog" width="60%">
			<el-form ref="categoryFormRef" :model="dialog.ruleForm" size="default" label-width="auto" :rules="dialog.rules">
				<el-row :gutter="50">
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="名称" prop="name">
							<el-input v-model="dialog.ruleForm.name" type="text" placeholder="请输入名称" clearable />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="价格（单位：元）" prop="price">
							<el-input-number :precision="2" :min="0.01" v-model="dialog.ruleForm.price" type="text" placeholder="请输入价格" clearable />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="排序" prop="idx">
							<el-input v-model="dialog.ruleForm.idx" type="text" placeholder="请输入排序" clearable />
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
		<popusProduct ref="popusProductRef" />
	</div>
</template>

<script setup lang="ts" name="category">
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { category } from '/@/api/index';
import rules from './rules';
const categoryFun = category();

const popusProduct = defineAsyncComponent(() => import('./popusProduct.vue'));
const popusProductRef = ref();

// 定义变量内容
const categoryFormRef = ref<FormInstance>();
const dialog = reactive({
	isShowDialog: false,
	row: <any>{},
	type: '',
	rules: rules,
	title: '',
	submitTxt: '',
	ruleForm: <any>{
		id: 0,
		name: '',
		price: '',
		idx: 0
	},
});
const tableData = reactive(<any>{
	loading: false,
	search: '',
	vip: '',
	data: [],
	total: 0,
	param: {
		pageNum: 1,
		pageSize: 10,
	},
	time: ''
});

const scale2Format = (value: string = '0') => {
		return Number.parseFloat(value).toFixed(2);
	};

// 查询方法
const getTableData = async () => {
	tableData.loading = true;
	const { list, total_size } = await categoryFun.get(
		{
			page_index: tableData.param.pageNum,
			page_size: tableData.param.pageSize,
			order_by: { __enum_keys: { idx: 'asc_nulls_last' } },
			where: {
				name: tableData.search ? { _ilike: `%${tableData.search}%` }: {}
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
	if (categoryFormRef.value) categoryFormRef.value.resetFields();
	dialog.row = row;
	dialog.type = row.id ? 'edit' : 'add';
	dialog.title = row.id ? '编辑' : '新增';
	dialog.submitTxt = row.id ? '修 改' : '新 增';
	dialog.ruleForm = JSON.parse(JSON.stringify(row));
	if(row?.id) {
		dialog.ruleForm.price = dialog.ruleForm.price/100;
	}
	dialog.isShowDialog = true;
};

// 取消
const onCancel = () => {
	dialog.isShowDialog = false;
	if (!categoryFormRef.value) return;
	categoryFormRef.value.resetFields();
};

//提交
const onSubmit = () => {
	categoryFormRef.value.validate((valid: any) => {
		if (valid) {
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
			delete ruleForm.id;
			ruleForm.price = ruleForm.price*100;
			await categoryFun.inc(
					ruleForm,{}
			).then(() => {
				ElMessage({
				  type: 'success',
				  message: '添加成功！',
				})
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
	ElMessageBox.confirm('确认修改该数据吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			ruleForm.price = ruleForm.price*100;
			await categoryFun.set(
				ruleForm.id,
				{
					name: ruleForm.name,
					price: ruleForm.price,
					idx: ruleForm.idx,
				},{}
			).then(() => {
				ElMessage({
				  type: 'success',
				  message: '修改成功！',
				})
				getTableData();
			}).catch(() => {
				ElMessage({
				  type: 'error',
				  message: '修改失败！',
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

//删除
const onDel = (row: any) => {
	ElMessageBox.confirm('此操作将永久删除该数据, 是否继续?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			await categoryFun.del(row.id, true, {}).then(() => {
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
});
</script>

<style scoped lang="scss"></style>
