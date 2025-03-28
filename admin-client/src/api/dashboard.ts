import { initUnified } from './unified';
import { mdapi } from '/@/utils/zionMdapi.js';
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
    
    // 准备昨日按小时的用户查询
    const getYesterdayHourlyUserQueries = () => {
        const queries = [];
        for (let i = 0; i < 24; i++) {
            const hour = i < 10 ? `0${i}` : `${i}`;
            const startHour = new Date(yesterday);
            startHour.setHours(i, 0, 0, 0);
            
            const endHour = new Date(yesterday);
            endHour.setHours(i, 59, 59, 999);
            
            queries.push({
                action_name: "user_aggregate",
                where: {
                    created_at: {
                        _gte: startHour.toISOString(),
                        _lte: endHour.toISOString()
                    }
                },
                fields: ["aggregate{count}"],
                response_key: `hour_${hour}`
            });
        }
        return queries;
    };
    
    // 准备近一周按天的用户查询
    const getLastWeekDailyUserQueries = () => {
        const queries = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            
            const dateStr = `${date.getMonth() + 1}_${date.getDate()}`;
            
            queries.push({
                action_name: "user_aggregate",
                where: {
                    created_at: {
                        _gte: date.toISOString(),
                        _lte: endDate.toISOString()
                    }
                },
                fields: ["aggregate{count}"],
                response_key: `day_${dateStr}`
            });
        }
        return queries;
    };
    
    // 准备近一个月按天的用户查询
    const getLastMonthDailyUserQueries = () => {
        const queries = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            
            const dateStr = `${date.getMonth() + 1}_${date.getDate()}`;
            
            queries.push({
                action_name: "user_aggregate",
                where: {
                    created_at: {
                        _gte: date.toISOString(),
                        _lte: endDate.toISOString()
                    }
                },
                fields: ["aggregate{count}"],
                response_key: `day_${dateStr}`
            });
        }
        return queries;
    };
    
    // 准备昨日按小时的订单查询
    const getYesterdayHourlyOrderQueries = () => {
        const queries = [];
        for (let i = 0; i < 24; i++) {
            const hour = i < 10 ? `0${i}` : `${i}`;
            const startHour = new Date(yesterday);
            startHour.setHours(i, 0, 0, 0);
            
            const endHour = new Date(yesterday);
            endHour.setHours(i, 59, 59, 999);
            
            queries.push({
                action_name: "order_aggregate",
                where: {
                    ...orderStatusFilter,
                    created_at: {
                        _gte: startHour.toISOString(),
                        _lte: endHour.toISOString()
                    }
                },
                fields: ["aggregate{count sum{price}}"],
                response_key: `hour_${hour}`
            });
        }
        return queries;
    };
    
    // 准备近一周按天的订单查询
    const getLastWeekDailyOrderQueries = () => {
        const queries = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            
            const dateStr = `${date.getMonth() + 1}_${date.getDate()}`;
            
            queries.push({
                action_name: "order_aggregate",
                where: {
                    ...orderStatusFilter,
                    created_at: {
                        _gte: date.toISOString(),
                        _lte: endDate.toISOString()
                    }
                },
                fields: ["aggregate{count sum{price}}"],
                response_key: `day_${dateStr}`
            });
        }
        return queries;
    };
    
    // 准备近一个月按天的订单查询
    const getLastMonthDailyOrderQueries = () => {
        const queries = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            
            const dateStr = `${date.getMonth() + 1}_${date.getDate()}`;
            
            queries.push({
                action_name: "order_aggregate",
                where: {
                    ...orderStatusFilter,
                    created_at: {
                        _gte: date.toISOString(),
                        _lte: endDate.toISOString()
                    }
                },
                fields: ["aggregate{count sum{price}}"],
                response_key: `day_${dateStr}`
            });
        }
        return queries;
    };
    
    // 处理昨日用户按小时的数据
    const processYesterdayHourlyUserData = (result) => {
        const data = [];
        for (let i = 0; i < 24; i++) {
            const hour = i < 10 ? `0${i}` : `${i}`;
            const hourData = result[`hour_${hour}`];
            data.push({
                date: `${hour}:00`,
                count: hourData?.aggregate?.count || 0
            });
        }
        return data;
    };
    
    // 处理近一周用户按天的数据
    const processLastWeekDailyUserData = (result) => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = `${date.getMonth() + 1}_${date.getDate()}`;
            const dayData = result[`day_${dateStr}`];
            data.push({
                date: `${date.getMonth() + 1}/${date.getDate()}`,
                count: dayData?.aggregate?.count || 0
            });
        }
        return data;
    };
    
    // 处理近一个月用户按天的数据
    const processLastMonthDailyUserData = (result) => {
        const data = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = `${date.getMonth() + 1}_${date.getDate()}`;
            const dayData = result[`day_${dateStr}`];
            data.push({
                date: `${date.getMonth() + 1}/${date.getDate()}`,
                count: dayData?.aggregate?.count || 0
            });
        }
        return data;
    };
    
    // 处理昨日订单按小时的数据
    const processYesterdayHourlyOrderData = (result) => {
        const data = [];
        for (let i = 0; i < 24; i++) {
            const hour = i < 10 ? `0${i}` : `${i}`;
            const hourData = result[`hour_${hour}`];
            data.push({
                date: `${hour}:00`,
                amount: hourData?.aggregate?.sum?.price || 0
            });
        }
        return data;
    };
    
    // 处理近一周订单按天的数据
    const processLastWeekDailyOrderData = (result) => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = `${date.getMonth() + 1}_${date.getDate()}`;
            const dayData = result[`day_${dateStr}`];
            data.push({
                date: `${date.getMonth() + 1}/${date.getDate()}`,
                amount: dayData?.aggregate?.sum?.price || 0
            });
        }
        return data;
    };
    
    // 处理近一个月订单按天的数据
    const processLastMonthDailyOrderData = (result) => {
        const data = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = `${date.getMonth() + 1}_${date.getDate()}`;
            const dayData = result[`day_${dateStr}`];
            data.push({
                date: `${date.getMonth() + 1}/${date.getDate()}`,
                amount: dayData?.aggregate?.sum?.price || 0
            });
        }
        return data;
    };
    
    // 获取基础统计数据和昨日详细数据
    const getBaseStats = async () => {
        // 用户统计数据
        const userResult = await mdapi.batch_query([
            {
                // 用户总数
                action_name: "user_aggregate",
                fields: ["aggregate{count}"],
                response_key: "total"
            },
            {
                // 昨日新增用户数（昨天0点到昨天23:59:59）
                action_name: "user_aggregate",
                where: {
                    created_at: {
                        _gte: yesterday.toISOString(),
                        _lte: yesterdayEnd.toISOString()
                    }
                },
                fields: ["aggregate{count}"],
                response_key: "yesterday"
            },
            {
                // 近一周新增用户数（一周前0点到今天23:59:59）
                action_name: "user_aggregate",
                where: {
                    created_at: {
                        _gte: lastWeek.toISOString(),
                        _lte: todayEnd.toISOString()
                    }
                },
                fields: ["aggregate{count}"],
                response_key: "lastWeek"
            },
            {
                // 近一个月新增用户数（一个月前0点到今天23:59:59）
                action_name: "user_aggregate",
                where: {
                    created_at: {
                        _gte: lastMonth.toISOString(),
                        _lte: todayEnd.toISOString()
                    }
                },
                fields: ["aggregate{count}"],
                response_key: "lastMonth"
            }
        ]);
        
        // 订单统计数据
        const orderResult = await mdapi.batch_query([
            {
                // 订单总数和总金额
                action_name: "order_aggregate",
                where: orderStatusFilter,
                fields: ["aggregate{count sum{price}}"],
                response_key: "total"
            },
            {
                // 昨日订单金额（昨天0点到昨天23:59:59）
                action_name: "order_aggregate",
                where: {
                    ...orderStatusFilter,
                    created_at: {
                        _gte: yesterday.toISOString(),
                        _lte: yesterdayEnd.toISOString()
                    }
                },
                fields: ["aggregate{count sum{price}}"],
                response_key: "yesterday"
            },
            {
                // 近一周订单金额（一周前0点到今天23:59:59）
                action_name: "order_aggregate",
                where: {
                    ...orderStatusFilter,
                    created_at: {
                        _gte: lastWeek.toISOString(),
                        _lte: todayEnd.toISOString()
                    }
                },
                fields: ["aggregate{count sum{price}}"],
                response_key: "lastWeek"
            },
            {
                // 近一个月订单金额（一个月前0点到今天23:59:59）
                action_name: "order_aggregate",
                where: {
                    ...orderStatusFilter,
                    created_at: {
                        _gte: lastMonth.toISOString(),
                        _lte: todayEnd.toISOString()
                    }
                },
                fields: ["aggregate{count sum{price}}"],
                response_key: "lastMonth"
            }
        ]);
        
        // 获取昨日用户按小时统计数据
        const yesterdayHourlyUserResult = await mdapi.batch_query(getYesterdayHourlyUserQueries());
        
        // 获取昨日订单按小时统计数据
        const yesterdayHourlyOrderResult = await mdapi.batch_query(getYesterdayHourlyOrderQueries());
        
        return {
            user: {
                total: userResult.total?.aggregate?.count || 0,
                yesterday: {
                    count: userResult.yesterday?.aggregate?.count || 0,
                    data: processYesterdayHourlyUserData(yesterdayHourlyUserResult)
                },
                lastWeek: {
                    count: userResult.lastWeek?.aggregate?.count || 0,
                    data: [] // 初始不加载，按需加载
                },
                lastMonth: {
                    count: userResult.lastMonth?.aggregate?.count || 0,
                    data: [] // 初始不加载，按需加载
                }
            },
            order: {
                total: {
                    count: orderResult.total?.aggregate?.count || 0,
                    amount: orderResult.total?.aggregate?.sum?.price || 0
                },
                yesterday: {
                    count: orderResult.yesterday?.aggregate?.count || 0,
                    amount: orderResult.yesterday?.aggregate?.sum?.price || 0,
                    data: processYesterdayHourlyOrderData(yesterdayHourlyOrderResult)
                },
                lastWeek: {
                    count: orderResult.lastWeek?.aggregate?.count || 0,
                    amount: orderResult.lastWeek?.aggregate?.sum?.price || 0,
                    data: [] // 初始不加载，按需加载
                },
                lastMonth: {
                    count: orderResult.lastMonth?.aggregate?.count || 0,
                    amount: orderResult.lastMonth?.aggregate?.sum?.price || 0,
                    data: [] // 初始不加载，按需加载
                }
            }
        };
    };
    
    // 获取近一周用户详细数据
    const getUserLastWeekData = async () => {
        const result = await mdapi.batch_query(getLastWeekDailyUserQueries());
        return processLastWeekDailyUserData(result);
    };
    
    // 获取近一个月用户详细数据
    const getUserLastMonthData = async () => {
        const result = await mdapi.batch_query(getLastMonthDailyUserQueries());
        return processLastMonthDailyUserData(result);
    };
    
    // 获取近一周订单详细数据
    const getOrderLastWeekData = async () => {
        const result = await mdapi.batch_query(getLastWeekDailyOrderQueries());
        return processLastWeekDailyOrderData(result);
    };
    
    // 获取近一个月订单详细数据
    const getOrderLastMonthData = async () => {
        const result = await mdapi.batch_query(getLastMonthDailyOrderQueries());
        return processLastMonthDailyOrderData(result);
    };
    
    return {
        getBaseStats,
        getUserLastWeekData,
        getUserLastMonthData,
        getOrderLastWeekData,
        getOrderLastMonthData
    };
}