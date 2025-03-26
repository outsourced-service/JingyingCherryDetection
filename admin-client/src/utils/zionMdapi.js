import zionMdapi from 'zion-mdapi';
import mdapiConfig from '/mdapi.config.js';

// 定制请求loading和错误toast的代码
import { ElMessage, ElLoading } from 'element-plus';
let loadingService = null;
const utils = {
	showLoading: (info) => {
		if (!loadingService) {
			loadingService = ElLoading.service({
				lock: info?.mask,
				text: info?.content || 'loading',
				background: 'rgba(0, 0, 0, 1)',
			});
		}
	},
	hideLoading: () => {
		if (loadingService) {
			loadingService.close();
			loadingService = null;
		}
	},
	showToast: (info) => {
		ElMessage.error(info?.content || 'error');
	},
	hindToast: () => { },
};

let mdapi = null,
	isMdapiInitRuning = false,
	isMdapiInited = false,
	config = mdapiConfig,
	waitToRunTasks = [];

let is_loading = false
let dealLoading_times = 0

function startMdapiInit() {
	isMdapiInitRuning = true;
}

function endMdapiInit(data, dealType = "setClientDataToken") {
	isMdapiInitRuning = false;
	isMdapiInited = true;
	if (dealType == "setClientDataToken") {
		return setClientDataToken(data)
	} else if (dealType == "setClientData") {
		return setClientData(data)
	} else if (dealType == "reload") {
		return reload(data)
	} else {
		throw new Error(`dealType有误，可选值：1.setClientDataToken 2.setClientData 3.reload`)
	}
}

function onMdapiReady(callback) {
	if (isMdapiInitRuning || !isMdapiInited) {
		waitToRunTasks.push(callback);
	} else {
		callback && callback();
	}
}

function runTask() {
	waitToRunTasks.forEach(fn => typeof fn === "function" && fn())
	waitToRunTasks = [];
}

function toast(errMsg = '出错啦', icon = 'none') {
	let msg = typeof errMsg === "object" ? JSON.stringify(errMsg) : errMsg;
	const timer = setTimeout(() => {
		utils.showToast &&
			utils.showToast({
				title: msg,
				icon,

				content: errMsg,
				type: icon,
				duration: 1500
			})
		clearTimeout(timer)
	}, 0)
}

function changeloading(dealLoading = true, title = '') {
	// 避免阻塞，异步的消息提示
	if (dealLoading) {
		dealLoading_times += 1
	}
	if (!dealLoading) {
		dealLoading_times -= 1
	}
	if (!is_loading) {
		if (dealLoading_times > 0) {
			// 首次进入loading
			config.isClog !== false &&
				console.log(`\n\n%c======>loading_start.............>`, 'color: #0055ff')
			utils.showLoading &&
				utils.showLoading({
					title,

					content: title,
					mask: true,
				})
			is_loading = true
		}
	} else if (is_loading) {
		if (dealLoading_times === 0) {
			config.isClog !== false &&
				console.log(`%c======<loading_end================<\n\n`, 'color: #0055ff')
			utils.hideLoading && utils.hideLoading()
			is_loading = false
		} else if (dealLoading_times < 0) {
			dealLoading_times = 0
		}
	}
	return is_loading
}

function getApi(mdapi) {
	const api = async (actionflow_dir, actionflow_name, payload, api_config = {}) => {
		const {
			isReqLoading = false, isErrorToast = true, isDebug, attach_data = {}
		} = api_config
		isReqLoading && changeloading(true)

		if (isDebug === true || config?.isDebug === true) {
			return mdapi
				.debugActionflow({
					actionflow_type: "custom",
					actionflow_dir,
					actionflow_name,
					attach_data,
					payload
				})
				.catch((e) => {
					isErrorToast && toast(e?.message || e)
					throw e
				})
				.finally(() => {
					isReqLoading && changeloading(false)
				})
		}

		return mdapi
			.callActionflow({
				actionflow_dir,
				actionflow_name,
				payload
			})
			.catch((e) => {
				isErrorToast && toast(e?.message || e)
				throw e
			})
			.finally(() => {
				isReqLoading && changeloading(false)
			})
	}
	return api
}

function reload(mdapi_config = {}) {
	config = mdapi_config
	mdapi = zionMdapi.init(config)
	mdapi.api = getApi(mdapi)
	const runTaskTimer = setTimeout(() => {
		clearTimeout(runTaskTimer)
		runTask();
	}, 50)
	return {
		mdapiConfig: mdapi_config,
		mdapi
	}
}

function setClientData(clientData = {}) {
	const mdapi_config = {
		...config
	}
	mdapi_config.client_data = clientData || {}
	return reload(mdapi_config)
}

function setClientDataToken(token = '') {
	const clientData = {
		...(config.client_data || {})
	}
	clientData.token = token
	return setClientData(clientData)
}

// 初始化mdapi
mdapi = zionMdapi.init(config)
mdapi.api = getApi(mdapi)

export {
	mdapi,
	config as mdapiConfig,

	startMdapiInit,
	endMdapiInit,

	onMdapiReady,


	reload,
	setClientData,
	setClientDataToken
}