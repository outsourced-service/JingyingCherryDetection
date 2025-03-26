/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { ElMessageBox, ElMessage, genFileId } from 'element-plus';
import type { UploadInstance, UploadProps, UploadRawFile, UploadRequestOptions } from 'element-plus'
import { mdapi } from '/@/utils/zionMdapi.js';

const beforeLicenseHandle = (param: UploadRequestOptions) => {
    return new Promise((resolve) => {
        const formData = new FormData();
        formData.append('file', param.file);
        resolve(formData);
    });
};

const beforeVideoUpload = async (file: any, dialog: any) => {
    // "method未传或传值有误，仅支持uimage、ufile、uvideo"
    return await mdapi.local_uvideo(file).then((res: any) => {
        URL.revokeObjectURL(dialog.dialogImageUrl);
        dialog.dialogImageUrl = URL.createObjectURL(file);
        dialog.ruleForm.video_id = res.videoId;
    });
}

const beforeImageUpload = async (file: any, dialog: any) => {
    // "method未传或传值有误，仅支持uimage、ufile、uvideo"
    await mdapi.local_uimage(file).then((res: any) => {
        dialog.ruleForm.img_id = res.imageId;
    });
    return true
}

const beforeFileUpload = async (file: any, dialog: any) => {
    // "method未传或传值有误，仅支持uimage、ufile、uvideo"
    return await mdapi.local_ufile(file).then((res: any) => {
        dialog.ruleForm.file_id = res.fileId;
    });
}

const handleExceed = async (upload: any, files: any, type: any, dialog: any) => {
    upload!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    if (type === "image") await beforeImageUpload(file, dialog)
    else if (type === "video") await beforeVideoUpload(file, dialog)
    else if (type === "file") await beforeFileUpload(file, dialog)
    upload!.handleStart(file)
}
const fileType = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.rar'];
const videoType = ['.mp3', 'audio/mpeg', '.mp4', 'video/mp4'];
const ImgType = ['image/png', 'image/x-png', 'image/jpeg', 'image/jpg', 'image/webp'];
export default {
    beforeLicenseHandle,
    handleExceed,
    beforeVideoUpload,
    beforeImageUpload,
    beforeFileUpload,
    fileType, 
    videoType, 
    ImgType
}