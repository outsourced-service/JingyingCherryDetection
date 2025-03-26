import { initUnified } from './../unified';
import { mdapi } from '/@/utils/zionMdapi.js';

/* 菜单相关接口 */
export function useMenuApi() {
	return {
		useMenuList: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_菜单列表', data);
		},
		useAddMenu: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_菜单新增', data);
		},
		useEditMenu: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_菜单编辑', data);
		},
		useDelMenu: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_菜单删除', data);
		},
		
	};
}

/* 角色相关接口 */
export function useRoleApi() {
	return {
		useRolePermission: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_角色设置菜单和权限', data);
		},
		...initUnified("role", ["id name describe type",
			{
				response_key: "menu",
				action_name: "role_menu",
				fields: ["id menu{id idx name icon{id url}path menu_parent_menu attach_data}"],
			}, {
				response_key: "per",
				action_name: "role_per",
				fields: ["id per{id name describe}"],
			}, {
				response_key: "manager_role",
				action_name: "manager_role_aggregate",
				fields: ["aggregate{count}"],
			}, {
				response_key: "user_role",
				action_name: "user_role_aggregate",
				fields: ["aggregate{count}"],
			}]),
		useRoleList: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_角色列表', {
				where: {
					name: { _neq: "超级管理员" },
				},
				...data,
			});
		},
		
	};
}



/* 用户相关接口 */
export function useUserApi() {
	return {
		userRegister: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_用户注册', data);
		},
		userManagerList: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_用户列表', data);
		},
		userLogin: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_用户登录', data);
		},
		userRegistration: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_用户注册', data);
		},
		userLogoff: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_用户注销', data);
		},
		userLogActive: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_用户恢复', data);
		},
		userRole: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_用户设置角色', data);
		},
		userBaseInfo: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_用户修改基础信息', data);
		},
		userUpdateAccount: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_用户修改账户信息', data);
		},
		userGetAccount: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_获取用户信息', data);
		},
		userReset: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_重置用户密码', data);
		},
	};
}



/* 权限相关接口 */
export function usePermissionApi() {
	return {
		usePermissionList: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_权限列表', data);
		},
		useAddPermission: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_权限新增', data);
		},
		useEditPermission: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_权限编辑', data);
		},
		useDelPermission: (data: object) => {
			return mdapi.api('/RBAC/', 'RBAC_权限删除', data);
		},
	};
}
