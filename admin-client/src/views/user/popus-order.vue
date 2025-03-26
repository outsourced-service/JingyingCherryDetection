<template>
    <div class="system-user-dialog-container">
        <el-dialog v-model="dialog.isShowDialog" destroy-on-close append-to-body fullscreen>
            <div class="layout-container ">
                <order :user_id="dialog.row.id" @closeDialog="closeDialog"
                    style="width: 100%;height: calc(100vh - 32px);top: 32px;" />
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="duties">
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';

// 引入组件
const order = defineAsyncComponent(() => import('../order/index.vue'));

const dialog = reactive({
    isShowDialog: false,
    row: <any>{},
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
</script>
