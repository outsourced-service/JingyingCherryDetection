<template>
  <div class="dashboard-container">
    <div class="digital-board">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>用户数据</span>
              </div>
            </template>
            <div class="card-body">
              <div class="total-stats">
                <div class="label">用户总数</div>
                <div class="value">{{ userStats.total }}</div>
              </div>
              <el-divider />
              <el-descriptions :column="3" class="time-stats">
                <el-descriptions-item label="昨日新增">{{ userStats.yesterday }}</el-descriptions-item>
                <el-descriptions-item label="近一周新增">{{ userStats.lastWeek }}</el-descriptions-item>
                <el-descriptions-item label="近一个月新增">{{ userStats.lastMonth }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>订单数据</span>
              </div>
            </template>
            <div class="card-body">
              <div class="total-stats">
                <div class="label">订单总金额</div>
                <div class="value">{{ (orderStats.total / 100).toFixed(2) }}<span class="unit">元</span></div>
              </div>
              <el-divider />
              <el-descriptions :column="3" class="time-stats">
                <el-descriptions-item label="昨日交易">{{ (orderStats.yesterday / 100).toFixed(2) }}元</el-descriptions-item>
                <el-descriptions-item label="近一周交易">{{ (orderStats.lastWeek / 100).toFixed(2) }}元</el-descriptions-item>
                <el-descriptions-item label="近一个月交易">{{ (orderStats.lastMonth / 100).toFixed(2) }}元</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <div class="chart-board">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>用户数据统计图</span>
                <el-radio-group v-model="userChartTimeRange" size="small">
                  <el-radio-button label="yesterday">昨日</el-radio-button>
                  <el-radio-button label="lastWeek">近一周</el-radio-button>
                  <el-radio-button label="lastMonth">近一个月</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container" ref="userChartRef"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>订单金额统计图</span>
                <el-radio-group v-model="orderChartTimeRange" size="small">
                  <el-radio-button label="yesterday">昨日</el-radio-button>
                  <el-radio-button label="lastWeek">近一周</el-radio-button>
                  <el-radio-button label="lastMonth">近一个月</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container" ref="orderChartRef"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { dashboard } from '/@/api/index';
import * as echarts from 'echarts';

const dashboardFun = dashboard();
const userStats = ref({
  total: 0,
  yesterday: 0,
  lastWeek: 0,
  lastMonth: 0
});

const orderStats = ref({
  total: 0,
  yesterday: 0,
  lastWeek: 0,
  lastMonth: 0
});

// 图表时间范围选择
const userChartTimeRange = ref('yesterday');
const orderChartTimeRange = ref('yesterday');

// 图表DOM引用
const userChartRef = ref(null);
const orderChartRef = ref(null);

// 图表实例
let userChart: echarts.ECharts | null = null;
let orderChart: echarts.ECharts | null = null;

// 用户数据
const userChartData = ref({
  yesterday: [],
  lastWeek: [],
  lastMonth: []
});

// 订单数据
const orderChartData = ref({
  yesterday: [],
  lastWeek: [],
  lastMonth: []
});

// 初始化图表
const initCharts = () => {
  if (userChartRef.value) {
    userChart = echarts.init(userChartRef.value);
  }
  
  if (orderChartRef.value) {
    orderChart = echarts.init(orderChartRef.value);
  }
  
  updateUserChart();
  updateOrderChart();
  
  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', () => {
    userChart?.resize();
    orderChart?.resize();
  });
};

// 更新用户图表
const updateUserChart = () => {
  if (!userChart) return;
  
  const data = userChartData.value[userChartTimeRange.value];
  
  const option = {
    title: {
      text: '新增用户'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增用户',
        type: 'bar',
        data: data.map(item => item.count),
        itemStyle: {
          color: '#5470c6'
        }
      }
    ]
  };
  
  userChart.setOption(option);
};

// 更新订单图表
const updateOrderChart = () => {
  if (!orderChart) return;
  
  const data = orderChartData.value[orderChartTimeRange.value];
  
  const option = {
    title: {
      text: '订单金额'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        // 将金额从分转换为元
        const amountInYuan = (params[0].value / 100).toFixed(2);
        return `${params[0].name}<br/>${params[0].seriesName}: ${amountInYuan}元`;
      }
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date)
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: function(value) {
          // 将坐标轴标签从分转换为元
          return (value / 100).toFixed(2);
        }
      }
    },
    series: [
      {
        name: '订单金额',
        type: 'bar',
        data: data.map(item => item.amount),
        itemStyle: {
          color: '#91cc75'
        }
      }
    ]
  };
  
  orderChart.setOption(option);
};

