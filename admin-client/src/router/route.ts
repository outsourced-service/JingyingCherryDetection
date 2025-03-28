import { RouteRecordRaw } from 'vue-router';

/**
 * 建议：路由 path 路径与文件夹名称相同，找文件可浏览器地址找，方便定位文件位置
 *
 * 路由meta对象参数说明
 * meta: {
 *      title:          菜单栏及 tagsView 栏、菜单搜索名称（国际化）
 *      isLink：        是否超链接菜单，开启外链条件，`1、isLink: 链接地址不为空 2、isIframe:false`
 *      isHide：        是否隐藏此路由
 *      isKeepAlive：   是否缓存组件状态
 *      isAffix：       是否固定在 tagsView 栏上
 *      isIframe：      是否内嵌窗口，开启条件，`1、isIframe:true 2、isLink：链接地址不为空`
 *      roles：         当前路由权限标识，取角色管理。控制路由显示、隐藏。超级管理员：admin 普通角色：common
 *      icon：          菜单、tagsView 图标，阿里：加 `iconfont xxx`，fontawesome：加 `fa xxx`
 * }
 */

// 扩展 RouteMeta 接口
declare module 'vue-router' {
	interface RouteMeta {
		title?: string;
		isLink?: string;
		isHide?: boolean;
		isKeepAlive?: boolean;
		isAffix?: boolean;
		isIframe?: boolean;
		roles?: string[];
		icon?: string;
	}
}

/**
 * 定义动态路由
 * 前端添加路由，请在顶级节点的 `children 数组` 里添加
 * @description 未开启 isRequestRoutes 为 true 时使用（前端控制路由），开启时第一个顶级 children 的路由将被替换成接口请求回来的路由数据
 * @description 各字段请查看 `/@/views/system/menu/component/addMenu.vue 下的 ruleForm`
 * @returns 返回路由菜单数据
 */
