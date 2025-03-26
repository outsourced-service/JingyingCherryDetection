const {
    batch_mutation,
    payload,
    query,
    setReturn,
    tokenToData
} = mdapi;
const new_time = new Date().getTime(); //获取当前时间戳
const {
    id: user_pk,
    model
} = tokenToData();
const {
    order_py, //订单ID
    title, //订单状态
    express_name, //物流名称
    express_orderid, //物流单号
    imgs, //相关图片合集
} = payload;
const orderStatus = getStatus(title);

//1.查询订单
const [order] = query({
    model: "order",
    limit: 1,
    where: {
        id: {
            _eq: order_py
        }
    },
    fields: ["id,status"]
})
if (!order?.id) return setReturn({
    payload
}, "fail:204", "订单不存在");
const [order_process] = query({
    model: "order_process",
    limit: 1,
    where: {
        order_order: { _eq: order_py },
        title: { _eq: orderStatus }
    },
    fields: "id title"
})
if (order_process?.id > 0) return setReturn({
    payload
}, "fail:204", "流程已存在");

//2.修改订单状态，并添加流程信息
return batch_mutation([{
    action_name: "update_order",
    where: {
        id: {
            _eq: order_py
        }
    },
    _set: {
        status: orderStatus
    }
}, {
    action_name: "insert_order_process_one",
    object: {
        ...(model === "user" ? {
            user_user: user_pk
        } : {
            manager_manager: user_pk
        }),
        order_order: order_py,
        title: orderStatus,
        express_name,
        express_orderid,
        content: `${order.status} -> ${orderStatus}`,
        order_annex: {
            data: imgs.map(res => {
                return {
                    img_id: res
                }
            })
        }
    },
    fields: "id",
}])

function getStatus(title) {
    if (title == "待付款") return "待用户发出";
    if (title == "待用户发出") return "待客户部接收";
    if (title == "待客户部接收") return "待客户部发出鉴定";
    if (title == "待客户部发出鉴定") return "待实验室接收";
    if (title == "待实验室接收") return "待实验室发出";
    if (title == "待实验室发出") return "待客户部签收";
    if (title == "待客户部签收") return "待客户部发出返还";
    if (title == "待客户部发出返还") return "待用户签收";
    if (title == "待用户签收") return "已完成";
    return title;
}