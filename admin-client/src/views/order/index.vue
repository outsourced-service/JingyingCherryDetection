<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto" style="height: 100%" body-class="el-card-tabel">
			<template #header>
				<div class="system-menu-search align-center" style="gap:12px">
					<div class="align-center " style="gap:12px;flex: 1;justify-content: flex-start;flex-wrap: wrap;">
						<el-select v-model="tableData.mode" size="default" class="ml10" placeholder="选择订单类型"
							@change="onModeChange" style="max-width: 140px">
							<el-option v-for="item in tableData.optionsSelectAll" :key="item" :label="item"
								:value="item" />
						</el-select>
						<el-select clearable v-model="tableData.status" size="default" class="ml10" placeholder="选择订单状态"
							@change="getTableData" style="max-width: 140px">
							<el-option v-for="item in tableData.typeSelectAll" :key="item" :label="item"
								:value="item" />
						</el-select>
						<div class="align-center">
							<span style="white-space: nowrap">订单号：</span>
							<el-input v-model="tableData.orderId" size="default" placeholder="请输入订单号" clearable
								class="ml10" style="max-width: 140px" @blur="getTableData" />
						</div>
						<div class="align-center " style="gap:12px;">
							<span class="ml10" style="white-space: nowrap">创建时间：</span>
							<el-date-picker v-model="tableData.createTimeRange" type="daterange" range-separator="至"
								size="default" start-placeholder="开始日期" end-placeholder="结束日期" class="ml10"
								style="max-width: 240px" @change="getTableData" />
						</div>
						<div class="align-center" style="gap:12px;">
							<span style="white-space: nowrap">价格区间：</span>
							<el-input v-model="tableData.minPrice" type="number" placeholder="最低价格" clearable
								size="default" style="max-width: 120px" @clear="getTableData" @blur="getTableData" />
							<span>-</span>
							<el-input v-model="tableData.maxPrice" type="number" placeholder="最高价格" clearable
								size="default" style="max-width: 120px" @clear="getTableData" @blur="getTableData" />
						</div>
						<div v-if="tableData.mode === '鉴定订单'" class="align-center " style="gap:12px;">
							<span style="white-space: nowrap">会员类型：</span>
							<el-select v-model="tableData.memberType" size="default" placeholder="选择会员类型" 
								@change="getTableData" style="min-width: 100px;max-width: 180px">
								<el-option label="全部" value="" />
								<el-option label="年度会员" value="年度" />
								<el-option label="月度会员" value="月度" />
								<el-option label="非会员" value="非会员" />
							</el-select>
						</div>
						<div v-if="tableData.mode === '会员开通订单'" class="align-center " style="gap:12px;">
							<span style="white-space: nowrap">会员到期时间：</span>
							<el-date-picker v-model="tableData.vipExpTimeRange" type="daterange" range-separator="至"
								size="default" start-placeholder="开始日期" end-placeholder="结束日期" class="ml10"
								style="max-width: 240px" @change="getTableData" />
						</div>
						<div v-if="tableData.mode === '会员开通订单'" class="align-center " style="gap:12px;">
							<span style="white-space: nowrap">会员手机号：</span>
							<el-input v-model="tableData.memberMobile" size="default" placeholder="请输入会员手机号" clearable
								class="ml10" style="max-width: 180px" @clear="getTableData" @blur="getTableData" />
						</div>
					</div>
					<div class="align-center" style="align-self: self-start;">
						<el-button size="default" type="" class="mr10" @click="getExportFile" icon="ele-Download">
							订单导出
						</el-button>
					</div>
				</div>
			</template>
			<el-table :data="tableData.data" v-loading="tableData.loading" height="100%" style="width: 100%">
				<el-table-column v-if="tableData.mode == '鉴定订单'" type="expand">
					<template #default="props">
						<el-card shadow="hover" class="cardImage">
							<template #header>订单图片</template>
							<div class="mt20">
								<ul class="el-upload-list el-upload-list--picture-card is-disabled">
									<li class="el-upload-list__item is-success"
										v-for="(item, index) in props.row.order_annex" :key="index">
										<img class="el-upload-list__item-thumbnail" :src="item.url" alt="" />
										<span class="el-upload-list__item-actions">
											<span class="el-upload-list__item-preview">
												<i class="el-icon el-icon--zoom-in"
													@click="handlePictureCardPreview(item)">
													<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
														<path fill="currentColor"
															d="m795.904 750.72 124.992 124.928a32 32 0 0 1-45.248 45.248L750.656 795.904a416 416 0 1 1 45.248-45.248zM480 832a352 352 0 1 0 0-704 352 352 0 0 0 0 704m-32-384v-96a32 32 0 0 1 64 0v96h96a32 32 0 0 1 0 64h-96v96a32 32 0 0 1-64 0v-96h-96a32 32 0 0 1 0-64z">
														</path>
													</svg>
												</i>
											</span>
										</span>
									</li>
								</ul>
							</div>
						</el-card>
					</template>
				</el-table-column>

				<!-- 公共字段 -->
				<el-table-column prop="id" label="订单号" width="120" />
				<el-table-column prop="mode" label="订单类型" width="140" />
				<el-table-column prop="created_at" label="创建时间" width="120"
					:formatter="(res: any) => new Date(res.created_at).toLocaleString()" />
					<el-table-column prop="price" label="支付价格(单位: 元)" width="160"
					:formatter="(res: any) => Number.parseFloat(res.price / 100).toFixed(2)" />
				<el-table-column prop="status" label="订单状态" min-width="120" />

				<el-table-column prop="attach_data[0].provider_transcation_id" show-overflow-tooltip label="支付订单号"
					min-width="120" />
					<!-- <el-table-column prop="describe" show-overflow-tooltip label="备注" min-width="200" /> -->
					<el-table-column prop="user.nickname" label="用户名" min-width="120" />
				<el-table-column prop="user.mobile" label="手机号" min-width="120" />
				<!-- 鉴定订单 -->
				<el-table-column v-if="tableData.mode === '鉴定订单'" prop="type" label="鉴定类型" width="120" />
				<el-table-column v-if="tableData.mode === '鉴定订单'" prop="num" label="鉴定数量" width="100" />
				<el-table-column v-if="tableData.mode === '鉴定订单'" label="会员状态" min-width="120">
					<template #default="{ row }">
						<div v-if="isMember(row.user)">
							<el-tag v-if="row.user.vip_label === '年度'" type="success">
								<span>年度会员</span>
							</el-tag>
							<el-tag v-else type="warning">
								<span>月度会员</span>
							</el-tag>
						</div>
						<el-tag v-else type="primary">非会员</el-tag>
					</template>
				</el-table-column>
				<el-table-column v-if="tableData.mode === '鉴定订单'" label="操作" width="200" fixed="right">
					<template #default="scope">
						<div class="buttonAggregate">
							<el-button size="small" text type="primary"
								@click="popusProcessRef.openDialog(scope.row)">订单流程详情</el-button>
							<el-button v-if="showButton(scope.row.status)" size="small" text type="primary"
								@click="openDialogRef(scope.row)">新增订单流程</el-button>
							<el-button v-if="showProductButton(scope.row.status)" size="small" text type="primary"
								@click="popusProductRef.openDialog(scope.row)">鉴定详情</el-button>
							<el-button v-if="scope.row.status == '已完成' && scope.row.price > 0" size="small" text
								type="danger" @click="onRefund(scope.row)">确认订单已退款</el-button>
						</div>
					</template>
				</el-table-column>
				<!-- 会员 -->
					<el-table-column v-if="tableData.mode === '会员开通订单'" label="会员有效期" min-width="120">
						<template #default="{ row }">
							<span v-if="getMembershipDuration(row.user.vip_exp_time) === '0个月0天'">-</span>
							<span v-else>{{ getMembershipDuration(row.user.vip_exp_time) }}</span>
						</template>
					</el-table-column>
					<el-table-column v-if="tableData.mode === '会员开通订单'" prop="user.vip_exp_time" label="会员截止时间" min-width="120">
						<template #default="{ row }">
							<span v-if="row.user.vip_exp_time">{{ formatDate(row.user.vip_exp_time) }}</span>
							<span v-else>-</span>
						</template>
					</el-table-column>
					<el-table-column v-if="tableData.mode === '会员开通订单'" prop="user.mobile" label="会员手机号" min-width="120">
						<template #default="{ row }">
							<span v-if="row.user.mobile">{{ row.user.mobile }}</span>
							<span v-else>-</span>
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
		<popusProcess ref="popusProcessRef" />
		<popusProduct ref="popusProductRef" />
		<el-dialog :title="dialog.title" v-model="dialog.isShowDialog" width="80%">
			<el-steps :active="dialog.stepId" align-center class="mb20" finish-status="success" :space="300">
				<el-step title="待付款" />
				<el-step title="已完成" />
				<el-step title="已取消" />
				<el-step title="已退款" />
			</el-steps>
			<el-form ref="curdFormRef" :model="dialog.ruleForm" size="default" label-width="auto" :rules="dialog.rules">
				<el-row :gutter="50">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="上传图片" prop="imgs">
							<el-upload v-model:file-list="dialog.fileList" ref="upimage" action="#" :limit="9"
								:auto-upload="true" list-type="picture-card" :http-request="beforeLicenseHandle"
								:before-upload="async (file: any) => await beforeImageUpload(file, dialog, 'imgs')"
								:on-remove="async (file: any) => await beforeImageRemove(file, dialog, 'imgs')"
								:on-preview="handlePictureCardPreview"
								:on-exceed="(file: any) => handleExceedMsg('最大可上传数量为9')" :accept="ImgType.join(',')"
								style="width: 100%" multiple>
								<el-icon class="avatar-uploader-icon">
									<Plus />
								</el-icon>
							</el-upload>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="物流公司" prop="express_name">
							<el-input v-model="dialog.ruleForm.express_name" type="text" placeholder="请输入物流公司名称"
								clearable />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="物流单号" prop="express_orderid">
							<el-input v-model="dialog.ruleForm.express_orderid" type="text" placeholder="请输入物流单号"
								clearable />
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
		<el-dialog v-model="dialogVisible" width="fit-content">
			<img w-full :src="dialogImageUrl" alt="Preview Image" style="max-width: 90vw" />
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="order">
/* 
eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage, ElLoading } from 'element-plus';
import type { FormInstance, FormRules, UploadProps } from 'element-plus';
import { order, order_process } from '/@/api/index';
const orderFun = order();
import rules from './process/rules';
const curdFun = order_process();
import upload from './process/upload';
import { exportFile } from '/@/components/excelFile';
const {
	beforeLicenseHandle,
	handleExceed,
	beforeVideoUpload,
	beforeImageUpload,
	beforeFileUpload,
	beforeImageRemove,
	handleExceedMsg,
	fileType,
	videoType,
	ImgType,
} = upload;

// 组件
const popusProcess = defineAsyncComponent(() => import('./popus-process.vue'));
const popusProcessRef = ref();

const popusProduct = defineAsyncComponent(() => import('./popusProduct.vue'));
const popusProductRef = ref();

//定义接收参数
const props = defineProps({
	user_id: {
		type: Number,
		default: 0,
	},
	product: {
		type: String,
		default: '',
	},
});
const upimage = ref();

// 定义变量内容
const orderFormRef = ref<FormInstance>();
const curdFormRef = ref<FormInstance>();
const tableData = reactive(<any>{
	loading: false,
	search: '',
	type: '',
	typeSelectAll: ['待付款', '已完成', '已取消', '已退款'],
	mode: '鉴定订单',
	status: '',
	data: [],
	total: 0,
	param: {
		pageNum: 1,
		pageSize: 10,
	},
	optionsSelectAll: ['会员开通订单', '鉴定订单', '新人特惠订单'],
	createTimeRange: [],
	orderId: '',
	minPrice: '',
	maxPrice: '',
	memberType: '',
	vipExpTimeRange: [],
	memberMobile: '',
});

const dialog = reactive({
	isShowDialog: false,
	row: <any>{},
	type: '',
	title: '',
	submitTxt: '',
	stepId: 0,
	rules: rules,
	fileList: <any>[],
	dialogImageUrl: '',
	ruleForm: <any>{
		id: 0,
		imgs: [],
	},
});
const dialogImageUrl = ref('');
const dialogVisible = ref(false);

// 照片墙预览
const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
	dialogImageUrl.value = uploadFile.url!;
	dialogVisible.value = true;
};

const showProductButton = (status: String) => {
	if (status == '待实验室发出' || status == '待客户部签收' || status == '待客户部发出返还' || status == '待用户签收' || status == '已完成') {
		return true;
	}
};

const addButton = (status: String) => {
	if (status != '待用户发出' && status != '待用户签收' && status != '待付款') {
		return true;
	}
};

const showButton = (status: String) => {
	if (status != '已完成' && status != '已取消' && status != '已退款') {
		return true;
	}
};

// 查询方法
const getTableData = async (isReturn = false) => {
	tableData.loading = true;
	const { list, total_size } = await orderFun.get(
		{
			page_index: tableData.param.pageNum,
			page_size: tableData.param.pageSize,
			order_by: { __enum_keys: { id: 'desc_nulls_last' } },
			where: {
				user_user: props.user_id ? { _eq: props.user_id } : {},
				mode: tableData.mode ? { _ilike: `%${tableData.mode}%` } : {},
				status: tableData.status ? { _ilike: `%${tableData.status}%` } : {},
				created_at: tableData.createTimeRange?.length === 2
					? { _gte: tableData.createTimeRange[0], _lte: tableData.createTimeRange[1] }
					: {},
				price: tableData.minPrice && tableData.maxPrice
					? { _gte: Number(tableData.minPrice) * 100, _lte: Number(tableData.maxPrice) * 100 }
					: tableData.minPrice
						? { _gte: Number(tableData.minPrice) * 100 }
						: tableData.maxPrice
							? { _lte: Number(tableData.maxPrice) * 100 }
							: {},
				id: tableData.orderId ? { _eq: Number(tableData.orderId) } : {},
				user: tableData.mode === '会员开通订单'
					? {
						vip_exp_time: tableData.vipExpTimeRange?.length === 2
							? { _gte: tableData.vipExpTimeRange[0], _lte: tableData.vipExpTimeRange[1] }
							: {},
						mobile: tableData.memberMobile
							? { _ilike: `%${tableData.memberMobile}%` }
							: {},
					}
					: tableData.mode === '鉴定订单'
						? {
							vip_label: tableData.memberType === '非会员'
								? { _is_null: true }
								: tableData.memberType
									? { _eq: tableData.memberType }
									: {},
						}
						: {},
			},
		},
		{}
	);
	if (isReturn === true) {
		tableData.loading = false;
		return { list, total_size };
	}
	tableData.data = list.map((res: any) => {
		return {
			...res,
			order_annex: res.order_annex.map((res: any) => res.img),
		};
	});
	tableData.total = total_size;
	tableData.loading = false;
};

// 新增
const onAdd = (ruleForm: any) => {
	ElMessageBox.confirm('确认新增该数据吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			const { id: ID, express_name, express_orderid, imgs, ..._set } = ruleForm;
			await curdFun
				.addProcess({
					order_py: dialog.row.id, //订单ID
					title: dialog.row.status, //订单状态
					express_name, //物流名称
					express_orderid, //物流单号
					imgs, //相关图片合集
				})
				.then(() => {
					ElMessage({
						type: 'success',
						message: '添加成功',
					});
					// dialog.row.status = tableData.typeSelectAll[dialog.stepId + 1];
					getTableData();
				})
				.finally(() => {
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

//初始化
const openDialogRef = (row: any = {}) => {
	if (addButton(row.status) != true) {
		return ElMessage({ type: 'info', message: '当前流程需用户操作' });
	}
	if (curdFormRef.value) curdFormRef.value.resetFields();
	dialog.row = row;
	dialog.type = 'add';
	dialog.title = '新增订单流程';
	dialog.submitTxt = '新 增';
	// dialog.ruleForm = JSON.parse(JSON.stringify(row));
	dialog.isShowDialog = true;
	dialog.fileList = [];
	const { image, file, video, attach_data = {}, order_annex = [], ..._set } = row;
	dialog.ruleForm.title = row.status;
	dialog.stepId = tableData.typeSelectAll.findIndex((res: any) => res === row.status);
	dialog.ruleForm[`imgs`] = [];
	// dialog.ruleForm[`imgs`] = order_annex || [];
};
// 取消
const onCancel = () => {
	dialog.isShowDialog = false;
	if (!curdFormRef.value) return;
	curdFormRef.value.resetFields();
};

const onSubmit = () => {
	if (!curdFormRef.value) return;
	if (dialog.row.product_appraisal_details.length == 0 && dialog.row.status == '待客户部发出返还') {
		return ElMessage({ type: 'info', message: '请先添加该订单物品鉴定结果' });
	}
	curdFormRef.value.validate((valid: any) => {
		if (valid) {
			if (dialog.row.status == '待客户部发出鉴定' || dialog.row.status == '待实验室发出' || dialog.row.status == '待客户部发出返还') {
				if (!dialog.ruleForm.express_name) {
					return ElMessage({ type: 'error', message: '请输入物流公司名称' });
				}
				if (!dialog.ruleForm.express_orderid) {
					return ElMessage({ type: 'error', message: '请输入物流单号' });
				}
			}
			if (dialog.ruleForm.imgs.length < 3) {
				return ElMessage({ type: 'info', message: '流程图片上传不足3张' })
			}
			if (dialog.type === 'add') onAdd(dialog.ruleForm);
		}
	});
};

// 确认订单已退款
const onRefund = async (row: any) => {
	ElMessageBox.confirm(`请确认当前订单（${row.attach_data[0].provider_transcation_id}）已在微信商户平台退款成功后在进行状态的变更`, `是否已退款`, {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(async () => {
		await curdFun
			.refund({
				order_pk: row.id, //订单ID
			}).then(() => {
				ElMessage({
					type: 'success',
					message: '订单状态修改成功',
				});
				getTableData();
			})
	}).catch(() => {
		ElMessage({
			type: 'info',
			message: '已取消变更',
		});
	});
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

const isMember = (user: any) => {
	return user.vip_exp_time && new Date(user.vip_exp_time).getTime() > Date.now();
};

const getMemberType = (user: any) => {
	return user.vip_label === '年度' ? '年度会员' : '月度会员';
};

// 页面加载时
onMounted(async () => {
	getTableData();
});

const getMembershipDuration = (expTime: string) => {
	const now = new Date();
	const expDate = new Date(expTime);
	const diff = expDate.getTime() - now.getTime();

	if (diff < 0) {
		return '-';
	}

	const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
	const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));

	if (months === 0 && days === 0) {
		return '-';
	} else if (months === 0) {
		return `${days}天`;
	} else if (days === 0) {
		return `${months}个月`;
	} else {
		return `${months}个月${days}天`;
	}
};

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleString();
};

//导出数据
const getExportFile = async () => {
	const loading = ElLoading.service({
		lock: true,
		text: "订单数据导出中...",
		background: 'rgba(0, 0, 0, 0.7)',
	})
	const param = JSON.stringify(tableData.param);
	tableData.param.pageSize = 10;
	tableData.param.pageNum = 0;
	const { list } = await getTableData(true).catch(() => {
		loading.close();
	});
	await exportFile(
		{
			data: list.map((res: any) => ({
				"创建时间": new Date(res.created_at).toLocaleString(),
				"订单号": res.id,
				"订单类型": res.mode,
				"订单状态": res.status,
				"支付订单号": res.attach_data[0].provider_transcation_id,
				"支付价格": ((res.price || 0) / 100).toFixed(2),
				"用户ID": res.user.user_id,
				...(tableData.mode.includes('鉴定') ? {
					"优惠价格": ((res?.preferential_price ?? 0) / 100).toFixed(2),
					"优惠原因": res.discount_reason,
					"是否为Ai鉴定订单": res.is_ai_identify ? '是' : '否',
					"用户昵称": res.user.nickname,
					"用户手机号": res.user.mobile,
					"用户是否为会员": isMember(res.user) ? getMemberType(res.user) : '否',
				} : {}),
				...(tableData.mode.includes('会员') ? {
					"会员手机号": res.user.mobile,
					"会员截止时间": isMember(res.user) ? new Date(res.user.vip_exp_time).toLocaleString() : '无',
					"会员有效期": isMember(res.user) ? ((new Date(res.user.vip_exp_time).getTime() - Date.now()) / (1000 * 60 * 60 * 24)).toFixed(0) : '无',
				} : {}),
			}))
		},
		`${tableData.mode}数据`,
	);
	tableData.param = JSON.parse(param);
	loading.close();
}

const onModeChange = () => {
	// 清空订单号筛选内容
	tableData.orderId = '';
	
	// 清空其他筛选项
	tableData.status = '';
	tableData.createTimeRange = [];
	tableData.minPrice = '';
	tableData.maxPrice = '';
	tableData.memberType = '';
	tableData.vipExpTimeRange = [];
	tableData.memberMobile = '';
	
	// 重新获取数据
	getTableData();
};
</script>

<style lang="scss" scoped>
:deep(.el-step__icon-inner) {
	font-size: 16px !important;
}

.cardImage {

	:deep(.el-upload),
	:deep(.el-upload--picture-card),
	:deep(.el-list-move) {
		display: none;
	}

	:deep(.el-upload-list__item-status-label) {
		opacity: 0;
	}
}
</style>
