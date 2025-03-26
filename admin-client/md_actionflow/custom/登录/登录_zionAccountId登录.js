const {
	query,
	mutation,
	setReturn,
	decimalToBase62,
	callActionflow,
	dataToToken
} = mdapi;
const {
	account_pk = 1000000000000009, mobile, mobileCode, isRegisterAuto = true, isRegisterMobileRequired = false
} = mdapi.payload;


// 1.判断是否存在账号
const [user_acc] = query({
	model: "user_acc",
	where: {
		type: {
			_eq: "zionAccountId登录"
		},
		acc_val: {
			_eq: account_pk + ""
		}
	},
	order_by: {
		id: "desc"
	},
	field_string: `user{id}`
})
let user = user_acc?.user;
if (!user?.id && !isRegisterAuto) {
	return setReturn({
		account_pk
	}, "失败", "账户不存在")
}


// 2 不存在则自动注册
if (!user?.id && isRegisterAuto) {
	const [account] = query({
		model: "account",
		where: {
			id: {
				_eq: account_pk || 0
			}
		},
		fields: `id username password profile_image_id`
	})
	if (!account) {
		return setReturn({
			account_pk
		}, "失败", "account_pk有误")
	}

	// 如果不强制要求注册时提供手机号，则直接注册
	if (!isRegisterMobileRequired) {
		const username = "u_" + decimalToBase62(new Date().getTime());
		const [user_tmp] = mutation({
			operation: "insert_user",
			objects: [{
				username,
				nickname: account?.username || username,
				password: account?.password,
				avatar_id: account?.profile_image_id,

				user_acc: {
					data: [{
						type: "zionAccountId登录",
						acc_val: account_pk + ""
					}]
				}
			}],
			field_string: `id`
		})?.returning
		if (!user_tmp) {
			return setReturn({
				account_pk
			}, "失败", "注册失败")
		}
		user = user_tmp;
	} else {
		// 注册两种登录方式：1.zionAccountId登录 2.手机验证码登录

		// 手机号和验证码校验
		const mobileVdtRes = callActionflow({
			actionflow_name: "系统_手机验证码校验",
			payload: {
				mobile,
				mobileCode
			}
		})
		if (mobileVdtRes?.status !== "成功") {
			return setReturn(mobileVdtRes.data, "失败", mobileVdtRes.msg)
		}

		// 查询用户信息
		const [user_tmp] = query({
			model: "user",
			where: {
				mobile: {
					_eq: mobile + ""
				}
			},
			field_string: `id`
		})

		if (user_tmp?.id) {
			// 用户已存在则直接为该用户新增登录方式
			const [user_acc_tmp] = mutation({
				operation: "insert_user_acc",
				objects: [{
					user_user: user_tmp.id,
					type: "zionAccountId登录",
					acc_val: account_pk + ""
				}]
			})?.returning
			if (!user_acc_tmp) {
				return setReturn({
					mobile
				}, "失败", "注册异常")
			}
			user = user_tmp;
		} else {
			const username = "u_" + decimalToBase62(new Date().getTime());
			// 新增用户和登录方式
			const [user_tmp] = mutation({
				operation: "insert_user",
				objects: [{
					username,
					nickname: account?.username || username,
					password: account?.password,
					avatar_id: account?.profile_image_id,
					identity: "应聘者",
					progress_val: 0,

					mobile,
					user_acc: {
						data: [{
							type: "zionAccountId登录",
							acc_val: account_pk + ""
						}, {
							type: "手机验证码登录",
							acc_val: mobile + ""
						}]
					}
				}],
				field_string: `id`
			})?.returning
			if (!user_tmp) {
				return setReturn({
					account_pk,
					mobile
				}, "失败", "注册失败")
			}
			user = user_tmp;
		}
	}
}

if (!user?.id) {
	return setReturn({
		payload,
		user,
		ressult
	}, "失败", "登录失败")
}


// 更新该账户绑定的已登录用户
const result = mutation({
	operation: "update_account",
	where: {
		id: {
			_eq: account_pk
		}
	},
	_set: {
		user_user: user.id
	}
})?.returning



return {
	user_pk: user.id,
	userLogs: setUserLogs(user.id),
	...dataToToken({
		model: "user",
		id: user.id
	})
}

function setUserLogs(userID) {
	//1.查询今日日志
	const [userLogs] = query({
		model: "user_logs",
		limit: 1,
		where: {
			user_user: { _eq: userID },
			created_at: processDate(),
			type: { _eq: "登录" }
		},
		field_string: `id type created_at`
	})
	if (userLogs) return userLogs;
	return mutation({
		operation: "insert_user_logs",
		objects: [{
			user_user: userID,
			type: "登录",
			title: "登录成功",
			content: `与${new Date().toLocaleString()}登录成功`,
		}]
	})
}
function processDate(date = new Date()) {
	// 获取给定日期（或默认当前日期）的开始时间（午夜0点）  
	const startOfDay = new Date(date);
	startOfDay.setHours(0, 0, 0, 0);

	// 获取给定日期（或默认当前日期）的结束时间（当天的23:59:59.999）  
	// 注意：由于JavaScript的Date对象在毫秒级别上并不总是精确到999，我们通常认为它精确到毫秒  
	const endOfDay = new Date(date);
	endOfDay.setHours(23, 59, 59, 999);

	// 返回包含_gte和_lte属性的对象，这些属性是开始和结束时间的Unix时间戳  
	return {
		_gte: startOfDay.getTime(), // 开始时间的Unix时间戳（毫秒）  
		_lte: endOfDay.getTime()    // 结束时间的Unix时间戳（毫秒）  
	};
}  