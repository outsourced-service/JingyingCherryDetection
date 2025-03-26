const { query, setReturn, payload, batch_mutation, mutation, tokenToData } = mdapi
const {
	order_pk
} = payload;
const user_pk = tokenToData()?.id;
const new_time = new Date().getTime(); //获取当前时间戳

// 查询订单是否为鉴定订单
const [order] = query({
	model: "order",
	limit: 1,
	where: { id: { _eq: order_pk } },
	fields: ["id is_ai_identify category_category status", {
		action_name: "order_annex",
		fields: "id img{id url}"
	}, {
			action_name: "user",
			fields: "id nickname"
		}]
})
if (!order?.is_ai_identify) return setReturn(payload, "失败", "当前订单不是AI鉴定订单")
if (order?.status == '已完成') return setReturn(payload, "失败", "当前AI鉴定订单已完成")
if (order?.status == '鉴定中') return setReturn(payload, "失败", "当前鉴定订单正在鉴定中")

// 修改订单状态
mdapi.mutation({
	action_name: "update_order",
	where: { id: { _eq: order_pk } },
	_set: { status: '鉴定中' }
})

let getApi, apiNumber = 1;

// 调用第三方api

return api();

function processingInformation() {
	if (getApi.data.msg == 'Success') {
		const product = JSON.parse(getApi.data.data)
		const insert = mutation({
			operation: "insert_product_appraisal_details_one",
			object: {
                category_category: order.category_category,
                order_order: order_pk,
                is_ai_authentication:true,
                name: product.name || "-",
                age: product.age || "-",
                allusion: product.allusion || "-",
                cultural: product.cultural || "-",
                reason: product.price || "-",
                poetry: product.poetry || "-",
                poetry_country: formatPoetry(product.poetry_country || "-"),
                scarcity: product.scarcity || "-",
                source: product.source || "-",
				client: order?.user?.nickname,
				title: product.name,
				appraisal_time: new_time,
				is_certificate: false,
				cover_id: order.order_annex[0].img.id,
			},
			fields: "id"
		})
		// 将修改订单状态，并添加物品信息
		return {
			insert_id: insert.id,
			setOrder: mutation({
				action_name: "update_order_by_pk",
				pk_columns: { id: order_pk },
				_set: { status: '已完成', authentication_details_product_appraisal_details: insert.id },
				fields: "id"
			})
		}
	} else {
		apiNumber += 1;
		return api()
	}
}

function api() {
	if (apiNumber > 3) {
		// 修改订单状态
		mdapi.mutation(
			{
				action_name: "update_order",
				where: { id: { _eq: order_pk } }, _set: { status: '鉴定失败' }
			}
		)
	} else {
		getApi = context.callThirdPartyApi(
			'm88li5jb',
			{
				'fz_body': {
					parameters: {
						upload_image: order.order_annex[0].img.url
					},
					workflow_id: '7480394363542913024',
				},
				Authorization: 'Bearer pat_l7AnU7vKyMASX1uH5INItF5CYrVUH0x9jNA6zmaU6o7jBGsNsLWq6Gw7t2fw2gDG',
				'fzContent_2dType': 'application/json'
			}
		);
		return processingInformation()
	}
}
function formatPoetry(poetryText) {
    // 去除多余的换行符和空格
    const cleanedText = poetryText.replace(/\s+/g, '').trim();
    
    // 按句分割（假设每句以标点符号结束，如逗号、句号等）
    const sentences = cleanedText.split(/[,，。！？;]/);
    
    // 过滤掉空字符串
    const validSentences = sentences.filter(sentence => sentence.trim() !== '');
    
    let formattedPoetry = '';
    
    // 根据句子数量和长度决定换行方式
    if (validSentences.length === 4) {
        // 可能是绝句，每两句换行
        for (let i = 0; i < validSentences.length; i += 2) {
            formattedPoetry += validSentences[i] + '，\n' + validSentences[i + 1] + '。\n';
        }
    } else if (validSentences.length === 8) {
        // 可能是律诗，每两句换行
        for (let i = 0; i < validSentences.length; i += 2) {
            formattedPoetry += validSentences[i] + '，\n' + validSentences[i + 1] + '。\n';
        }
    } else {
        // 其他情况，每句换行
        validSentences.forEach(sentence => {
            formattedPoetry += sentence + '。\n';
        });
    }
    
    return formattedPoetry.trim();
}