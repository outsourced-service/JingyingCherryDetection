<template>
	<el-form size="large" class="login-content-form">
		<el-form-item class="login-animation1">
			<el-input text :placeholder="$t('message.account.accountPlaceholder1')" v-model="state.ruleForm.userName"
				clearable autocomplete="off">
				<template #prefix>
					<el-icon class="el-input__icon"><ele-User /></el-icon>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item class="login-animation2">
			<el-input :type="state.isShowPassword ? 'text' : 'password'"
				:placeholder="$t('message.account.accountPlaceholder2')" v-model="state.ruleForm.password"
				autocomplete="off">
				<template #prefix>
					<el-icon class="el-input__icon"><ele-Unlock /></el-icon>
				</template>
				<template #suffix>
					<i class="iconfont el-input__icon login-content-password"
						:class="state.isShowPassword ? 'icon-yincangmima' : 'icon-xianshimima'"
						@click="state.isShowPassword = !state.isShowPassword">
					</i>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item class="login-animation4">
			<!--  v-waves -->
			<el-button type="primary" class="login-content-submit" round @click="onSignIn"
				:loading="state.loading.signIn">
				<span>{{ $t('message.account.accountBtnText') }}</span>
			</el-button>
		</el-form-item>
	</el-form>
</template>

<script setup lang="ts" name="loginAccount">
import { reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import md5 from 'md5';
import { initFrontEndControlRoutes } from '/@/router/frontEnd';
import { Session } from '/@/utils/storage';
import { formatAxis } from '/@/utils/formatTime';
import { NextLoading } from '/@/utils/loading';
import { useLoginApi } from "/@/api/login/index";
import { endMdapiInit } from "/@/utils/zionMdapi.js"
import { initBackEndControlRoutes } from '/@/router/backEnd';
import Cookies from 'js-cookie';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);



// 定义变量内容
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const state = reactive({
	isShowPassword: false,
	ruleForm: {
		//  userName: 'admin',
		//  password: 'wpjd2024',
		userName:"",
		password:"",
	},
	loading: {
		signIn: false,
	},
});
const useLogin = useLoginApi();

// 时间获取
const currentTime = computed(() => {
	return formatAxis(new Date());
});

const onSignInDEMO = async () => {
	state.loading.signIn = true;
	// 存储 token 到浏览器缓存
	Session.set('token', Math.random().toString(36).substr(0));
	// 模拟数据，对接接口时，记得删除多余代码及对应依赖的引入。用于 `/src/stores/userInfo.ts` 中不同用户登录判断（模拟数据）
	Cookies.set('userName', state.ruleForm.userName);
	if (!themeConfig.value.isRequestRoutes) {
		// 前端控制路由，2、请注意执行顺序
		const isNoPower = await initFrontEndControlRoutes();
		signInSuccess(isNoPower);
	} else {
		// 模拟后端控制路由，isRequestRoutes 为 true，则开启后端控制路由
		// 添加完动态路由，再进行 router 跳转，否则可能报错 No match found for location with path "/"
		const isNoPower = await initBackEndControlRoutes();
		// 执行完 initBackEndControlRoutes，再执行 signInSuccess
		signInSuccess(isNoPower);
	}
}

// 登录
const onSignIn = async () => {
	
	if (!themeConfig.value.isRequestRoutes) {
		//使用测试登录
		onSignInDEMO();
		return
	}

	if (!state.ruleForm.userName) {
		ElMessage.warning(t('请输入用户名'));
		return false;
	}
	if (!state.ruleForm.password) {
		ElMessage.warning(t('请输入密码'));
		return false;
	}
	state.loading.signIn = true;//加载动画
	const token: String = await useLogin.signIn(state.ruleForm.userName, md5(state.ruleForm.password)).catch(err => {
		// state.loading.signIn = false;//加载动画
	});
	if (!token) return signInSuccess(true);
	//重启mdapi
	endMdapiInit(token)
	//获取用户信息
	await useLogin.getUserInfo();
	const isNoPower = await initBackEndControlRoutes();
	// 执行完 initBackEndControlRoutes，再执行 signInSuccess
	signInSuccess(isNoPower);
	state.loading.signIn = false;//加载动画
	return
};
// 登录成功后的跳转
const signInSuccess = (isNoPower: boolean | undefined) => {
	if (isNoPower) {
		state.loading.signIn = false;//加载动画
		// ElMessage.warning('登录失败，请检查用户名和密码！');
		Session.clear();
	} else {
		// 初始化登录成功时间问候语
		let currentTimeInfo = currentTime.value;
		// 登录成功，跳到转首页
		// 如果是复制粘贴的路径，非首页/登录页，那么登录成功后重定向到对应的路径中
		if (route.query?.redirect) {
			router.push({
				path: <string>route.query?.redirect,
				query: Object.keys(<string>route.query?.params).length > 0 ? JSON.parse(<string>route.query?.params) : '',
			});
		} else {
			router.push('/');
		}
		// 登录成功提示
		const signInText = t('message.signInText');
		ElMessage.success(`${currentTimeInfo}，${signInText}`);
		// 添加 loading，防止第一次进入界面时出现短暂空白
		NextLoading.start();
	}
	state.loading.signIn = false;
};

</script>

<style scoped lang="scss">
.login-content-form {
	margin-top: 20px;

	@for $i from 1 through 4 {
		.login-animation#{$i} {
			opacity: 0;
			animation-name: error-num;
			animation-duration: 0.5s;
			animation-fill-mode: forwards;
			animation-delay: calc($i/10) + s;
		}
	}

	.login-content-password {
		display: inline-block;
		width: 20px;
		cursor: pointer;

		&:hover {
			color: #909399;
		}
	}

	.login-content-code {
		width: 100%;
		padding: 0;
		font-weight: bold;
		letter-spacing: 5px;
	}

	.login-content-submit {
		width: 100%;
		letter-spacing: 2px;
		font-weight: 300;
		margin-top: 15px;
	}
}
</style>
