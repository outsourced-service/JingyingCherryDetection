const { mutation, payload, query, setReturn, tokenToData, batch_mutation } = mdapi;
const new_time = new Date().getTime(); //获取当前时间戳
// const user_pk = tokenToData()?.id;
const { } = payload;

//2.修改订单状态，并添加流程信息
return batch_mutation([{
    action_name: "delete_order",
    where: {
		mode: {
			_eq: "会员开通订单"
		},
		status: {
		    _eq: "待付款"
		}
    }
}])