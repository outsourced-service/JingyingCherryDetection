<template>
	<el-dialog class="popuExcelFile" :title="dialog.title" v-model="dialog.isShowDialog" width="70vw"
		@close="closeDialog">
		<template #footer>
			<el-button v-if="tableData.XLSX.length" type="primary" size="default" @click="confirm">确认上传</el-button>
		</template>
		<el-upload class="upload-demo" ref="eluploadRef" drag multiple :limit="1" :auto-upload="false" accept=".xlsx"
			:on-change="onchange" :on-exceed="onexceed">
			<el-icon class="el-icon--upload"><upload-filled /></el-icon>
			<div class="el-upload__text">
				将文件拖到此处或<em>单击上传</em>

			</div>
			<template #tip>
				<div class="el-upload__tip">
					<el-button type="primary" link @click="dialog.template">模板下载</el-button>
				</div>
			</template>
			<template #file="{}">
				<el-table :data="dialog.tableData" v-loading="dialog.loading" style="width: 100%" height="40vh" stripe
					border>
					<el-table-column v-for="(item, index) in tableData.title" :key="index" :label="item"
						:prop="index + ''">
					</el-table-column>
				</el-table>
				<el-pagination v-if="!!tableData.XLSX.length" @size-change="onHandleSizeChange"
					@current-change="onHandleCurrentChange" :pager-count="5" :page-sizes="[10, 20, 30]"
					v-model:current-page="dialog.pageNum" background v-model:page-size="dialog.pageSize"
					layout="total, sizes, prev, pager, next, jumper" :total="tableData.XLSX.length">
				</el-pagination>
			</template>
		</el-upload>
		<el-dialog class="uploadProgress" v-model="dialog.isUploading" width="70vw" append-to-body
			:close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
			<template #footer>
				<div v-if="percentage.percentage >= 100">
					<div v-if="uploadData.failData.length">
						<el-button type="primary" size="default" link @click="exportFailData">导出上传失败的数据</el-button>
						<el-text class="mx-1">，请检查数据是否正常后再次进行上传</el-text>
					</div>
					<el-button size="default" @click="closeUploading">关闭</el-button>
				</div>
			</template>
			<el-table :data="dialog.uploadData" style="width: 100%" height="70vh" stripe>
				<el-table-column v-for="(item, index) in uploadData.title" :key="index" :label="item"
					:prop="index + ''">
					<template #default="scope">
						<el-button v-if="scope.row?.[index] === 'loading'" type="primary" loading circle size="small" />
						<el-button v-else-if="scope.row?.[index] === 'success'" type="success" :icon="Check" circle
							size="small" />
						<el-button v-else-if="scope.row?.[index] === 'danger'" type="danger" :icon="Close" circle
							size="small" />
					</template>
				</el-table-column>
			</el-table>
			<el-pagination v-if="!!uploadData.XLSX.length" @size-change="onHandleSizeChange"
				@current-change="onHandleCurrentChange" :pager-count="5" :page-sizes="[10, 20, 30]"
				v-model:current-page="dialog.pageNum" background v-model:page-size="dialog.pageSize"
				layout="total, sizes, prev, pager, next, jumper" :total="uploadData.XLSX.length">
			</el-pagination>
			<el-progress :percentage="percentage.percentage" :status="percentage.status" :duration="percentage.duration"
				striped :striped-flow="percentage.stripedFlow" />
		</el-dialog>
	</el-dialog>
</template>

