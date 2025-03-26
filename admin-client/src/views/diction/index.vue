<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto" style="height:100%" body-class="el-card-tabel">
			<template #header>
				<div class="system-menu-search align-center">
					<span class="ml10" style="white-space: nowrap;">词典名称:</span>
					<el-input size="default" clearable v-model="tableData.search" class="ml10" placeholder="请输入词典名称"
						style="max-width: 200px;" @clear="getTableData">
					</el-input>
					<el-button size="default" type="primary" class="ml10" @click="getTableData">
						<el-icon>
							<ele-Search />
						</el-icon>
						查询
					</el-button>
					<el-button size="default" type="success" class="ml10" @click="curdDictionRef.openDialog({})">
						<el-icon>
							<ele-FolderAdd />
						</el-icon>
						新增词典
					</el-button>
				</div>
			</template>
			<el-table :data="tableData.data" v-loading="tableData.loading" height="100%" style="width: 100%">
				<el-table-column prop="id" label="序号" />
				<el-table-column prop="name" label="词典名称" />
				<el-table-column prop="describe" label="词典描述" />
				<el-table-column prop="diction_logs_aggregate.aggregate.count" label="词典枚举总数" />
				<el-table-column label="操作" width="200" fixed="right">
					<template #default="scope">
						<div class="buttonAggregate">
							<el-button size="small" text type="primary"
								@click="curdDictionRef.openDialog(scope.row)">编辑</el-button>
							<el-button size="small" text type="primary"
								@click="dialog.isShowDialog = true, dialog.row = scope.row">查看枚举</el-button>
							<el-button size="small" v-if="scope.row.diction_logs_aggregate.aggregate.count == 0" text type="primary" @click="handleDelete(scope.row)">删除</el-button>
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
		<div class="">
			<curdDiction ref="curdDictionRef" @refresh="getTableData" />
			<el-dialog v-model="dialog.isShowDialog" destroy-on-close append-to-body fullscreen>
				<div class="layout-container ">
					<dictionLogs :dictionID="dialog.row.id" @refresh="getTableData"
						style="width: 100%;height: calc(100vh - 32px);top: 32px;" />
				</div>
			</el-dialog>
		</div>
	</div>
</template>

<script setup lang="ts" name="diction">
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus'
import { diction } from '/@/api/index';
const dictionFun = diction()

const curdDiction = defineAsyncComponent(() => import('./curd-diction.vue'));
const dictionLogs = defineAsyncComponent(() => import('./diction-logs.vue'));

// 定义变量内容
const curdDictionRef = ref();
const tableData = reactive(<any>{
	loading: false,
	search: "",
	type: "",
	data: [],
	total: 0,
	param: {
		pageNum: 1,
		pageSize: 10,
	},
})
const dialog = reactive({
	isShowDialog: false,
	row: <any>{},
});
const deteform = (date: string | number | Date) => date ? new Date(date).toLocaleString() : '-';
// 查询方法
const getTableData = async () => {
	tableData.loading = true;
	const { list, total_size } = await dictionFun.get({
		page_index: tableData.param.pageNum,
		page_size: tableData.param.pageSize,
		order_by: { __enum_keys: { id: "desc_nulls_last" } },
		where: {
			name: { _ilike: `%${tableData.search}%` }
		},
	}, {});
	tableData.data = list;
	tableData.total = total_size;
	tableData.loading = false;
};

//点击删除
const handleDelete = (row: any) => {
	ElMessageBox.confirm('此操作将永久删除该数据, 是否继续?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			await dictionFun.del(row.id, true, {}).then(() => {
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
}

// 分页改变
const onHandleSizeChange = (val: number) => {
	tableData.param.pageSize = val;
	getTableData()
};
// 分页改变
const onHandleCurrentChange = (val: number) => {
	tableData.param.pageNum = val;
	getTableData()
};

// 页面加载时
onMounted(async () => {
	getTableData()
});

</script>

<style scoped lang="scss"></style>