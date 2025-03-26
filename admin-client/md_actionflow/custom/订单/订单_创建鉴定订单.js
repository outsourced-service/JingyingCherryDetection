// @ts-nocheck
const { mutation, payload, query, setReturn, tokenToData } = mdapi;
const user_pk = tokenToData()?.id;
const mode = "鉴定订单";
const {
    is_ai_identify = false, //是否为AI鉴定
    type,
    num,
    price,
    describe,
    status,

} = payload;
const imgs = Array.isArray(payload.imgs) ? payload.imgs : [payload.imgs];

//1.查询商品类型，进行价格重计算
const [category] = query({ model: "category", where: { name: { _eq: type } }, fields: "id,price" });
if (!category?.id) return setReturn({ payload }, "fail:204", "商品类型不存在");
let newPrice = category?.price * num; //重计算价格
//2.创建订单
const res = mutation({
    action_name: "insert_order_one",
    object: {
        user_user: user_pk,
        category_category: category?.id,
        mode,
        type,
        num,
        describe,
        status,
        ...aiIdentify(),
        is_ai_identify,
        order_process: {
            data: [{
                user_user: user_pk,
                title: "待付款",
                content: "待提交 -> 待付款",
                order_annex: {
                    data: imgs.map(res => { return { img_id: res } })
                }
            }]
        },
        order_annex: {
            data: imgs.filter(res => res).map(res => { return { img_id: res } })
        }
    },
    fields: "id order_process{id}",
})
return {
    ...res,
    order_process_id: res.order_process[0]?.id
}


function aiIdentify() {
    // 会员免单, 免费鉴定次数
    const [user] = query({ model: "user", where: { id: { _eq: user_pk } }, fields: "id,ai_check_count,vip_exp_time" });
    if (user?.vip_exp_time && new Date(user?.vip_exp_time) > new Date()) return {
        preferential_price: newPrice,
        price: 0,
        discount_reason: "会员免单"
    }
    if (user?.ai_check_count > 0) return {
        preferential_price: newPrice,
        price: 0,
        discount_reason: "使用一次免费鉴定次数"
    }
    return {
        preferential_price: 0,
        price: newPrice,
        discount_reason: "无优惠"
    }
}