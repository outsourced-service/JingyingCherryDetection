const { query, mutation, setReturn, decimalToBase62, callActionflow, dataToToken, payload, dateFormat, batch_mutation } = mdapi;
const getToekn = (ID) => mdapi.setReturn({ user_pk: ID, ...mdapi.dataToToken({ model: "user", id: ID }) }, "成功", "登录成功");
const {
	account_pk = 1000000000000001,
	mobile,
	invitationCode = '',
	isInvitationCode = false,
	isRegisterAuto = true,
	isRegisterMobileRequired = true
} = payload;
if (!account_pk) return setReturn({ account_pk }, "失败", "account_pk不能为空");

//2.查找account上的user，如果显示存在直接返回token
const account = query({
	model: "account_by_pk",
	id: account_pk,
	fields: ["id username password oauth2_user_info_map updated_at profile_image_id fz_deleted user_user", {
		action_name: "user",
		fields: ["id nickname avatar_id"]
	}]
})
//未获取到account则直接报错
if (!account?.id) return setReturn({ account_pk }, "失败", "account_pk有误");
if (account?.user_user) {
	//是否有头像吗，没有头像进行更新
	if (!account?.user?.avatar_id) return updUser(account.user_user, account.profile_image_id, account.username);
	return getToekn(account?.user_user)
}
//如果不要求自动注册，这直接返回报错信息
if (!isRegisterAuto) return setReturn({ account_pk }, "失败", "登录失败");
//3.未注册进行注册先获取邀请码是谁的
const [invitationCodeRes] = query({
	model: "user",
	limit: 1,
	where: { user_id: { _eq: invitationCode || "-" } },
	fields: ["id user_id"]
})
if (!invitationCodeRes?.id && isInvitationCode) return setReturn({ account_pk }, "失败", "邀请码有误");
//4.填写相关信息,并填写邀请日志
const username = "u_" + decimalToBase62(new Date().getTime());
const userInfo = {
	user_inviteparent_user: invitationCodeRes?.id ?? null,
	user_id: decimalToBase62(account_pk),
	username,
	nickname: account?.username || username,
	password: account?.password,
	avatar_id: account?.profile_image_id,
	mobile: mobile || null,
	capital: 0,
	frozen_capital: 0,
	ai_check_count: 1,
	invite_count: 0,
	newbie_discount_count: 1,
	user_acc: {
		data: [{
			type: "zionAccountId登录",
			acc_val: account_pk + ""
		}]
	},
	...(invitationCodeRes ? {
		user_logs: {
			data: [{
				type: "用户邀请",
				title: "注册邀请",
				content: invitationCodeRes ? `用户通过邀请码"${invitationCode}"完成注册` : "用户通过微信授权登录完成注册，未填写邀请码",
				user_invitechidren_user: invitationCodeRes?.id,
			}]
		}
	} : {})
}

// 如果不强制要求注册时提供手机号，则直接注册
if (!isRegisterMobileRequired) return incUser(userInfo);
else {
	// 注册两种登录方式：1.zionAccountId登录 2.微信手机号授权登录
	// 查询用户信息
	const [user_tmp] = query({ model: "user", where: { mobile: { _eq: mobile + "" } }, fields: `id` })
	if (user_tmp?.id) return addACC(user_tmp);
	else {
		userInfo.user_acc.data.push({
			type: "微信手机号授权登录",
			acc_val: mobile + ""
		})
		return incUser(userInfo);
	}
}
//5.返回token
return getToekn(account?.user_user);

function updUser(user_user, profile_image_id, username) {
	const user = mutation({
		action_name: "update_user_by_pk",
		pk_columns: { id: user_user },
		_set: {
			nickname: username,
			avatar_id: profile_image_id
		},
		fields: ["id"]
	})
	return getToekn(user.id)
}

