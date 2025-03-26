const { query, mutation, setReturn, decimalToBase62, callActionflow, dataToToken, payload } = mdapi;
const {
	account_pk = 1000000000000001,
	mobile,
	mobileCode,
	isRegisterAuto = true,
	isRegisterMobileRequired = false
} = payload;

//1.查找account 上的user
const account = query({
	model: "account_by_pk",
	id: account_pk,
	fields: ["id username password oauth2_user_info_map  updated_at profile_image_id fz_deleted user_user", {
		action_name: "user",
		fields: ["id nickname avatar_id"]
	}]
})
if (!account) return setReturn({ account_pk }, "失败", "account_pk有误");
//2.查找到用户就跟新头像和昵称
if (account.user) return { user_pk: account.user_user, token: updUser(account.user_user, account.profile_image_id, account.username) };
//3. 不存在则自动注册
if (!account.user_user) {
	const username = "u_" + decimalToBase62(new Date().getTime());
	const userInfo = {
		username,
		nickname: account?.username || username,
		password: account?.password,
		avatar_id: account?.profile_image_id,
		mobile: mobile || null,
		user_acc: {
			data: [{
				type: "zionAccountId登录",
				acc_val: account_pk + ""
			}]
		}
	}
	// 如果不强制要求注册时提供手机号，则直接注册
	if (!isRegisterMobileRequired) return incUser(userInfo);
	else {
		// 注册两种登录方式：1.zionAccountId登录 2.手机验证码登录

		// 手机号和验证码校验
		const mobileVdtRes = callActionflow({
			actionflow_name: "系统_手机验证码校验",
			payload: { mobile, mobileCode }
		})
		if (mobileVdtRes?.status !== "成功") return setReturn(mobileVdtRes.data, "失败", mobileVdtRes.msg);
		// 查询用户信息
		const [user_tmp] = query({
			model: "user",
			where: { mobile: { _eq: mobile + "" } },
			fields: `id`
		})

		if (user_tmp?.id) return addACC(user_tmp);
		else {
			userInfo.user_acc.data.push({
				type: "手机验证码登录",
				acc_val: mobile + ""
			})
			return incUser(userInfo);
		}
	}
}

return {
	user_pk: account.user_user,
	token: dataToToken({
		model: "user",
		id: account.user_user
	})
}

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
	return dataToToken({
		model: "user",
		id: user.id
	})
}

function incUser(userInfo) {
	const user_tmp = mutation({
		operation: "insert_user_one",
		object: userInfo,
		field_string: `id`
	})
	if (!user_tmp) return setReturn({ account_pk }, "失败", "注册失败");
	mutation({
		operation: "update_account_by_pk",
		pk_columns: { id: account_pk },
		_set: { user_user: user_tmp.id },
		field_string: `id`
	})
	return {
		user_pk: user_tmp.id,
		token: dataToToken({
			model: "user",
			id: user_tmp.id
		})
	}
}

function addACC(user_tmp) {
	// 用户已存在则直接为该用户新增登录方式
	const user_acc_tmp = mutation({
		operation: "insert_user_acc_one",
		objects: [{
			user_user: user_tmp.id,
			type: "zionAccountId登录",
			acc_val: account_pk + ""
		}],
		fields: `id`
	})
	if (!user_acc_tmp) return setReturn({ mobile }, "失败", "注册异常")
	mutation({
		operation: "update_account_by_pk",
		pk_columns: { id: account_pk },
		_set: { user_user: user_tmp.id },
		field_string: `id`
	})
	return {
		user_pk: user_tmp.id,
		token: dataToToken({
			model: "user",
			id: user_tmp.id
		})
	}
}