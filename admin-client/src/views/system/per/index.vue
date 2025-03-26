<template>
	<div class="system-dept-container layout-padding">
		<div class="system-dept-padding layout-padding-auto layout-padding-view">
			<div class="system-dept-search mb15">
				<el-input size="default" placeholder="请输入权限名称" style="max-width: 180px"> </el-input>
				<el-button size="default" type="primary" class="ml10" @click="getTableData">
					<el-icon>
						<ele-Search />
					</el-icon>
					查询
				</el-button>
				<el-button size="default" type="success" class="ml10"
					@click="onOpenAddDept('add')">
					<el-icon>
						<ele-FolderAdd />
					</el-icon>
					新增权限
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%" row-key="id"
				height="100%" default-expand-all :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
				<el-table-column label="排序" show-overflow-tooltip width="80">
					<template #default="scope">
						{{ scope.$index + 1 }}
					</template>
				</el-table-column>
				<el-table-column prop="name" label="权限名称" show-overflow-tooltip> </el-table-column>
				<el-table-column v-if="false" prop="status" label="权限状态" show-overflow-tooltip>
					<template #default="scope">
						<el-tag type="success" v-if="scope.row.status">启用</el-tag>
						<el-tag type="info" v-else>禁用</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="describe" label="权限描述" show-overflow-tooltip></el-table-column>
				<el-table-column prop="createTime" label="创建时间" show-overflow-tooltip></el-table-column>
				<el-table-column label="操作" show-overflow-tooltip width="140">
					<template #default="scope">
						<el-button size="small" text type="primary"
							@click="onOpenAddDept('add')">新增</el-button>
						<el-button size="small" text type="primary"
							@click="onOpenEditDept('edit', scope.row)">修改</el-button>
						<el-button size="small" text
							type="primary" @click="onTableRowDel(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination @size-change="onHandleSizeChange" @current-change="onHandleCurrentChange" class="mt15"
				:pager-count="5" :page-sizes="[10, 20, 30]" v-model:current-page="state.tableData.param.pageNum"
				background v-model:page-size="state.tableData.param.pageSize"
				layout="total, sizes, prev, pager, next, jumper" :total="state.tableData.total">
			</el-pagination>
		</div>
		<DeptDialog ref="deptDialogRef" @refresh="getTableData()" />
	</div>
</template>

<script setup lang="ts" name="systemDept">
import { defineAsyncComponent, ref, reactive, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { usePermissionApi } from '/@/api/system/index';
import { auth } from "/@/utils/authFunction";
const PermissionApi = usePermissionApi();

// 引入组件
const DeptDialog = defineAsyncComponent(() => import('/@/views/system/per/dialog.vue'));

// 定义变量内容
const deptDialogRef = ref();
const state = reactive<SysDeptState>({
	tableData: {
		data: [],
		total: 0,
		loading: false,
		param: {
			pageNum: 1,
			pageSize: 20,
		},
	},
});

// 初始化表格数据
const getTableData = async () => {
	state.tableData.loading = true;
	state.tableData.data = [];

	const { list, total_size } = await PermissionApi.usePermissionList({
		page_index: state.tableData.param.pageNum,
		page_size: state.tableData.param.pageSize,
		where: {},
	});
	state.tableData.data = list;
	// state.tableData.data.push({
	// 	name: 'vueNextAdmin',
	// 	createTime: new Date().toLocaleString(),
	// 	status: true,
	// 	sort: Math.random(),
	// 	describe: '顶级权限',
	// 	id: Math.random(),
	// 	children: [
	// 		{
	// 			name: 'IT外包服务',
	// 			createTime: new Date().toLocaleString(),
	// 			status: true,
	// 			sort: Math.random(),
	// 			describe: '总部',
	// 			id: Math.random(),
	// 		},
	// 		{
	// 			name: '资本控股',
	// 			createTime: new Date().toLocaleString(),
	// 			status: true,
	// 			sort: Math.random(),
	// 			describe: '分部',
	// 			id: Math.random(),
	// 		},
	// 	],
	// });
	state.tableData.total = total_size;
	setTimeout(() => {
		state.tableData.loading = false;
	}, 500);
};
// 打开新增菜单弹窗
const onOpenAddDept = (type: string) => {
	deptDialogRef.value.openDialog(type);
};
// 打开编辑菜单弹窗
const onOpenEditDept = (type: string, row: DeptTreeType) => {
	deptDialogRef.value.openDialog(type, row);
};
// 删除当前行
const onTableRowDel = (row: DeptTreeType) => {
	ElMessageBox.confirm(`此操作将永久删除权限：${row.name}, 是否继续?`, '提示', {
		confirmButtonText: '删除',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			await PermissionApi.useDelPermission({
				per_pk: row.id,
			});
			getTableData();
			await getTableData();
		})
		.catch(() => { });
};

// 分页改变
const onHandleSizeChange = (val: number) => {
	state.tableData.param.pageSize = val;
	getTableData();
};

// 分页改变
const onHandleCurrentChange = (val: number) => {
	state.tableData.param.pageNum = val;
	getTableData();
};

// 页面加载时
onMounted(() => {
	getTableData();
});
</script>
<style scoped lang="scss">
.system-dept-container {
	.system-dept-padding {
		padding: 15px;

		.el-table {
			flex: 1;
		}
	}
}
</style>