export const dynamicRoutes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: '/',
		component: () => import('/@/layout/index.vue'),
		redirect: '/personal',
		meta: {
			isKeepAlive: false,
		},
		children: [ {
			path: '/system',
			name: 'system',
			component: () => import('/@/layout/routerView/parent.vue'),
			redirect: '/system/account',
			meta: {
				title: 'message.router.system',
				isLink: '',
				isHide: false,
				isKeepAlive: false,
				isAffix: false,
				isIframe: false,
				roles: ['admin'],
				icon: 'ele-Operation',
			},
			children: [
				{
					path: '/system/account',
					name: 'systemAccount',
					component: () => import('/@/views/system/account/index.vue'),
					meta: {
						title: 'message.router.systemAccount',
						isLink: '',
						isHide: false,
						isKeepAlive: false,
						isAffix: false,
						isIframe: false,
						roles: ['admin'],
						icon: 'ele-User',
					},
				},
				{
					path: '/system/menu',
					name: 'systemMenu',
					component: () => import('/@/views/system/menu/index.vue'),
					meta: {
						title: 'message.router.systemMenu',
						isLink: '',
						isHide: true,
						isKeepAlive: false,
						isAffix: false,
						isIframe: false,
						roles: ['admin'],
						icon: 'ele-Menu',
					},
				},
				{
					path: '/system/role',
					name: 'systemRole',
					component: () => import('/@/views/system/role/index.vue'),
					meta: {
						title: 'message.router.systemRole',
						isLink: '',
						isHide: false,
						isKeepAlive: false,
						isAffix: false,
						isIframe: false,
						roles: ['admin'],
						icon: 'ele-ColdDrink',
					},
				},{
					path: '/system/per',
					name: 'systemPer',
					component: () => import('/@/views/system/per/index.vue'),
					meta: {
						title: 'message.router.systemPer',
						isLink: '',
						isHide: true,
						isKeepAlive: false,
						isAffix: false,
						isIframe: false,
						roles: ['admin'],
						icon: 'ele-ColdDrink',
					},
				},
			],
		},{
			path: '/personal',
			name: 'personal',
			component: () => import('/@/views/system/personal/index.vue'),
			meta: {
				title: 'message.router.personal',
				isLink: '',
				isHide: true,
				isKeepAlive: false,
				isAffix: false,
				isIframe: false,
				roles: ['admin'],
				icon: 'ele-ColdDrink',
			},
		}, {
			path: '/user',
			name: 'user',
			component: () => import('/@/views/user/index.vue'),
			meta: {
				title: 'message.router.user',
				isLink: '',
				isHide: false,
				isKeepAlive: false,
				isAffix: false,
				isIframe: false,
				isMenu: false,
				roles: ['admin', 'common'],
				icon: 'ele-User',
			},
		}, {
			path: '/resource',
			name: 'resource',
			component: () => import('/@/views/resource/index.vue'),
			meta: {
				title: 'message.router.resource',
				isLink: '',
				isHide: false,
				isKeepAlive: false,
				isAffix: false,
				isIframe: false,
				roles: ['admin', 'common'],
				icon: 'ele-Notification',
			},
		}, {
			path: '/diction',
			name: 'diction',
			component: () => import('/@/views/diction/index.vue'),
			meta: {
				title: 'message.router.diction',
				isLink: '',
				isHide: false,
				isKeepAlive: false,
				isAffix: false,
				isIframe: false,
				isMenu: false,
				roles: ['admin', 'common'],
				icon: 'ele-Memo',
			},
		},{
			path: '/order',
			name: 'order',
			component: () => import('/@/views/order/index.vue'),
			meta: {
				title: 'message.router.order',
				isLink: '',
				isHide: false,
				isKeepAlive: false,
				isAffix: false,
				isIframe: false,
				isMenu: false,
				roles: ['admin', 'common'],
				icon: 'ele-DocumentCopy',
			},
		},{
			path: '/product',
			name: 'product',
			component: () => import('/@/views/product/index.vue'),
			meta: {
				title: 'message.router.product',
				isLink: '',
				isHide: true,
				isKeepAlive: false,
				isAffix: false,
				isIframe: false,
				isMenu: true,
				roles: ['admin', 'common'],
				icon: 'ele-TakeawayBox',
			},
		},{
			path: '/invite',
			name: 'invite',
			component: () => import('/@/views/user/invite/index.vue'),
			meta: {
				title: 'message.router.invite',
				isLink: '',
				isHide: false,
				isKeepAlive: false,
				isAffix: false,
				isIframe: false,
				isMenu: false,
				roles: ['admin', 'common'],
				icon: 'ele-Ticket',
			},
		},{
			path: '/category',
			name: 'category',
			component: () => import('/@/views/category/index.vue'),
			meta: {
				title: 'message.router.category',
				isLink: '',
				isHide: false,
				isKeepAlive: false,
				isAffix: false,
				isIframe: false,
				isMenu: false,
				roles: ['admin', 'common'],
				icon: 'ele-CopyDocument',
			},
		},{
			path: '/assets',
			name: 'assets',
			component: () => import('/@/views/user/assets/index.vue'),
			meta: {
				title: 'message.router.assets',
				isLink: '',
				isHide: false,
				isKeepAlive: false,
				isAffix: false,
				isIframe: false,
				isMenu: false,
				roles: ['admin', 'common'],
				icon: 'ele-WalletFilled',
			},
		},{
			path: '/dashboard',
			name: 'dashboard',
			component: () => import('/@/views/dashboard/index.vue'),
			meta: {
				title: '数据看板',
				isLink: '',
				isHide: false,
				isKeepAlive: true,
				isAffix: false,
				isIframe: false,
				roles: ['admin', 'common'],
				icon: 'ele-Monitor',
			},
		}],
	},
];
/**
 * 定义404、401界面
 * @link 参考：https://next.router.vuejs.org/zh/guide/essentials/history-mode.html#netlify
 */
export const notFoundAndNoPower = [
	{
		path: '/:path(.*)*',
		name: 'notFound',
		component: () => import('/@/views/error/404.vue'),
		meta: {
			title: 'message.staticRoutes.notFound',
			isHide: true,
		},
	},
	{
		path: '/401',
		name: 'noPower',
		component: () => import('/@/views/error/401.vue'),
		meta: {
			title: 'message.staticRoutes.noPower',
			isHide: true,
		},
	},
];

/**
 * 定义静态路由（默认路由）
 * 此路由不要动，前端添加路由的话，请在 `dynamicRoutes 数组` 中添加
 * @description 前端控制直接改 dynamicRoutes 中的路由，后端控制不需要修改，请求接口路由数据时，会覆盖 dynamicRoutes 第一个顶级 children 的内容（全屏，不包含 layout 中的路由出口）
 * @returns 返回路由菜单数据
 */
export const staticRoutes: Array<RouteRecordRaw> = [
	{
		path: '/login',
		name: 'login',
		component: () => import('/@/views/login/index.vue'),
		meta: {
			title: '登录',
		},
	},
	/**
	 * 提示：写在这里的为全屏界面，不建议写在这里
	 * 请写在 `dynamicRoutes` 路由数组中
	 */
];