function incUser(userInfo) {
	const user_tmp = mutation({
		operation: "insert_user_one",
		object: userInfo,
		field_string: `id, vip_exp_time,user_inviteparent_user, user_inviteparent{id capital frozen_capital invite_count ai_check_count}`
	})
	if (!user_tmp) return setReturn({ account_pk }, "失败", "注册失败");

	// 设置新用户的 ai_check_count 初始值为1,invite_count初始值为0
	mutation({
		action_name: "update_user_by_pk",
		pk_columns: { id: user_tmp.id },
		_set: { ai_check_count: 1, invite_count: 0 },
		fields: ["id"]
	})

	// 记录新用户注册获得 AI 鉴定次数的日志
	mutation({
		action_name: "insert_user_logs_one",
		object: {
			user_user: user_tmp.id,
			type: "用户注册",
			title: "新用户注册获得 AI 鉴定次数",
			content: "新用户注册成功，获得 1 次 AI 鉴定次数",
		},
		fields: ["id"],
	})

	// 更新邀请人的 invite_count 和 ai_check_count
	if (user_tmp.user_inviteparent_user) {
		mutation({
			action_name: "update_user_by_pk",
			pk_columns: { id: user_tmp.user_inviteparent_user },
			_set: {
				invite_count: (user_tmp.user_inviteparent.invite_count + 1) % 3,
				ai_check_count: user_tmp.user_inviteparent.invite_count + 1 === 3
					? user_tmp.user_inviteparent.ai_check_count + 1
					: user_tmp.user_inviteparent.ai_check_count
			},
			fields: ["id"]
		})

		// 如果邀请人的 ai_check_count 发生变化，记录邀请用户获得 AI 鉴定次数的日志
		if (user_tmp.user_inviteparent.invite_count + 1 === 3) {
			mutation({
				action_name: "insert_user_logs_one",
				object: {
					user_user: user_tmp.user_inviteparent_user,
					type: "用户邀请",
					title: "邀请用户获得 AI 鉴定次数",
					content: "邀请用户注册成功，获得 1 次 AI 鉴定次数",
				},
				fields: ["id"],
			})
		}
	}

	//微信绑定
	const responseAccount = mutation({
		operation: "update_account_by_pk",
		pk_columns: { id: account_pk },
		_set: { user_user: user_tmp.id },
		field_string: `id`
	})

	//分销奖励
	const responseCommissionSharing = commissionSharing(user_tmp);

	//返回token
	return {
		...getToekn(user_tmp.id),
		responseAccount, responseCommissionSharing
	}
}

function addACC(user_tmp) {
	// 用户已存在则直接为该用户新增登录方式
	const user_acc_tmp = mutation({
		operation: "insert_user_acc_one",
		object: {
			user_user: user_tmp.id,
			type: "微信手机号授权登录",
			acc_val: mobile + ""
		},
		fields: `id`
	})
	if (!user_acc_tmp) return setReturn({ mobile }, "失败", "注册异常")
	mutation({
		operation: "update_account_by_pk",
		pk_columns: { id: account_pk },
		_set: { user_user: user_tmp.id },
		field_string: `id`
	})
	return getToekn(user_tmp.id)
}

function commissionSharing(user_tmp) {
	// 查询用户
	const user = user_tmp
	if (!user?.user_inviteparent_user) return;
	// 查询分销比例
	const [resource] = query({
		model: "resource",
		where: { title: { _eq: '推荐佣金金额' } },
		fields: ["id, text, mode"]
	})
	if (!(resource?.text > 0)) return;
	const money = resource.text * 1;
	return batch_mutation([{ // 分销
		response_key: "update_user_two",
		action_name: "update_user",
		where: {
			id: {
				_eq: user?.user_inviteparent.id
			}
		},
		_set: {
			capital: user?.user_inviteparent.capital + money,
		}
	}, { // 添加父级邀请人资产变动日志
		action_name: "insert_user_assets_logs_one",
		object: {
			user_user: user?.user_inviteparent.id,
			type: '入账',
			title: '用户注册分销奖励',
			content: `因邀请的用户于${dateFormat(new Date().getTime())}，进行了注册，获得分销金额${money}分`,
			init_val: user?.user_inviteparent.capital + user?.user_inviteparent.frozen_capital,
			change_val: money,
			balance: user?.user_inviteparent.capital + user?.user_inviteparent.frozen_capital + money,
			attach_data: [payload]
		},
		fields: "id",
	}])
}