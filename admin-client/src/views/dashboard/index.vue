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
import { dashboard } from '/@/api/dashboard';
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

// 数据加载状态
const userDataLoaded = ref({
  yesterday: false,
  lastWeek: false,
  lastMonth: false
});

const orderDataLoaded = ref({
  yesterday: false,
  lastWeek: false,
  lastMonth: false
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
const updateUserChart = async () => {
  if (!userChart) return;
  
  // 如果选择的时间范围数据还未加载，则加载数据
  if (!userDataLoaded.value[userChartTimeRange.value]) {
    try {
      if (userChartTimeRange.value === 'lastWeek') {
        userChartData.value.lastWeek = await dashboardFun.getUserLastWeekData();
      } else if (userChartTimeRange.value === 'lastMonth') {
        userChartData.value.lastMonth = await dashboardFun.getUserLastMonthData();
      }
      userDataLoaded.value[userChartTimeRange.value] = true;
    } catch (error) {
      console.error('Error loading user data:', error);
      return;
    }
  }
  
  const data = userChartData.value[userChartTimeRange.value];
  
  const option = {
    title: {
      text: '用户增长趋势'
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
const updateOrderChart = async () => {
  if (!orderChart) return;
  
  // 如果选择的时间范围数据还未加载，则加载数据
  if (!orderDataLoaded.value[orderChartTimeRange.value]) {
    try {
      if (orderChartTimeRange.value === 'lastWeek') {
        orderChartData.value.lastWeek = await dashboardFun.getOrderLastWeekData();
      } else if (orderChartTimeRange.value === 'lastMonth') {
        orderChartData.value.lastMonth = await dashboardFun.getOrderLastMonthData();
      }
      orderDataLoaded.value[orderChartTimeRange.value] = true;
    } catch (error) {
      console.error('Error loading order data:', error);
      return;
    }
  }
  
  const data = orderChartData.value[orderChartTimeRange.value];
  
  const option = {
    title: {
      text: '订单金额趋势'
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

// 监听时间范围变化
watch(userChartTimeRange, () => {
  updateUserChart();
});

watch(orderChartTimeRange, () => {
  updateOrderChart();
});

onMounted(async () => {
  try {
    // 获取基础统计数据和昨日详细数据
    const baseStats = await dashboardFun.getBaseStats();
    
    console.log('Base stats:', baseStats);
    
    // 设置数字看板数据
    userStats.value = {
      total: baseStats.user.total,
      yesterday: baseStats.user.yesterday.count,
      lastWeek: baseStats.user.lastWeek.count,
      lastMonth: baseStats.user.lastMonth.count
    };
    
    orderStats.value = {
      total: baseStats.order.total.amount,
      yesterday: baseStats.order.yesterday.amount,
      lastWeek: baseStats.order.lastWeek.amount,
      lastMonth: baseStats.order.lastMonth.amount
    };
    
    // 设置昨日图表数据
    userChartData.value.yesterday = baseStats.user.yesterday.data;
    orderChartData.value.yesterday = baseStats.order.yesterday.data;
    
    // 标记昨日数据已加载
    userDataLoaded.value.yesterday = true;
    orderDataLoaded.value.yesterday = true;
    
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