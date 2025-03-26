import { defineStore } from 'pinia';
import Cookies from 'js-cookie';
import { Session } from '/@/utils/storage';
import { useLoginApi } from "/@/api/login/index";
import { endMdapiInit } from "/@/utils/zionMdapi.js"
const useLogin = useLoginApi();
/**
 * 用户信息
 * @methods setUserInfos 设置用户信息
 */
export const useUserInfo = defineStore('userInfo', {
	state: (): UserInfosState => ({
		hasCreateMenu: false,
		hasEditMenu: false,
		hasDeleteMenu: false,
		userInfos: {
			userName: '',
			photo: '',
			time: 0,
			roles: [],
			expires_in: 0,
			authBtnList: [],
			"avatar": null,
			"id": 4,
			"is_deleted": false,
			"manager_role": [
				{
					"describe": "销售",
					"id": 2,
					"name": "销售"
				},
				{
					"describe": "admin",
					"id": 3,
					"name": "超级管理员"
				}
			],
			"nickname": "zach",
			"phone": "13800138000",
			"username": "admin"
		},
	}),
	actions: {
		//检查用户的信息和token
		async setUserInfos(isRequestRoutes = false, setUserInfo = false) {
			if (setUserInfo) Session.remove('userInfo');
			if (isRequestRoutes) await this.setUserInfosDEMO()
			else {
				await this.verifyToken();
				await this.verifyUserInfo();
			}
		},
		async verifyToken() {
			const token = Cookies.get('token');
			if (!token) {
				// 清除缓存/token等
				Session.clear();
				// 使用 reload 时，不需要调用 resetRoute() 重置路由
				window.location.reload();
				return "退出登录"
			}
			const res = JSON.parse(token);
			if ((res?.expires_in ?? 0) <= new Date().getTime()) {
				// 清除缓存/token等
				Session.clear();
				// 使用 reload 时，不需要调用 resetRoute() 重置路由
				window.location.reload();
				return "退出登录"
			}
			//重启mdapi
			endMdapiInit(res.token)
		},
		async verifyUserInfo() {

			const userInfo = Session.get('userInfo');
			if (!userInfo) return await useLogin.getUserInfo().then((res: any) => this.formatUserInfo(res));
			const res = JSON.parse(userInfo);
			if ((res?.expires_in ?? 0) <= new Date().getTime()) return await useLogin.getUserInfo().then((res: any) => this.formatUserInfo(res));
			this.formatUserInfo(res);
		},
		async formatUserInfo(userInfo: any = []) {
			this.userInfos = {
				...userInfo,
				userName: userInfo.nickname,
				photo: userInfo.avatar?.url || userInfo.avatar || (userInfo.userName === 'admin'
					? 'https://img2.baidu.com/it/u=1978192862,2048448374&fm=253&fmt=auto&app=138&f=JPEG?w=504&h=500'
					: 'https://img2.baidu.com/it/u=2370931438,70387529&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'),
				time: new Date().getTime(),
				roles: userInfo.manager_role.map((res: { name: any; }) => res?.name),
				authBtnList: [...userInfo.manager_role.reduce((set: any, item: any) => {
					item.role_per.forEach((element: any) => {
						set.add(element.per.name);
					});
					return set
				}, new Set([]))],
			};
			this.hasCreateMenu = true;
			this.hasEditMenu = true;
			this.hasDeleteMenu = true;
			// console.log(this.userInfos.authBtnList);
			if (this.userInfos.roles?.length < 1) {
				// 清除缓存/token等
				Session.clear();
				// 使用 reload 时，不需要调用 resetRoute() 重置路由
				window.location.reload();
				return "退出登录"
			}
		},
		async setUserInfosDEMO() {
			// 存储用户信息到浏览器缓存
			if (Session.get('userInfo')) {
				this.userInfos = Session.get('userInfo');
			} else {
				const userInfos = <UserInfos>await this.getApiUserInfo();
				this.userInfos = userInfos;
			}
		},
		// 模拟接口数据
		// https://gitee.com/lyt-top/vue-next-admin/issues/I5F1HP
		async getApiUserInfo() {
			return new Promise((resolve) => {
				setTimeout(() => {
					// 模拟数据，请求接口时，记得删除多余代码及对应依赖的引入
					const userName = Cookies.get('userName');
					// 模拟数据
					let defaultRoles: Array<string> = [];
					let defaultAuthBtnList: Array<string> = [];
					// admin 页面权限标识，对应路由 meta.roles，用于控制路由的显示/隐藏
					let adminRoles: Array<string> = ['admin'];
					// admin 按钮权限标识
					let adminAuthBtnList: Array<string> = ['btn.add', 'btn.del', 'btn.edit', 'btn.link'];
					// test 页面权限标识，对应路由 meta.roles，用于控制路由的显示/隐藏
					let testRoles: Array<string> = ['common'];
					// test 按钮权限标识
					let testAuthBtnList: Array<string> = ['btn.add', 'btn.link'];
					// 不同用户模拟不同的用户权限
					if (userName === 'admin') {
						defaultRoles = adminRoles;
						defaultAuthBtnList = adminAuthBtnList;
					} else {
						defaultRoles = testRoles;
						defaultAuthBtnList = testAuthBtnList;
					}
					// 用户信息模拟数据
					const userInfos = {
						userName: userName,
						photo:
							userName === 'admin'
								? 'https://img2.baidu.com/it/u=1978192862,2048448374&fm=253&fmt=auto&app=138&f=JPEG?w=504&h=500'
								: 'https://img2.baidu.com/it/u=2370931438,70387529&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
						time: new Date().getTime(),
						roles: defaultRoles,
						authBtnList: defaultAuthBtnList,
					};
					Session.set('userInfo', userInfos);
					resolve(userInfos);
				}, 0);
			});
		}
	},
});
