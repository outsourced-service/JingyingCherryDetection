// mdapi.config.js,放在项目根目录（node_modules同级目录下）

export default {
	name: "鉴定后台管理系统",
	// 回调链接调用框架自定义行为
	callback_url: "https://zion-app.functorz.com/zero/GQAnbZeMAeq/callback/4a7b18a7-2392-4dfc-a48c-544bd7e5810d",
	//会自动追加到payload中的客户端数据
	client_data: {
		secret: "", //开发者密钥
		//内置框架自定义行为执行密码，mdapi执行内置的框架自定义行为时会与system.actionflow_pwd进行比对验证
		actionflow_pwd: "",
		// 统一token,mdapi在dataToToken中会取payload?.client_data.token为默认值
		token: ""

		// ...支持更多自定义配置
	},
	isClog: import.meta.env?.MODE !== "production",
	// server配置参数,用于调试，一般无需变动
	server_port: 3020,
	server_root: "http://localhost",
	// 下方为项目自定义配置
	// dingTalkCofig: {
	// 	corpId: "dingabc77f3de3eb0c17bc961a6cb783455b"
	// },
	isDebug: false, //仅对mdapi.api接口生效，启用debug时依赖本地node环境，请确保npm run start已经执行，发布到生产环境时需要改为false
}

