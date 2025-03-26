<template>
	<div class="editor-container">
		<Toolbar :editor="editorRef" :mode="mode" />
		<Editor :mode="mode" :defaultConfig="state.editorConfig" :style="{ height }" v-model="state.editorVal"
			@onCreated="handleCreated" @onChange="handleChange" />
	</div>
</template>

<script setup lang="ts" name="wngEditor">
// https://www.wangeditor.com/v5/for-frame.html#vue3
import '@wangeditor/editor/dist/css/style.css';
import { reactive, shallowRef, watch, onBeforeUnmount } from 'vue';
import { IDomEditor, DomEditor } from '@wangeditor/editor';
import { Toolbar, Editor } from '@wangeditor/editor-for-vue';
import { mdapi } from '/@/api/index';

// 定义父组件传过来的值
const props = defineProps({
	// 是否禁用
	disable: {
		type: Boolean,
		default: () => false,
	},
	// 内容框默认 placeholder
	placeholder: {
		type: String,
		default: () => '请输入内容...',
	},
	// https://www.wangeditor.com/v5/getting-started.html#mode-%E6%A8%A1%E5%BC%8F
	// 模式，可选 <default|simple>，默认 default
	mode: {
		type: String,
		default: () => 'default',
	},
	// 高度
	height: {
		type: String,
		default: () => '310px',
	},
	// 双向绑定，用于获取 editor.getHtml()
	getHtml: String,
	// 双向绑定，用于获取 editor.getText()
	getText: String,
});

// 定义子组件向父组件传值/事件
const emit = defineEmits(['update:getHtml', 'update:getText']);

// 定义变量内容
type InsertFnType = (url: string, alt: string, href: string) => void
const editorRef = shallowRef();
const state = reactive({
	editorConfig: {
		placeholder: props.placeholder,
		MENU_CONF: { uploadImage: {}, uploadVideo: {} }
	},
	editorVal: props.getHtml,
});

//配置上传图片
state.editorConfig.MENU_CONF['uploadImage'] = {
	// 小于该值就插入 base64 格式（而不上传），默认为 0
	base64LimitSize: 5 * 1024, // 5kb
	// 自定义上传
	async customUpload(file: File, insertFn: InsertFnType) {  // TS 语法
		const { contentType, downloadUrl, imageId, uploadUrl } = await mdapi.local_uimage(file);
		insertFn(downloadUrl, file.name, `fz_image_${imageId}`);
	}
}
//配置上传视频
state.editorConfig.MENU_CONF['uploadVideo'] = {
	// 自定义上传
	async customUpload(file: File, insertFn: InsertFnType) {  // TS 语法
		const { contentType, downloadUrl, videoId, uploadUrl } = await mdapi.local_uvideo(file);
		insertFn(downloadUrl, `fz_video_${videoId}`, `fz_video_${videoId}`);
	}
}
// 编辑器回调函数
const handleCreated = (editor: IDomEditor) => {
	editorRef.value = editor;
};
// 编辑器内容改变时
const handleChange = (editor: IDomEditor) => {
	const getHtml = editor.getHtml();
	emit('update:getHtml', getHtml);
	emit('update:getText', editor.getText());
};
// 页面销毁时
onBeforeUnmount(() => {
	const editor = editorRef.value;
	if (editor == null) return;
	editor.destroy();
});
// 监听是否禁用改变
// https://gitee.com/lyt-top/vue-next-admin/issues/I4LM7I
watch(
	() => props.disable,
	(bool) => {
		const editor = editorRef.value;
		if (editor == null) return;
		bool ? editor.disable() : editor.enable();
	},
	{
		deep: true,
	}
);
// 监听双向绑定值改变，用于回显
watch(
	() => props.getHtml,
	(val) => {
		state.editorVal = val;
	},
	{
		deep: true,
	}
);
</script>
