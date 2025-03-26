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

const beforeVideoUpload = async (file: any, dialog: any, key = "video_id") => {
    // "method未传或传值有误，仅支持uimage、ufile、uvideo"
    return await mdapi.local_uvideo(file).then((res: any) => {
        URL.revokeObjectURL(dialog.dialogImageUrl);
        dialog.dialogImageUrl = URL.createObjectURL(file);
        dialog.ruleForm[key] = res.videoId;
    });
}

const beforeImageUpload = async (file: any, dialog: any, key = "image_id") => {
    // "method未传或传值有误，仅支持uimage、ufile、uvideo"
    await mdapi.local_uimage(file).then((res: any) => {
        file[`imageId`] = res.imageId;
        if (Array.isArray(dialog.ruleForm[key])) dialog.ruleForm[key].push(res.imageId);
        else dialog.ruleForm[key] = res.imageId;
    });
    return true
}

const beforeFileUpload = async (file: any, dialog: any, key = "file_id") => {
    // "method未传或传值有误，仅支持uimage、ufile、uvideo"
    await mdapi.local_ufile(file).then((res: any) => {
        file[`fileId`] = res.fileId;
        if (Array.isArray(dialog.pdfList[key])) dialog.pdfList[key].push(res.fileId);
        else dialog.pdfList[key] = res.fileId;
    });
    return true
    // return await mdapi.local_ufile(file).then((res: any) => {
    //     dialog.ruleForm[key] = res.fileId;
    // });
}

const handleExceed = async (upload: any, files: any, type: any, dialog: any, key = "") => {
    upload!.clearFiles()
    const file = files[0] as UploadRawFile;
    file.uid = genFileId()
    if (type === "image") await beforeImageUpload(file, dialog, key)
    else if (type === "video") await beforeVideoUpload(file, dialog, key)
    else if (type === "file") await beforeFileUpload(file, dialog, key)
    upload!.handleStart(file)
}

const handleExceedMsg = async (msg = "图片数量超过限制") => {
    return ElMessageBox.confirm(msg).then(
        () => true,
        () => false
    )
}

const beforeImageRemove = async (file: any, dialog: any, key = "image_id") => {
    if (Array.isArray(dialog.ruleForm[key])) {
        if (file?.raw) { dialog.ruleForm[key] = dialog.ruleForm[key].filter((item: any) => item !== file.raw.imageId); }
        else { dialog.ruleForm[key] = dialog.ruleForm[key].filter((item: any) => item !== file.id); }
    } else {
        dialog.ruleForm[key] = '';
    }
}

const fileType = ['.pdf']; //  , '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.rar'
const videoType = ['.mp3', 'audio/mpeg', '.mp4', 'video/mp4'];
const ImgType = ['image/png', 'image/x-png', 'image/jpeg', 'image/jpg', 'image/webp'];
export default {
    beforeLicenseHandle,
    handleExceed,
    beforeVideoUpload,
    beforeImageUpload,
    beforeFileUpload,
    beforeImageRemove,
    handleExceedMsg,
    fileType,
    videoType,
    ImgType
}