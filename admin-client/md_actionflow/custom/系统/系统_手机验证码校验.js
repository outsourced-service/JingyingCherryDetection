const {
	action,
	setReturn,
	payload
} = mdapi;
const {
	mobile = "", mobileCode = ""
} = payload;

const {attemptToConsumeVerificationCode:is_verify} = action({
	action_name: "attemptToConsumeVerificationCode",
	inputs: {
		__enum_keys: {
			phoneNumber: "$phoneNumber",
			verificationCode: "$verificationCode"
		},
	}
}, {
	type: "mutation",
	variables: {
		phoneNumber: mobile,
		verificationCode: mobileCode,
	}, // 传入变量数据
	variables_def: {
		"$phoneNumber": "String!",
		"$verificationCode": "String!"
	} // 变量定义
})

if (is_verify !== true) {
	return setReturn({
		payload,
		is_verify
	}, "失败", "手机号验证失败")
}

return {
	is_verify
}