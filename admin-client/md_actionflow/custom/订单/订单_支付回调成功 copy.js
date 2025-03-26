const { mutation, payload, query, setReturn, tokenToData, batch_mutation, dateFormat } = mdapi;
const new_time = new Date().getTime(); //获取当前时间戳
const now = dateFormat(new_time);
// const user_pk = tokenToData()?.id;
const {
	order_id,
	zion_payment_id,
	provider_transcation_id,
} = payload


//1.修改会员订单状态
//2.添加会员时间, 1年
//3.修改会员状态
//4.给邀请它的人添加资金,

//1.查询订单
//`select * from order where order_id = ${orderID}`
const [order] = query({
	model: "order",
	limit: 1,
	where: { id: { _eq: order_id } },
	fields: ["id, mode, status, user_user, user{id}, price"]
})
// 查询用户
const user = mutation({
	action_name: "update_user_by_pk",
	pk_columns: { id: order?.user?.id },
	_set: {
		updated_at: Date.now()
	},
	fields: ["id,updated_at, vip_exp_time, user_inviteparent{id capital frozen_capital}"]
})

if (!order || !user) {
	return setReturn(payload, "失败", "没有查询到订单和用户信息")
}
payload.orderInfo = order;
payload.userInfo = user;

// 判断类型
if (order?.mode === "会员开通订单") {
	const new_vip_exp_time = new Date(user.vip_exp_time) && user?.vip_exp_time > new Date() ? new Date(new Date(user.vip_exp_time).setFullYear(new Date().getFullYear() + 1)) : new Date(new Date().setFullYear(new Date().getFullYear() + 1));
	// 查询分销比例
	const resource = query({
		model: "resource",
		where: {
			_or: [{ resource_type: { _eq: '会员分销配置' } }, { name: { _eq: '会员开通金额' }, resource_type: { _eq: '金额' } }]

		},
		fields: ["id, mode, text resource_type"]
	})
	let resource_money = null;
	let resource_rule = null;
	for (let i = 0; i < resource.length; i++) {
		if (resource[i].resource_type == '会员分销配置') {
			resource_rule = resource[i]
		} else {
			resource_money = resource[i]
		}
	}
	if (resource_rule.text != 0 && resource_rule?.text && user?.user_inviteparent) {
		const money = resource_rule.mode === "百分比" ? Math.round(resource_money.text * resource_rule.text / 100) * 1 : Math.round(resource_rule.text);
		//2.更新订单
		return batch_mutation([{
			action_name: "update_order", // 修改会员订单状态
			where: {
				id: {
					_eq: order?.id
				}
			},
			_set: {
				status: "已完成",
				attach_data: [payload]
			}
		}, { // 会员时间修改
			response_key: "update_user_one",
			action_name: "update_user",
			where: {
				id: {
					_eq: user?.id
				}
			},
			_set: {
				vip_exp_time: new_vip_exp_time.getTime()
			}
		}, { // 分销
			response_key: "update_user_two",
			action_name: "update_user",
			where: {
				id: {
					_eq: user?.user_inviteparent.id
				}
			},
			// _set: {
			// 	capital: user?.user_inviteparent?.capital + money
			// }
			_inc: {
				capital: money
			}
		}, { // 添加用户个人信息操作日志
			action_name: "insert_user_logs_one",
			object: {
				user_user: user?.id,
				type: '开通会员',
				title: '开通会员',
				content: `用户开通会员`,
				attach_data: [payload]
			},
			fields: "id",
		}, { // 添加父级邀请人资产变动日志
			action_name: "insert_user_assets_logs_one",
			object: {
				user_user: user?.user_inviteparent.id,
				type: '入账',
				title: '会员开通分销奖励',
				content: `因邀请的用户于${now}，开通了会员，获得分销金额${money}分`,
				init_val: user?.user_inviteparent?.capital + user?.user_inviteparent?.frozen_capital,
				change_val: money,
				balance: user?.user_inviteparent?.capital + user?.user_inviteparent?.frozen_capital + money,
				attach_data: [payload]
			},
			fields: "id",
		}])
	} else {
		//2.更新订单
		return batch_mutation([{ // 修改会员订单状态
			action_name: "update_order",
			where: {
				id: {
					_eq: order?.id
				}
			},
			_set: {
				status: "已完成",
				attach_data: [payload]
			}
		}, { // 会员时间修改
			response_key: "update_user_one",
			action_name: "update_user",
			where: {
				id: {
					_eq: user?.id
				}
			},
			_set: {
				vip_exp_time: new_vip_exp_time.getTime()
			}
		}, { // 添加用户个人信息操作日志
			action_name: "insert_user_logs_one",
			object: {
				user_user: user?.id,
				type: '开通会员',
				title: '开通会员',
				content: `用户开通会员`,
				attach_data: [payload]
			},
			fields: "id",
		}])
	}
} else {
	// 查询分销比例
	const [resource] = query({
		model: "resource",
		where: { resource_type: { _eq: '订单分销配置' } },
		fields: ["id, mode, text"]
	})
	if (resource.text != 0 && resource?.text && user?.user_inviteparent) {
		const money = resource.mode === "百分比" ? Math.round(order.price * resource.text / 100) * 1 : Math.round(resource.text);
		return batch_mutation([{ // 修改订单状态
			action_name: "update_order",
			where: {
				id: {
					_eq: order?.id
				}
			},
			_set: {
				status: "待用户发出",
				attach_data: [payload]
			}
		}, { // 添加订单流程
			action_name: "insert_order_process_one",
			object: {
				user_user: order?.user_user,
				order_order: order?.id,
				title: "待用户发出",
				content: `待付款 -> 待用户发出 (微信支付完成)`
			},
			fields: "id",
		}, { // 分销
			response_key: "update_user",
			action_name: "update_user",
			where: {
				id: {
					_eq: user?.user_inviteparent.id
				}
			},
			// _set: {
			// 	capital: user?.user_inviteparent?.capital + money
			// }
			_inc: {
				capital: money
			}
		}, { // 添加父级邀请人资产变动日志
			action_name: "insert_user_assets_logs_one",
			object: {
				user_user: user?.user_inviteparent.id,
				type: '入账',
				title: '用户订单分销奖励',
				content: `因邀请的用户于${now}，支付了鉴定订单款项，获得分销金额${money}分`,
				init_val: user?.user_inviteparent?.capital + user?.user_inviteparent?.frozen_capital,
				change_val: money,
				balance: user?.user_inviteparent?.capital + user?.user_inviteparent?.frozen_capital + money,
				attach_data: [payload]
			},
			fields: "id",
		}])
	} else {
		return batch_mutation([{ // 修改订单状态
			action_name: "update_order",
			where: {
				id: {
					_eq: order?.id
				}
			},
			_set: {
				status: "待用户发出",
				attach_data: [payload]
			}
		}, { // 添加订单流程
			action_name: "insert_order_process_one",
			object: {
				user_user: order?.user_user,
				order_order: order?.id,
				title: "待用户发出",
				content: `待付款 -> 待用户发出 (微信支付完成)`
			},
			fields: "id",
		}])
	};
}
