<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto" style="height: 100%" body-class="el-card-tabel">
			<template #header>
				<div class="system-menu-search align-center" style="gap:12px">
					<div class="align-center " style="gap:12px;flex: 1;justify-content: flex-start;flex-wrap: wrap;">
						<div class="align-center " style="gap:12px;">
							<span style="white-space: nowrap">用户：</span>
							<el-input size="default" clearable v-model="tableData.search" placeholder="请输入昵称"
								style="max-width: 120px" @clear="getTableData">
							</el-input>
						</div>
						<div class="align-center " style="gap:12px;">
							<span style="white-space: nowrap">手机号：</span>
							<el-input size="default" clearable v-model="tableData.searchMobile" placeholder="请输入手机号"
								style="max-width: 150px" @clear="getTableData">
							</el-input>
						</div>
						<div class="align-center " style="gap:12px;">
							<span style="white-space: nowrap">是否查询会员：</span>
							<el-select v-model="tableData.vip" placeholder="请选择" size="default" style="width: 120px"
								@change="getTableData">
								<el-option v-for="item in vipOptions" :key="item.value" :label="item.label"
									:value="item.value" />
							</el-select>
						</div>
						<div class="align-center " style="gap:12px;">
							<span style="white-space: nowrap">会员过期时间：</span>
							<el-date-picker v-model="tableData.timeRange" type="daterange" size="default"
								range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
								style="max-width: 240px" @change="getTableData" />
						</div>
						<div class="align-center " style="gap:12px;">
							<span style="white-space: nowrap">创建时间：</span>
							<el-date-picker v-model="tableData.created_at" type="daterange" size="default"
								range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
								style="max-width: 240px" @change="getTableData" />
						</div>
					</div>
					<div class="align-center" style="align-self: self-start;">
						<el-button size="default" type="" @click="getTableReset" icon="Refresh">
							重置
						</el-button>
						<el-button size="default" type="primary" @click="getTableData" icon="Search">
							查询
						</el-button>
						<el-button size="default" type="" class="mr10" @click="getExportFile" icon="ele-Download">
							用户导出
						</el-button>
					</div>
				</div>
			</template>
			<el-table :data="tableData.data" v-loading="tableData.loading" height="100%" style="width: 100%">
				<el-table-column prop="nickname" label="身份" min-width="120">
					<template #default="scope">
						<div v-if="new Date(scope.row?.vip_exp_time).getTime() > Date.now()">
							<el-tag v-if="scope.row?.vip_label === '年度'" type="success">
								<span>年度会员</span>
							</el-tag>
							<el-tag v-else type="warning">
								<span>月度会员</span>
							</el-tag>
						</div>
						<el-tag v-else type="primary">普通用户</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="created_at" label="创建时间" min-width="120"
					:formatter="(res: any) => new Date(res.created_at).toLocaleString()" />
				<el-table-column prop="nickname" label="昵称" min-width="120" />

				<!--<el-table-column prop="vip_label" label="会员标签" />-->

				<el-table-column prop="avatar" label="头像">
					<template #default="scope">
						<div v-if="scope.row.avatar?.url">
							<el-image :src="scope.row.avatar?.url" :alt="scope.row.name" fit="cover"
								style="width: 30px; height: 30px; border-radius: 50%"
								:preview-src-list="[scope.row?.avatar?.url]" preview-teleported />
						</div>
						<div v-else>-</div>
					</template>
				</el-table-column>
				<el-table-column prop="user_id" show-overflow-tooltip label="用户id/邀请id" min-width="120" />
				<el-table-column prop="mobile" label="手机号" min-width="120" />
				<el-table-column prop="capital" label="用户资金(单位: 元)"
					:formatter="(res: any) => Number.parseFloat(res.capital / 100).toFixed(2)" min-width="120" />
				<el-table-column prop="vip_exp_time" :formatter="(res: any) => deteform(res.vip_exp_time)"
					label="会员过期时间" min-width="120" />
				<el-table-column prop="ai_check_count" label="ai鉴定剩余次数" min-width="140" />
				<el-table-column v-slot="{ row }" prop="invite_count" label="有效邀请人数/总邀请人数" min-width="120">
					{{ row?.invite_count }} / {{ row?.user_invitechidren_aggregate?.aggregate?.count }}
				</el-table-column>
				<el-table-column prop="newbie_discount_count" label="新人特惠次数" min-width="120" />
				<el-table-column prop="order_ai_identify.aggregate.count" label="AI鉴定订单数量" min-width="160" />
				<el-table-column prop="order_newbie_discount.aggregate.count" label="新人特惠订单数量" min-width="160" />
				<el-table-column prop="order_vip_open.aggregate.count" label="会员开通订单数量" min-width="160" />
				<!-- <el-table-column prop="role" label="用户角色" min-width="120"/> -->
				<el-table-column label="操作" width="200" fixed="right">
					<template #default="scope">
						<div class="buttonAggregate">
							<el-button size="small" text type="primary"
								@click="popusOrderRef.openDialog(scope.row)">查看订单</el-button>
							<el-button size="small" text type="primary"
								@click="popusRecordRef.openDialog(scope.row, tableData.openAssets)">查看提现记录</el-button>
							<!-- <el-button size="small" text type="primary"
								@click="popusRecordRef.openDialog(scope.row, tableData.openLog)">查看日志记录</el-button> -->
							<!-- <el-button size="small" text type="primary" @click="handleBind(scope.row)">绑定角色</el-button> -->
							<el-button size="small" text type="primary"
								@click="popusInviteRef.openDialog(scope.row)">邀请记录</el-button>
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
		<popusRecord ref="popusRecordRef" />
		<popusOrder ref="popusOrderRef" />
		<popusInvite ref="popusInviteRef" />
		<el-dialog title="绑定角色" v-model="dialog.openVisible" width="30%">
			<el-row justify="space-between">
				<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
					<el-form-item label="绑定角色">
						<el-select v-model="dialog.role_id[0]" placeholder="请选择绑定角色" size="default"
							style="width: 220px;">
							<el-option v-for="item in dialog.roleList" :key="item.id" :label="item.name"
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

