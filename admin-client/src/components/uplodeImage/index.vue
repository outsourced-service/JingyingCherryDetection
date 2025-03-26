<template>
	<el-upload
	    v-model:file-list="dialog.fileList"
	    action=""
		multiple
		:auto-upload="true"
		accept="jpg,jpeg,png,PNG"
	    list-type="picture-card"
		:before-upload="async (file: any) => await beforeImageUpload(file, dialog)"
	    :on-remove="handleRemove"
		:on-preview="handlePictureCardPreview"
	  >
	    <el-icon><Plus /></el-icon>
	  </el-upload>
	
	  <el-dialog v-model="dialogVisible">
	    <img w-full :src="dialogImageUrl" alt="Preview Image" />
	  </el-dialog>
</template>

<script setup lang="ts">
	import { reactive, ref, defineEmits } from 'vue'
	import { Plus } from '@element-plus/icons-vue'
	import { ElMessageBox, ElMessage, genFileId } from 'element-plus';
	import type { UploadInstance, UploadProps, UploadRawFile, UploadRequestOptions, UploadUserFile } from 'element-plus'
	import { mdapi } from '/@/utils/zionMdapi.js';
	
	const fileList = ref<UploadUserFile[]>([])
	
	const dialogImageUrl = ref('')
	const dialogVisible = ref(false)
	
	// 定义变量内容
	const dialog = reactive({
		row: <any>{},
		type: '',
		title: '',
		submitTxt: '',
		fileList: <any>[],
		image: '',
		ruleForm: <any>{
			
		},
	});
	
	const imageList = ref([]);
	
	const emit = defineEmits(["imageList"]);
	
	const list = ref([]);
	
	const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
	  console.log(uploadFile, uploadFiles)
	   emit("imageList", dialog.fileList);
	};
	
	const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
	  dialogImageUrl.value = uploadFile.url!
	  dialogVisible.value = true
	};
	
	const beforeLicenseHandle = (param: UploadRequestOptions) => {
	    return new Promise((resolve) => {
	        const formData = new FormData();
	        formData.append('file', param.file);
	        resolve(formData);
	    });
	};
	
	const beforeImageUpload = async (file: any, dialog: any) => {
	    await mdapi.local_uimage(file).then((res: any) => {
			dialog.fileList.push({
				url: res.downloadUrl,
				id: res.imageId
			});
			emit("imageList", dialog.fileList);
	    });
		return true;
	};
	
	const handleExceed = async (upload: any, files: any, type: any, dialog: any) => {
	    upload!.clearFiles()
	    const file = files[0] as UploadRawFile
	    file.uid = genFileId()
	    await beforeImageUpload(file, dialog)
	    upload!.handleStart(file)
	};
	
	const clearImage = () => {
		dialog.fileList = [];
		emit("imageList", dialog.fileList);
	}
</script>

<style>
</style>