// 处理用户数据，按时间段统计
const processUserData = (users) => {
  if (!users || !Array.isArray(users)) return;
  
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
  
  // 昨日数据（按小时）
  const yesterdayData = [];
  for (let i = 0; i < 24; i++) {
    const hour = i < 10 ? `0${i}` : `${i}`;
    const startHour = new Date(yesterday);
    startHour.setHours(i, 0, 0, 0);
    
    const endHour = new Date(yesterday);
    endHour.setHours(i, 59, 59, 999);
    
    const count = users.filter(user => {
      const createdAt = new Date(user.created_at);
      return createdAt >= startHour && createdAt <= endHour;
    }).length;
    
    yesterdayData.push({
      date: `${hour}:00`,
      count: count
    });
  }
  
  // 近一周数据（按天，包括今天）
  const lastWeekData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const count = users.filter(user => {
      const createdAt = new Date(user.created_at);
      return createdAt >= date && createdAt <= endDate;
    }).length;
    
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    lastWeekData.push({
      date: dateStr,
      count: count
    });
  }
  
  // 近一个月数据（按天，包括今天）
  const lastMonthData = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const count = users.filter(user => {
      const createdAt = new Date(user.created_at);
      return createdAt >= date && createdAt <= endDate;
    }).length;
    
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    lastMonthData.push({
      date: dateStr,
      count: count
    });
  }
  
  userChartData.value = {
    yesterday: yesterdayData,
    lastWeek: lastWeekData,
    lastMonth: lastMonthData
  };
};

// 处理订单数据，按时间段统计
const processOrderData = (orders) => {
  if (!orders || !Array.isArray(orders)) return;
  
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
  
  // 昨日数据（按小时）
  const yesterdayData = [];
  for (let i = 0; i < 24; i++) {
    const hour = i < 10 ? `0${i}` : `${i}`;
    const startHour = new Date(yesterday);
    startHour.setHours(i, 0, 0, 0);
    
    const endHour = new Date(yesterday);
    endHour.setHours(i, 59, 59, 999);
    
    const hourOrders = orders.filter(order => {
      const createdAt = new Date(order.created_at);
      return createdAt >= startHour && createdAt <= endHour;
    });
    
    const amount = hourOrders.reduce((sum, order) => sum + (order.price || 0), 0);
    
    yesterdayData.push({
      date: `${hour}:00`,
      amount: amount
    });
  }
  
  // 近一周数据（按天，包括今天）
  const lastWeekData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const dayOrders = orders.filter(order => {
      const createdAt = new Date(order.created_at);
      return createdAt >= date && createdAt <= endDate;
    });
    
    const amount = dayOrders.reduce((sum, order) => sum + (order.price || 0), 0);
    
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    lastWeekData.push({
      date: dateStr,
      amount: amount
    });
  }
  
  // 近一个月数据（按天，包括今天）
  const lastMonthData = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const dayOrders = orders.filter(order => {
      const createdAt = new Date(order.created_at);
      return createdAt >= date && createdAt <= endDate;
    });
    
    const amount = dayOrders.reduce((sum, order) => sum + (order.price || 0), 0);
    
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    lastMonthData.push({
      date: dateStr,
      amount: amount
    });
  }
  
  orderChartData.value = {
    yesterday: yesterdayData,
    lastWeek: lastWeekData,
    lastMonth: lastMonthData
  };
};

// 监听时间范围变化
watch(userChartTimeRange, () => {
  updateUserChart();
});

watch(orderChartTimeRange, () => {
  updateOrderChart();
});

onMounted(async () => {
  try {
    // 获取用户统计数据
    const userTotal = await dashboardFun.userTotal;
    const userYesterday = await dashboardFun.userYesterday;
    const userLastWeek = await dashboardFun.userLastWeek;
    const userLastMonth = await dashboardFun.userLastMonth;
    
    userStats.value = {
      total: userTotal?.aggregate?.count || 0,
      yesterday: userYesterday?.aggregate?.count || 0,
      lastWeek: userLastWeek?.aggregate?.count || 0,
      lastMonth: userLastMonth?.aggregate?.count || 0
    };
    
    // 获取订单统计数据（注意：这里获取的金额单位是分）
    const orderAmount = await dashboardFun.orderAmount;
    const orderAmountYesterday = await dashboardFun.orderAmountYesterday;
    const orderAmountLastWeek = await dashboardFun.orderAmountLastWeek;
    const orderAmountLastMonth = await dashboardFun.orderAmountLastMonth;
    
    orderStats.value = {
      total: orderAmount?.aggregate?.sum?.price || 0,
      yesterday: orderAmountYesterday?.aggregate?.sum?.price || 0,
      lastWeek: orderAmountLastWeek?.aggregate?.sum?.price || 0,
      lastMonth: orderAmountLastMonth?.aggregate?.sum?.price || 0
    };
    
    console.log('User stats:', userStats.value);
    console.log('Order stats:', orderStats.value);
    
    // 获取用户和订单列表数据
    const userList = await dashboardFun.userList;
    const orderList = await dashboardFun.orderList;
    
    console.log('User list:', userList);
    console.log('Order list:', orderList);
    
    // 处理数据生成图表数据
    processUserData(userList);
    processOrderData(orderList);
    
    // 初始化图表
    initCharts();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}
.digital-board {
  margin-bottom: 30px;
}
.chart-board {
  margin-bottom: 30px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-body {
  padding: 20px 0;
}
.chart-container {
  height: 300px;
  width: 100%;
}
.el-divider {
  margin: 16px 0;
}
.total-stats {
  text-align: center;
  padding: 10px 0;
}
.total-stats .label {
  font-size: 16px;
  color: #606266;
  margin-bottom: 8px;
}
.total-stats .value {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
}
.total-stats .unit {
  font-size: 20px;
  margin-left: 4px;
}
.time-stats {
  margin-top: 10px;
}
.time-stats :deep(.el-descriptions__label) {
  font-weight: normal;
  color: #606266;
}
.time-stats :deep(.el-descriptions__content) {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}
</style>