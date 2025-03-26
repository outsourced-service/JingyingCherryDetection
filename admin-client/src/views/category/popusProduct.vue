<template>
	<div class="system-user-dialog-container">
		<el-dialog title="鉴定物品" v-model="dialog.isShowDialog" destroy-on-close append-to-body fullscreen>
			<!-- <div class="layout-container" v-if="dialog.type == 'openLog'">
				<userLog :user_id="dialog.row.id" @closeDialog="closeDialog" style="width: 100%; height: calc(100vh - 32px); top: 32px" />
			</div> -->
			<div class="layout-container">
				<product :category_name="dialog.row.name" :category_id="dialog.row.id" @closeDialog="closeDialog" style="width: 100%; height: calc(100vh - 32px); top: 32px" />
			</div>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="popusProduct">
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage, UploadProps } from 'element-plus';

// 引入组件
// const userLog = defineAsyncComponent(() => import('./invite/index.vue'));
const product = defineAsyncComponent(() => import('../product/index.vue'));

const dialogVisible = ref(false);
const dialog = reactive({
	isShowDialog: false,
	row: <any>{},
	type: '',
	title: '',
	submitTxt: '',
});

// 打开弹窗
const openDialog = (row: any) => {
	dialog.row = row;
	dialog.isShowDialog = true;
};

// 关闭弹窗
const closeDialog = () => {
	dialog.isShowDialog = true;
};

// 暴露变量
defineExpose({
	openDialog,
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
</script>
