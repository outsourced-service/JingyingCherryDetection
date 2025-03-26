import { mdapi } from '/@/utils/zionMdapi.js';
import { Session } from '/@/utils/storage';
import Cookies from 'js-cookie';

/**
 * （不建议写成 request.post(xxx)，因为这样 post 时，无法 params 与 data 同时传参）
 *
 * 登录api接口集合
 * @method signIn 用户登录
 * @method signOut 用户退出登录
 */
export function useLoginApi() {
	return {
		signIn: (username: string, password: string) => {
			return mdapi
				.api('/RBAC/', 'RBAC_用户登录', {
					username,
					password,
				})
				.then((res: any) => {
					//获取登录中的信息
					const { menu_list, ...info } = res;
					// 存储token管理状态
					Session.set('token', JSON.stringify(info));
					// 存储route管理状态
					Session.set('route', JSON.stringify(menu_list));
					return info.token;
				});
		},
		getUserInfo: () => {
			return mdapi
				.api('/RBAC/', 'RBAC_获取用户信息')
				.then((res: any) => {
					const { manager, menu_list } = res;
					// 存储用户信息
					Session.set('userInfo', JSON.stringify({
						...manager,
						reRequest_time: new Date().getTime() + 60000 * 30,
						login_time: new Date().toLocaleString(),
						menu_list
					}));
					// 用户名称
					Cookies.set('userName', manager.nickname);
					// 存储route管理状态
					Session.set('route', JSON.stringify(menu_list));
					return {
						...manager,
						menu_list
					}
				});
		},
		signOut: () => { },
		addAdmin: (username: string, password: string, nickname: string, phone: string) => {
			return mdapi.api('/RBAC/', 'RBAC_用户注册', {
				username,
				password,
				nickname,
				phone,
			});
		},
	};
}