<script setup lang="ts" name="user">
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage, ElLoading } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { user } from '/@/api/index';
import { useRoleApi } from '/@/api/system/index';
import { exportFile } from '/@/components/excelFile';
const curdFun = useRoleApi();
const userFun = user();

// 组件
const popusOrder = defineAsyncComponent(() => import('./popus-order.vue'));
const popusOrderRef = ref();

const popusRecord = defineAsyncComponent(() => import('./popusRecord.vue'));
const popusRecordRef = ref();

const popusInvite = defineAsyncComponent(() => import('./popus-invite.vue'));
const popusInviteRef = ref();

const dialog = reactive(<any>{
	openVisible: false,
	role_id: 0,
	roleList: [],
	user: {}
})

// 定义变量内容
const vipOptions = [
	{
		value: '年度',
		label: '年度会员',
	},
	{
		value: '月度',
		label: '月度会员',
	},
	{
		value: '非会员',
		label: '非会员',
	},
];

const userFormRef = ref<FormInstance>();
const tableData = reactive(<any>{
	loading: false,
	search: '',
	searchMobile: '',
	vip: '',
	data: [],
	total: 0,
	param: {
		pageNum: 1,
		pageSize: 10,
	},
	time: '',
	openLog: 'openLog',
	openAssets: 'openAssets',
	roleList: [],
	timeRange: [],
});

const deteform = (date: string | number | Date) => (date ? new Date(date).toLocaleString() : '未开通会员');

// 查询方法
const getRoleData = async () => {
	const { list } = await curdFun.get(
		{
			order_by: { __enum_keys: { id: 'desc_nulls_last' } },
			where: {
				type: { _eq: '小程序角色' }
			},
		},
		{}
	);
	dialog.roleList = list;
};

