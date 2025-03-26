const {
	action,
	setReturn,
	payload
} = mdapi;
const {
	mobile
} = payload;
try {
	action({
		action_name: "sendVerificationCode",
		inputs: {
			__enum_keys: {
				phoneNumber: "$phoneNumber",
			},
		}
	}, {
		type: "mutation",
		variables: {
			phoneNumber: mobile,
		}, // 传入变量数据
		variables_def: {
			"$phoneNumber": "String!",
		} // 变量定义
	})
	return setReturn({
		mobile
	}, "成功", "验证码发送成功请接收。")
} catch (error) {
	return setReturn({
		mobile
	}, "失败", "请求验证码过于频繁，请等待一分钟后重试。")
}