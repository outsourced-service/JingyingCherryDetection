import { initUnified } from './unified';
import { mdapi } from '/@/utils/zionMdapi.js';

/* 用户管理 */
export function user() {
    return {
        ...initUnified("user", [
            'id', 'created_at', 'user_id', 'username', 'mobile', 'nickname', 'vip_exp_time', 'avatar{id url}', 'name', 'sex', 'birthday', 'capital', 'profile', 'attach_data', 'ai_check_count', 'invite_count', 'newbie_discount_count', 'vip_label', {
                action_name: "user_role",
                fields: "id user_user role_role"
            }, {
                action_name: "user_invitechidren_aggregate",
                fields: "aggregate{count}"
            }, {
                // AI鉴定订单
                response_key: "order_ai_identify",
                action_name: "order_aggregate",
                inputs: {
                    where: {
                        "mode": { "_eq": "鉴定订单" },
                        "is_ai_identify": { "_eq": true }
                    }
                },
                fields: "aggregate{count}"
            }, {
                // 新人特惠订单
                response_key: "order_newbie_discount",
                action_name: "order_aggregate",
                inputs: {
                    "where": { "mode": { "_eq": "新人特惠订单" } }
                },
                fields: "aggregate{count}"
            }, {
                // 会员开通订单
                response_key: "order_vip_open",
                action_name: "order_aggregate",
                inputs: {
                    "where": { "mode": { "_eq": "会员开通订单" } }
                },
                fields: "aggregate{count}"
            }]),
        bindRole: async (data: any) => await mdapi.api('/用户/', '用户_绑定角色', data)
    }
}

/* 用户角色 */
export function user_role() {
    return {
        ...initUnified("user_role", ['id user_user role_role ', {
            action_name: "user",
            fields: "id nickname"
        }])
    }
}

/* 订单管理 */
export function order() {
    return {
        ...initUnified("order", ['id created_at mode type num price describe status attach_data preferential_price discount_reason is_ai_identify', {
            action_name: "order_annex",
            fields: "id dir img{id url}"
        }, {
            action_name: "product_appraisal_details",
            fields: "id"
        }, {
            action_name: "user",
            fields: "nickname user_id mobile vip_exp_time vip_label"
        }]),
    }
}

/* 订单流程 */
export function order_process() {
    return {
        ...initUnified("order_process", ['id created_at title content express_name express_orderid', {
            action_name: 'order',
            fields: "id"
        }, {
                action_name: 'user',
                fields: "id nickname mobile"
            }, {
                action_name: 'manager',
                fields: "id nickname username phone"
            }, {
                action_name: 'order_annex',
                fields: "id img{id url}"
            }]),
        addProcess: async (data: any) => await mdapi.api('/订单/', '订单_物流信息提交', data),
        refund: async (data: any) => await mdapi.api('/订单/', '订单_订单退款确认', data)
    }
}


/* 日志记录 */
export function user_logs() {
    return initUnified("user_logs", ['id created_at type title content', {
        response_key: "user_invitechidren",
        action_name: "user",
        fields: "id user_id nickname username avatar{id url}"
    }, {
            response_key: "user",
            action_name: "user_invitechidren",
            fields: "id user_id nickname username avatar{id url}"
        }])
}

/* 提现记录 */
export function user_assets() {
    return {
        ...initUnified("user_assets_extract", ['id created_at account_name account_model value remarks status attach_data', {
            action_name: "user",
            fields: "id nickname mobile avatar{id url}"
        }, {
                action_name: "user_assets_extract_annex",
                fields: "id img{id url}"
            }]),
        updatePass: async (data: any) => await mdapi.api('/用户/', '用户_通过审核', data)
    }
}

/* 鉴定物品 */
export function product() {
    return {
        ...initUnified("product_appraisal_details", ['id client avatar{id url} price nickname cover{id url} product_appraisal_details_annex{id img{id url} file{id url name}} reason condition is_certificate min_estimate max_estimate title appraisal_time result describe', {
            action_name: "order",
            fields: "id"
        }, {
                action_name: "category",
                fields: "id name"
            }]),
        updateProduct: async (data: any) => await mdapi.api('/物品/', '物品_修改鉴定物品信息', data)
    }
}

/* 鉴定物品类型 */
export function category() {
    return {
        ...initUnified("category", ['id name price idx']),
    }
}

