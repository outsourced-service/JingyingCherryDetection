import { createApp } from 'vue';
import pinia from '/@/stores/index';
import App from '/@/App.vue';
import router from '/@/router';
import { i18n } from '/@/i18n/index';
import other from '/@/utils/other';

import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import '/@/theme/index.scss';
import VueGridLayout from 'vue-grid-layout';
const app = createApp(App);

other.elSvg(app);
app
	.use(pinia)
	.use(router)
	.use(ElementPlus, {
		locale: zhCn,
	})
	.use(i18n)
	.use(VueGridLayout)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	app.component(key, component);
}
app.mount('#app');