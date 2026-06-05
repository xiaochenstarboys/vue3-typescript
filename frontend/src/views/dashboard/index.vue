<template>
  <div class="dashboard" v-loading="loading">
    <!-- Stats Cards -->
    <el-row :gutter="20" class="stats-row">
      <el-col v-for="card in statCards" :key="card.key" :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-inner">
            <div class="stat-info">
              <p class="stat-label">{{ card.label }}</p>
              <p class="stat-value">{{ card.value }}</p>
              <p class="stat-sub" :class="card.trend > 0 ? 'up' : 'down'">
                <el-icon><Top v-if="card.trend > 0" /><Bottom v-else /></el-icon>
                较上月 {{ Math.abs(card.trend) }}%
              </p>
            </div>
            <div class="stat-icon" :style="{ background: card.color + '18' }">
              <el-icon :size="28" :style="{ color: card.color }">
                <component :is="card.icon" />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <span class="card-title">近 6 个月员工变动趋势</span>
          </template>
          <div ref="lineChartRef" class="chart" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <span class="card-title">部门人员分布</span>
          </template>
          <div ref="pieChartRef" class="chart" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { dashboardApi, type DashboardStats } from '@/api/dashboard'

const loading = ref(true)
const stats = reactive<DashboardStats>({
  totalEmployees: 0,
  departmentCount: 0,
  monthlyHires: 0,
  inactiveCount: 0,
  turnoverRate: 0,
})

const lineChartRef = ref<HTMLDivElement>()
const pieChartRef = ref<HTMLDivElement>()
let lineChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

const statCards = ref([
  { key: 'total', label: '员工总数', value: 0, trend: 5.2, icon: 'User', color: '#4F6AF5' },
  { key: 'dept', label: '部门数量', value: 0, trend: 0, icon: 'OfficeBuilding', color: '#18A058' },
  { key: 'entry', label: '本月入职', value: 0, trend: 50, icon: 'UserFilled', color: '#F0A020' },
  { key: 'resign', label: '离职率', value: '0%', trend: -2, icon: 'TrendCharts', color: '#D03050' },
])

const months = ['1月', '2月', '3月', '4月', '5月', '6月']

function initLineChart() {
  if (!lineChartRef.value) return
  lineChart = echarts.init(lineChartRef.value)
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['入职', '离职'], bottom: 0 },
    grid: { left: 16, right: 16, bottom: 40, top: 16, containLabel: true },
    xAxis: { type: 'category', data: months, axisLine: { lineStyle: { color: '#E2E8F0' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#F5F7FA' } } },
    series: [
      {
        name: '入职', type: 'line', smooth: true,
        data: [3, 5, 2, 6, 4, 3],
        itemStyle: { color: '#4F6AF5' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(79,106,245,0.2)' },
          { offset: 1, color: 'rgba(79,106,245,0)' },
        ]) },
      },
      {
        name: '离职', type: 'line', smooth: true,
        data: [1, 2, 1, 3, 1, 1],
        itemStyle: { color: '#D03050' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(208,48,80,0.1)' },
          { offset: 1, color: 'rgba(208,48,80,0)' },
        ]) },
      },
    ],
  })
}

function initPieChart() {
  if (!pieChartRef.value) return
  pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
    legend: { orient: 'vertical', left: 'left', textStyle: { fontSize: 12 } },
    series: [{
      type: 'pie', radius: ['40%', '70%'],
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      data: [
        { value: 5, name: '技术部', itemStyle: { color: '#4F6AF5' } },
        { value: 3, name: '产品部', itemStyle: { color: '#18A058' } },
        { value: 3, name: '市场部', itemStyle: { color: '#F0A020' } },
        { value: 3, name: '人事部', itemStyle: { color: '#D03050' } },
        { value: 1, name: '总裁办', itemStyle: { color: '#909399' } },
      ],
    }],
  })
}

function handleResize() {
  lineChart?.resize()
  pieChart?.resize()
}

async function fetchStats() {
  try {
    const data = await dashboardApi.getStats()
    stats.totalEmployees = data.totalEmployees
    stats.departmentCount = data.departmentCount
    stats.monthlyHires = data.monthlyHires
    stats.inactiveCount = data.inactiveCount
    stats.turnoverRate = data.turnoverRate

    statCards.value[0].value = data.totalEmployees
    statCards.value[1].value = data.departmentCount
    statCards.value[2].value = data.monthlyHires
    statCards.value[3].value = data.turnoverRate + '%'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
  initLineChart()
  initPieChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  lineChart?.dispose()
  pieChart?.dispose()
})
</script>

<style lang="less" scoped>
.dashboard {
  .stats-row { margin-bottom: @space-lg; }

  .stat-card {
    .stat-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-label {
      font-size: @font-size-sm;
      color: @text-secondary;
      margin-bottom: @space-xs;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: @text-primary;
      line-height: 1.2;
      margin-bottom: @space-xs;
    }

    .stat-sub {
      font-size: @font-size-xs;
      display: flex;
      align-items: center;
      gap: 2px;
      &.up   { color: @success; }
      &.down { color: @danger; }
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: @border-radius-lg;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .chart-card {
    .card-title {
      font-size: @font-size-base;
      font-weight: 600;
      color: @text-primary;
    }

    .chart {
      height: 280px;
    }
  }
}
</style>