/* 词典类型 */
export function diction() {
    return initUnified("diction", ['id name describe', {
        action_name: "diction_logs_aggregate",
        fields: ["aggregate{count}"]
    }])
}
/* 词典数据 */
export function diction_logs() {
    return initUnified("diction_logs", ['id idx value describe diction_diction'])
}

/* 资源库 */
export function resource() {
    return initUnified("resource", ['updated_at id name dir title resource_type mode is_variable idx path attach_data text img{id url} video{id url} file{id name url} is_not_deleted'])
}

/* 数据看板 */
export function dashboard() {
    const now = new Date();
    
    // 设置今天的结束时间（23:59:59.999）
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    
    // 设置昨天的开始时间（0:00:00）
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    // 设置昨天的结束时间（23:59:59.999）
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);
    
    // 设置一周前的开始时间（0:00:00）
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 6); // 当前日期算一天，所以减6
    lastWeek.setHours(0, 0, 0, 0);
    
    // 设置一个月前的开始时间（0:00:00）
    const lastMonth = new Date(now);
    lastMonth.setDate(lastMonth.getDate() - 29); // 当前日期算一天，所以减29
    lastMonth.setHours(0, 0, 0, 0);
    
    // 只查询状态为"已完成"的订单
    const orderStatusFilter = {
        status: { _eq: "已完成" }
    };
    
    return {
        // 总用户数
        userTotal: mdapi.query({
            action_name: "user_aggregate",
            fields: ["aggregate{count}"]
        }),
        
        // 昨日新增用户数（精确到昨天的时间范围）
        userYesterday: mdapi.query({
            action_name: "user_aggregate",
            where: {
                created_at: {
                    _gte: yesterday.toISOString(),
                    _lte: yesterdayEnd.toISOString()
                }
            },
            fields: ["aggregate{count}"]
        }),
        
        // 近一周新增用户数（从一周前的开始时间到今天的结束时间）
        userLastWeek: mdapi.query({
            action_name: "user_aggregate",
            where: {
                created_at: {
                    _gte: lastWeek.toISOString(),
                    _lte: todayEnd.toISOString()
                }
            },
            fields: ["aggregate{count}"]
        }),
        
        // 近一个月新增用户数（从一个月前的开始时间到今天的结束时间）
        userLastMonth: mdapi.query({
            action_name: "user_aggregate",
            where: {
                created_at: {
                    _gte: lastMonth.toISOString(),
                    _lte: todayEnd.toISOString()
                }
            },
            fields: ["aggregate{count}"]
        }),
        
        // 订单总数（已完成）
        orderTotal: mdapi.query({
            action_name: "order_aggregate",
            where: orderStatusFilter,
            fields: ["aggregate{count}"]
        }),
        
        // 订单总金额（已完成）
        orderAmount: mdapi.query({
            action_name: "order_aggregate",
            where: orderStatusFilter,
            fields: ["aggregate{sum{price}}"]
        }),
        
        // 昨日订单金额（已完成，精确到昨天的时间范围）
        orderAmountYesterday: mdapi.query({
            action_name: "order_aggregate",
            where: {
                ...orderStatusFilter,
                created_at: {
                    _gte: yesterday.toISOString(),
                    _lte: yesterdayEnd.toISOString()
                }
            },
            fields: ["aggregate{sum{price}}"]
        }),
        
        // 近一周订单金额（已完成，从一周前的开始时间到今天的结束时间）
        orderAmountLastWeek: mdapi.query({
            action_name: "order_aggregate",
            where: {
                ...orderStatusFilter,
                created_at: {
                    _gte: lastWeek.toISOString(),
                    _lte: todayEnd.toISOString()
                }
            },
            fields: ["aggregate{sum{price}}"]
        }),
        
        // 近一个月订单金额（已完成，从一个月前的开始时间到今天的结束时间）
        orderAmountLastMonth: mdapi.query({
            action_name: "order_aggregate",
            where: {
                ...orderStatusFilter,
                created_at: {
                    _gte: lastMonth.toISOString(),
                    _lte: todayEnd.toISOString()
                }
            },
            fields: ["aggregate{sum{price}}"]
        }),
        
        // 获取所有用户数据（用于图表）
        userList: mdapi.query({
            action_name: "user",
            fields: ["id", "created_at"]
        }),
        
        // 获取所有订单数据（用于图表）
        orderList: mdapi.query({
            action_name: "order",
            where: orderStatusFilter,
            fields: ["id", "created_at", "price"]
        })
    }
}