<script setup lang="ts" name="popuExcelFile">
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import { ElMessage, ElMessageBox, UploadRawFile, UploadUserFile, genFileId } from 'element-plus';
import { Check, Close } from '@element-plus/icons-vue'
import { ref, reactive } from 'vue';
import * as excelFile from '.';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const eluploadRef = ref();
const dialog = reactive({
	isUploading: false,
	loading: false,
	isShowDialog: false,
	time: <any>null,
	type: '',
	title: '',
	submitTxt: '',
	failName: "",
	pageNum: 1,
	pageSize: 10,
	template: async (fileData: any, fileName: any) => { },
	import: async (fileData: any, fileName: any, percentageFun: Function) => { },
	tableData: [],
	uploadData: [],
})
const tableData = reactive({ title: <any>[], XLSX: <any>[] });
const uploadData = reactive({ title: <any>[], XLSX: <any>[], failData: <any>[] });
const percentage = reactive({
	percentage: 0,
	status: "",
	duration: 15,
	stripedFlow: true
})
//定义绑定的方法
// 分页改变
const onHandleSizeChange = (val: number) => {
	dialog.pageSize = val;
	getTableData()
};
// 分页改变
const onHandleCurrentChange = (val: number) => {
	dialog.pageNum = val;
	getTableData()
};
const getTableData = () => {
	const limit = dialog.pageSize;
	const offset = (dialog.pageNum - 1) * limit;
	if (dialog.isUploading) {
		dialog.uploadData = uploadData.XLSX.slice(offset, offset + limit);
	} else {
		dialog.tableData = tableData.XLSX.slice(offset, offset + limit);
	}

}
/**文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用 */
const onchange = (files: any) => {
	if (!dialog.loading) {
		dialog.loading = true;
		excelFile.ImportFile(files.raw!).then((res: { title: any[], XLSX: any[] }) => {
			tableData.title = res.title;
			tableData.XLSX = res.XLSX;
			getTableData();
			dialog.loading = false;
			clearTimeout(dialog.time);
			dialog.time = null;
		});
	}
	dialog.time = setTimeout(() => {
		dialog.loading = false;
		clearTimeout(dialog.time);
		dialog.time = null;
	}, 30000);
}
/**当超出限制时，执行的钩子函数 */
const onexceed = (files: any) => {
	eluploadRef.value!.clearFiles()
	const file = files[0] as UploadRawFile
	file.uid = genFileId()
	eluploadRef.value!.handleStart(file)
}
/** 启动上传指令 */
const confirm = () => {
	ElMessageBox.confirm('请确保网络链接正常.', '是否确认上传?',).then(() => {
		dialog.isUploading = true;
		dialog.pageSize = 10;
		dialog.pageNum = 1;
		uploadData.title = [];
		uploadData.XLSX = [];
		uploadData.failData = [];
		percentage.percentage = 0;
		percentage.status = "";
		percentage.stripedFlow = true;
		dialog.import([tableData.title, ...tableData.XLSX], (title: any, XLSX: any, failData: any) => {
			uploadData.title = title;//表头
			if (XLSX) uploadData.XLSX.push(XLSX);//实际数据
			uploadData.failData = failData;//报错数据
			tableData.XLSX = failData;//报错数据
		}, (percentageObj: any) => {
			const { current, count } = percentageObj;
			percentage.percentage = Math.floor((current / count) * 100);
			percentage.status = percentage.percentage >= 100 ? "success" : "";
			percentage.stripedFlow = percentage.percentage >= 100 ? false : true;
			if (dialog.uploadData.length < dialog.pageSize) getTableData()
		})
	})
}
/** 导出失败的数据 */
const exportFailData = () => {
	dialog.template({
		data: uploadData.failData
	}, dialog.failName)
}
// 打开弹窗
const openDialog = (row: any) => {
	dialog.isShowDialog = true;
	dialog.title = row;
	switch (row) {
		case '中标记录导入':
			dialog.template = excelFile.exportSuccbids;
			dialog.import = excelFile.ImportSuccbids;
			dialog.failName = "中标记录导入失败数据.xlsx";
			break;
		case '拉黑记录导入':
			dialog.template = excelFile.exportBlackoutRecords;
			dialog.import = excelFile.ImportBlackoutRecords;
			dialog.failName = "拉黑记录导入失败数据.xlsx";
			break;
		default:
			break;
	}
};
// 关闭弹窗
const closeDialog = () => {
	dialog.isShowDialog = false;
	dialog.title = "";
	setTimeout(() => {
		tableData.title = [];
		tableData.XLSX = [];
		eluploadRef.value?.clearFiles()
	}, 200);
};
// 关闭上传弹窗
const closeUploading = () => {
	dialog.isUploading = false;
	dialog.pageSize = 10;
	dialog.pageNum = 1;
	getTableData();
	closeDialog();
	emit("refresh");
};
// 取消
// 暴露变量
defineExpose({
	openDialog,
});
</script>
<style lang="scss">
.popuExcelFile {
	.el-dialog__footer {
		padding: 0;
	}
}

.uploadProgress {
	.el-progress__text {
		min-width: auto;
	}
}
</style>