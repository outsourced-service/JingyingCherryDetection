<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto" style="height:100%" body-class="el-card-tabel">
			<template #header>
				<div class="system-user-search ">
					<span class="ml10">用户：</span>
					<el-input size="default" clearable v-model="state.tableData.user_user" class="ml10"
						placeholder="请输入用户名称/账户" style="max-width: 180px" @clear="getTableData">
					</el-input>
					<span class="ml10">手机号：</span>
					<el-input size="default" clearable v-model="state.tableData.phone" class="ml10"
						placeholder="请输入用户手机号" style="max-width: 180px" @clear="getTableData">
					</el-input>
					<el-button size="default" type="primary" class="ml10" @click="getTableData">
						<el-icon>
							<ele-Search />
						</el-icon>
						查询
					</el-button>
					<el-button size="default" type="" class="ml10" @click="getTableReset">
						<el-icon>
							<ele-Refresh />
						</el-icon>
						重置
					</el-button>
					<el-button size="default" type="success" class="ml10" @click="deptDialogRef.openDialog()">
						<el-icon>
							<ele-FolderAdd />
						</el-icon>
						注册账号
					</el-button>
				</div>
			</template>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" height="100%"
				style="width: 100%">
				<el-table-column type="index" label="序号" width="60" />
				<el-table-column prop="nickname" label="用户昵称" />
				<el-table-column prop="username" label="账户" />
				<el-table-column prop="phone" label="手机号" />
				<el-table-column prop="manager_role" label="角色">
					<template #default="scope">
						<div v-if="scope.row.manager_role?.length">
							<el-tag v-for="item in scope.row.manager_role" :key="item.id" size="small" class="mr5">{{
						item?.role?.name }}</el-tag>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="头像">
					<template #default="scope">
						<div v-if="scope.row.avatar?.url">
							<el-image style="width: 30px; height: 30px;border-radius: 50%;" :src="scope.row.avatar?.url"
								fit="cover" :preview-src-list="[scope.row.avatar?.url]" preview-teleported />
							<!-- <el-avatar :size="30" :src="scope.row.avatar?.url" /> -->
						</div>
					</template>
				</el-table-column>
				<el-table-column label="操作" fixed="right" width="200">
					<template #default="scope">
						<div class="buttonAggregate">
							<!-- <el-button v-if="scope.row.id != 1" size="small" text type="primary"
								@click="onAccountRole(scope.row)">设置角色</el-button> -->
							<el-button size="small" text type="primary"
								@click="deptDialogRef.openDialog(scope.row)">编辑</el-button>
							<el-button size="small" text type="primary" @click="onResetEdit(scope.row)">重置密码</el-button>

							<div v-if="scope.row.id != 1">
								<el-button size="small" v-if="scope.row.is_deleted" text type="primary"
									@click="onRecover(scope.row)">恢复</el-button>
								<el-button size="small" v-else text type="danger"
									@click="onLogout(scope.row)">注销</el-button>
							</div>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<template #footer>
				<el-pagination v-if="!!state.tableData.data.length" @size-change="onHandleSizeChange"
					@current-change="onHandleCurrentChange" :pager-count="5" :page-sizes="[10, 20, 30]"
					v-model:current-page="state.tableData.param.pageNum" background
					v-model:page-size="state.tableData.param.pageSize" layout="total, sizes, prev, pager, next, jumper"
					:total="state.tableData.total">
				</el-pagination>
			</template>
		</el-card>
		<DeptDialog ref="deptDialogRef" @refresh="getTableData()" />
		<el-dialog title="配置角色" v-model="state.dialogRole" width="25%">
			<el-row justify="space-between">
				<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
					<el-form-item label="配置角色">
						<el-select multiple v-model="state.roleId" placeholder="请选择配置角色" size="default">
							<el-option v-for="item in state.typeOptions" :key="item.id" :label="item.name"
								:value="item.id" />
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :xs="5" :sm="5" :md="5" :lg="5" :xl="5" :offset="19">
					<el-button size="default" type="primary" @click="onSetRule">确定</el-button>
				</el-col>
			</el-row>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="systemUser">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useUserApi } from '/@/api/system/index';
import { useUserInfo } from '/@/stores/userInfo';
const stores = useUserInfo();
const userApi = useUserApi();
const DeptDialog = defineAsyncComponent(() => import('./dialog.vue'));
// 引入组件

// 定义变量内容
const deptDialogRef = ref();

const state = reactive({
	dialogRole: false,
	roleId: '',
	typeOptions: <any>[],
	currentItem: <any>{},
	tableData: <any>{
		user_user: '', //用户
		phone: '',
		type: '', // 类型
		data: [],
		total: 0,
		loading: false,
		param: {
			pageNum: 1,
			pageSize: 10,
		},
	},
});
const onResetEdit = (row: any) => {
	ElMessageBox.confirm('`此操作将重置密码，重置完成后请用手机号登录?`', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(async () => {
		await userApi.userReset({
			manager_pk: row.id,
		}).then(() => {
			ElMessage({
				type: 'success',
				message: '重置成功',
			})
			getTableData()
		})
	}).catch(() => {
		ElMessage({
			type: 'info',
			message: '已取消',
		})
	})
};
const onAccountRole = (row: any) => {
	const roleArr = row?.manager_role.length ? row?.manager_role.map((element: any) => element.role.id) : []
	state.roleId = roleArr;
	state.dialogRole = true;
	state.currentItem = row;
};
const onLogout = (row: { nickname: any; id: any }) => {
	ElMessageBox.confirm(`此操作将注销账户：${row.nickname}, 是否继续?`, '提示', {
		confirmButtonText: '注销',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			await userApi.userLogoff({
				manager_pk: row.id,
			});
			await getTableData();
		})
		.catch(() => { });
};
const onRecover = (row: any) => {
	ElMessageBox.confirm(`此操作将恢复账户：${row.nickname}, 是否继续?`, '提示', {
		confirmButtonText: '恢复',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			await userApi.userLogActive({
				manager_pk: row.id,
			});
			await getTableData();
		})
		.catch(() => { });
};
// 初始化表格数据
const getTableData = async () => {
	state.tableData.loading = true;
	const { list, total_size } = await userApi.userManagerList({
		page_index: state.tableData.param.pageNum,
		page_size: state.tableData.param.pageSize,
		where: {
			id: { _neq: stores.userInfos.id },
			_or: [
				{nickname: {
					_ilike: `%${state.tableData.user_user}%`,
				}},
				{username: {
					_ilike: `%${state.tableData.user_user}%`,
				}},
			],
			phone: { _ilike: `%${state.tableData.phone}%` }
			
		},
	});

	state.tableData.data = list;
	state.tableData.total = total_size;
	state.tableData.loading = false;
};

// 重置按钮
const getTableReset = () => {
	state.tableData.phone = "";
	state.tableData.user_user = "";
	getTableData();
}

const onSetRule = () => {
	let str = ''
	for (let index = 0; index < state.roleId.length; index++) {
		const element = state.roleId[index];
		str += state.typeOptions.find((current: any) => current.id === element).name + '、'
	}
	ElMessageBox.confirm(`此操作将：${state.currentItem.nickname} 配置${str}角色, 是否继续?`, '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			await userApi.userRole({
				manager_pk: state.currentItem.id,
				role_pk_list: state.roleId,
			});
			state.dialogRole = false;
			await getTableData();
		})
		.catch(() => { });
}
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
onMounted(async () => {
	await getTableData();
});
</script>
