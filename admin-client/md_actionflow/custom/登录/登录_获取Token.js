const { query, mutation, setReturn, decimalToBase62, callActionflow, dataToToken, payload } = mdapi;
const getToekn = (ID) => mdapi.setReturn({ user_pk: ID, ...mdapi.dataToToken({ model: "user", id: ID }) }, "成功", "登录成功");
const {
	account_pk = 1000000000000001,
	mobile,
	mobileCode,
	isRegisterAuto = true,
	isRegisterMobileRequired = false
} = payload;
if(!account_pk)return {};

//1.查找account 上的user
const account = query({
	model: "account_by_pk",
	id: account_pk,
	fields: ["id username password oauth2_user_info_map  updated_at profile_image_id fz_deleted user_user", {
		action_name: "user",
		fields: ["id nickname avatar_id"]
	}]
})
if(account.user_user) return getToekn(account.user_user);
return {}