// 查询方法
const getTableData = async (isReturn?: boolean) => {
	getTime();
	tableData.loading = true;
	const { list, total_size } = await userFun.get(
		{
			page_index: tableData.param.pageNum,
			page_size: tableData.param.pageSize,
			order_by: { __enum_keys: { id: 'desc_nulls_last' } },
			where: {
				nickname: tableData.search ? { _ilike: `%${tableData.search}%` } : {},
				mobile: tableData.searchMobile ? { _ilike: `%${tableData.searchMobile}%` } : {},
				vip_label: tableData.vip === '非会员' ? { _is_null: true } : tableData.vip ? { _eq: tableData.vip } : {},
				vip_exp_time: tableData.timeRange?.length === 2
					? { _gte: tableData.timeRange[0], _lte: tableData.timeRange[1] }
					: {},
				created_at: tableData.created_at?.length === 2 ? { _gte: tableData.timeRange[0], _lte: tableData.timeRange[1] }
					: {},
			},
		},
		{}
	);
	if (isReturn === true) {
		tableData.loading = false;
		return { list, total_size };
	}
	tableData.data = list;
	tableData.total = total_size;
	tableData.loading = false;
	for (let i = 0; i < list.length; i++) {
		if (list[i]?.user_role) {
			const role = list[i].user_role[0]?.role_role;
			list[i].role = dialog?.roleList.find((current: any) => current.id === role)?.name
		}
	}
	return { list, total_size };
};

// 获取当前时间
const getTime = () => {
	tableData.time = new Date();
};

const handleBind = (row: any) => {
	getRoleData();
	const roleArr = row?.user_role.length ? row?.user_role.map((element: any) => element.role_role) : []
	dialog.role_id = roleArr;
	dialog.openVisible = true;
	dialog.user = row;
}

const onSetRule = () => {
	let str = ''
	for (let index = 0; index < dialog.role_id.length; index++) {
		const element = dialog.role_id[index];
		str += index == dialog.role_id.length - 1 ? dialog.roleList.find((current: any) => current.id === element).name : dialog.roleList.find((current: any) => current.id === element).name + '、'
	}
	ElMessageBox.confirm(`此操作将：${dialog.user.nickname} 配置${str}角色, 是否继续?`, '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			await userFun.bindRole({
				user_pk: dialog.user.id,
				role_pk_list: dialog.role_id,
			});
			dialog.openVisible = false;
			await getTableData();
		})
		.catch(() => { });
}

// 重置按钮
const getTableReset = () => {
	tableData.search = "";
	tableData.searchMobile = "";
	tableData.vip = "";
	tableData.timeRange = [];
	getTableData();
}

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
	await getRoleData();
	getTableData();
});


//导出数据
const getExportFile = async () => {
	const loading = ElLoading.service({
		lock: true,
		text: "用户数据导出中...",
		background: 'rgba(0, 0, 0, 0.7)',
	})
	const param = JSON.stringify(tableData.param);
	tableData.param.pageSize = 0;
	tableData.param.pageNum = 0;
	const { list } = await getTableData(true);
	await exportFile(
		{
			data: list.map((res: any) => ({
				"创建日期": new Date(res.created_at).toLocaleString(),
				"身份": new Date(res?.vip_exp_time).getTime() > Date.now() ? (
					res?.vip_label === '年度' ? '年度会员' : '月度会员'
				) : '普通用户',
				"邀请id": res.user_id,
				"昵称": res.nickname,
				"手机号": res.mobile,
				"用户资金(单位: 元)": ((res?.capital ?? 0) / 100).toFixed(2),
				"会员过期时间": res?.vip_exp_time ? new Date(res?.vip_exp_time).toLocaleString() : '未开通会员',
				"ai鉴定剩余次数": res?.ai_check_count,
				"邀请人数": res?.invite_count,
				"新人特惠次数": res?.newbie_discount_count,
				"AI鉴定订单数量": res?.order_ai_identify.aggregate.count,
				"新人特惠订单数量": res?.order_newbie_discount.aggregate.count,
				"会员开通订单数量": res?.order_vip_open.aggregate.count,
			}))
		},
		"用户数据",
	);
	tableData.param = JSON.parse(param);
	loading.close();
}
</script>

<style scoped lang="scss"></style>
