<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto" style="height: 100%" body-class="el-card-tabel">
			<template #header>
				<div class="system-menu-search align-center" style="gap:10px">
					<span style="white-space: nowrap">创建时间</span>
					<el-date-picker v-model="tableData.created_at" type="daterange" size="default" range-separator="至"
						start-placeholder="开始日期" end-placeholder="结束日期" style="max-width: 280px"
						@change="getTableData" />
					<el-button size="default" type="primary" class="ml10" @click="getTableData">
						<el-icon>
							<ele-Search />
						</el-icon>
						查询
					</el-button>
				</div>
			</template>
			<el-table :data="tableData.data" v-loading="tableData.loading" height="100%" style="width: 100%">
				<el-table-column prop="id" label="序号" width="60" />
				<el-table-column prop="created_at" label="创建时间" min-width="120"
					:formatter="(res: any) => new Date(res.created_at).toLocaleString()" />
				<el-table-column prop="title" label="类型" show-overflow-tooltip min-width="120" />
				<el-table-column prop="content" label="内容" show-overflow-tooltip min-width="180" />

				<el-table-column label="被邀请人 (邀请id)" min-width="120">
					<template #default="{ row }">
						<div v-if="row?.user_invitechidren" class="align-center" style="gap: 10px;;">
							<el-avatar :size="30" :src="row?.user_invitechidren.avatar?.url" :alt="row?.user_invitechidren.username">
								<img src="/@/assets/null.png" />
							</el-avatar>
							<div class="flex-1">
								<span>{{ row.user_invitechidren.nickname || row.user_invitechidren.username }}</span>
								<span v-if="row.user_invitechidren.user_id">（{{ row.user_invitechidren.user_id
								}}）</span>
							</div>
						</div>
					</template>
				</el-table-column>

				<el-table-column v-slot="{ row }"  label="邀请人 (邀请id)" min-width="120">
					<div v-if="row?.user" class="align-center" style="gap: 10px;;">
						<el-avatar :size="30" :src="row?.user.avatar?.url ?? '1'" :alt="row?.user.name">
							<img src="/@/assets/null.png" />
						</el-avatar>
						<div class="flex-1">
							<span>{{ row.user.nickname || row.user.username }}</span>
							<span v-if="row.user.user_id">（{{ row.user.user_id
							}}）</span>
						</div>
					</div>
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
	</div>
</template>

<script setup lang="ts" name="invite">
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { user_logs } from '/@/api/index';
const inviteFun = user_logs();

//定义接收参数
const props = defineProps({
	user_id: {
		type: Number,
		default: 0,
	},
});

// 定义变量内容
const inviteFormRef = ref<FormInstance>();
const tableData = reactive(<any>{
	loading: false,
	search: '',
	data: [],
	total: 0,
	param: {
		pageNum: 1,
		pageSize: 10,
	},
});

// 查询方法
const getTableData = async () => {
	tableData.loading = true;
	console.log(props.user_id);

	const { list, total_size } = await inviteFun.get(
		{
			page_index: tableData.param.pageNum,
			page_size: tableData.param.pageSize,
			order_by: { __enum_keys: { id: 'desc_nulls_last' } },
			where: {
				type: { _eq: '用户邀请' },
				user_invitechidren_user: props.user_id ? { _eq: props.user_id } : {},
				created_at: tableData.created_at?.length === 2 ? { _gte: tableData.timeRange[0], _lte: tableData.timeRange[1] }
					: {},
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
</script>

<style scoped lang="scss"></style>
