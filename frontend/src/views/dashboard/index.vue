<template>
  <div class="dashboard" v-loading="loading">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div
        v-for="(card, i) in statCards"
        :key="card.key"
        class="stat-card"
        :style="{ animationDelay: `${i * 0.06}s` }"
      >
        <div class="stat-icon" :style="{ background: card.bg, color: card.color }">
          <el-icon :size="22"><component :is="card.icon" /></el-icon>
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ card.display }}</span>
          <span class="stat-label">{{ card.label }}</span>
        </div>
        <div class="stat-trend" :class="card.trend >= 0 ? 'up' : 'down'">
          <el-icon :size="14"><component :is="card.trend >= 0 ? 'Top' : 'Bottom'" /></el-icon>
          <span>{{ Math.abs(card.trend) }}%</span>
        </div>
      </div>
    </div>

    <!-- 图表 -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-header">
          <div>
            <span class="chart-title">营收趋势</span>
            <span class="chart-sub">近 6 个月入账 / 已完成营收</span>
          </div>
          <span class="chart-period">2026</span>
        </div>
        <div ref="lineChartRef" class="chart-body" />
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <div>
            <span class="chart-title">房型客房分布</span>
            <span class="chart-sub">各房型客房数量占比</span>
          </div>
        </div>
        <div ref="pieChartRef" class="chart-body" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { dashboardApi, type DashboardStats } from '@/api/dashboard'
import { useTheme } from '@/composables/useTheme'

const loading = ref(true)
const stats = reactive<DashboardStats>({
  totalRooms: 0,
  occupiedRooms: 0,
  occupancyRate: 0,
  todayCheckIns: 0,
  todayRevenue: 0,
  monthlyRevenue: [],
  roomTypeDistribution: [],
})

const lineChartRef = ref<HTMLDivElement>()
const pieChartRef = ref<HTMLDivElement>()
let lineChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

const { isDark } = useTheme()

const statCards = ref([
  {
    key: 'rate',
    label: '今日入住率',
    display: '0%',
    trend: 5.2,
    icon: 'PieChart',
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.1)',
  },
  {
    key: 'occupied',
    label: '在住客房',
    display: '0',
    trend: 0,
    icon: 'House',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.1)',
  },
  {
    key: 'today',
    label: '今日入住',
    display: '0',
    trend: 50,
    icon: 'UserFilled',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
  },
  {
    key: 'revenue',
    label: '今日营收',
    display: '¥0',
    trend: -2,
    icon: 'Wallet',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
  },
])

function theme() {
  return isDark.value
    ? {
        bg: '#1A1D27', border: '#373B50', text: '#F3F4F6', sub: '#9CA3AF',
        grid: '#232738', axis: '#373B50', pieBorder: '#1A1D27',
        income: '#818CF8', completed: '#34D399',
        incomeArea: ['rgba(99,102,241,0.2)', 'rgba(99,102,241,0)'],
        pie: ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'],
      }
    : {
        bg: '#FCFCFA', border: '#E5E3E0', text: '#1C1B1F', sub: '#5F5C63',
        grid: '#EEEDE9', axis: '#E5E3E0', pieBorder: '#FCFCFA',
        income: '#4F46E5', completed: '#059669',
        incomeArea: ['rgba(79,70,229,0.12)', 'rgba(79,70,229,0)'],
        pie: ['#4F46E5', '#7C3AED', '#059669', '#D97706', '#DB2777'],
      }
}

function buildCharts() {
  const t = theme()

  // 折线：6 个月营收
  if (lineChartRef.value) {
    lineChart?.dispose()
    lineChart = echarts.init(lineChartRef.value)
    const months = stats.monthlyRevenue.map((m) => m.month.slice(5)) // 取 MM
    const incomes = stats.monthlyRevenue.map((m) => m.income)
    const completed = stats.monthlyRevenue.map((m) => m.completed)
    lineChart.setOption({
      animationDuration: 1200,
      backgroundColor: t.bg,
      tooltip: {
        trigger: 'axis', backgroundColor: t.bg, borderColor: t.border,
        textStyle: { color: t.text, fontSize: 13 },
        axisPointer: { lineStyle: { color: t.grid } },
      },
      legend: { data: ['入账', '已完成'], bottom: 0, textStyle: { color: t.sub, fontSize: 12 } },
      grid: { left: 8, right: 12, bottom: 36, top: 8, containLabel: true },
      xAxis: { type: 'category', data: months, axisLine: { lineStyle: { color: t.axis } }, axisLabel: { color: t.sub, fontSize: 11 } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: t.grid } }, axisLabel: { color: t.sub, fontSize: 11 } },
      series: [
        {
          name: '入账', type: 'line', smooth: true, data: incomes,
          itemStyle: { color: t.income }, lineStyle: { width: 3 },
          symbol: 'circle', symbolSize: 6,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: t.incomeArea[0] },
              { offset: 1, color: t.incomeArea[1] },
            ]),
          },
        },
        {
          name: '已完成', type: 'line', smooth: true, data: completed,
          itemStyle: { color: t.completed }, lineStyle: { width: 2 },
          symbol: 'circle', symbolSize: 4,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16,185,129,0.1)' },
              { offset: 1, color: 'rgba(16,185,129,0)' },
            ]),
          },
        },
      ],
    })
  }

  // 饼图：房型占比
  if (pieChartRef.value) {
    pieChart?.dispose()
    pieChart = echarts.init(pieChartRef.value)
    const data = stats.roomTypeDistribution.map((d, i) => ({
      value: d.value,
      name: d.name,
      itemStyle: { color: t.pie[i % t.pie.length] },
    }))
    pieChart.setOption({
      animationDuration: 1000,
      backgroundColor: t.bg,
      tooltip: { trigger: 'item', formatter: '{b}: {c}间 ({d}%)', backgroundColor: t.bg, borderColor: t.border, textStyle: { color: t.text } },
      legend: { bottom: 0, textStyle: { fontSize: 12, color: t.sub } },
      series: [{
        type: 'pie', radius: ['48%', '76%'], center: ['50%', '44%'],
        itemStyle: { borderRadius: 8, borderColor: t.pieBorder, borderWidth: 3 },
        label: { show: false },
        emphasis: { label: { show: true, fontWeight: 'bold', fontSize: 14 } },
        data,
      }],
    })
  }
}

function handleResize() {
  lineChart?.resize()
  pieChart?.resize()
}

async function fetchStats() {
  try {
    const data = await dashboardApi.getStats()
    Object.assign(stats, data)
    statCards.value[0].display = data.occupancyRate + '%'
    statCards.value[1].display = String(data.occupiedRooms)
    statCards.value[2].display = String(data.todayCheckIns)
    statCards.value[3].display = '¥' + data.todayRevenue.toLocaleString()
    nextTick(buildCharts)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
  window.addEventListener('resize', handleResize)
})

watch(isDark, () => nextTick(buildCharts))

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  lineChart?.dispose()
  pieChart?.dispose()
})
</script>

<style lang="less" scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: @space-lg;
}

// 统计卡片
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: @space-md;

  @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px)  { grid-template-columns: 1fr; }
}

.stat-card {
  background: @bg-card;
  border: 1px solid @border-color;
  border-radius: @border-radius-xl;
  padding: @space-md @space-xl;
  display: flex;
  align-items: center;
  gap: @space-md;
  transition: all 0.2s ease;
  animation: card-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;

  &:hover {
    transform: translateY(-2px);
    box-shadow: @shadow;
    border-color: rgba(var(--primary-rgb), 0.15);
  }
}

@keyframes card-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: @font-weight-extrabold;
  color: @text-primary;
  line-height: 1.1;
}

.stat-label {
  font-size: @font-size-sm;
  color: @text-secondary;
  font-weight: @font-weight-medium;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: @font-size-xs;
  font-weight: @font-weight-semibold;
  padding: 4px 10px;
  border-radius: 8px;
  flex-shrink: 0;

  &.up { color: @success; background: rgba(var(--success-rgb), 0.08); }
  &.down { color: @danger; background: rgba(var(--danger-rgb), 0.08); }
}

// 图表
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: @space-lg;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
}

.chart-card {
  background: @bg-card;
  border: 1px solid @border-color;
  border-radius: @border-radius-xl;
  padding: @space-lg;
  transition: all 0.2s ease;
  &:hover { box-shadow: @shadow; }
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: @space-sm;
}

.chart-title {
  display: block;
  font-size: @font-size-base;
  font-weight: @font-weight-semibold;
  color: @text-primary;
  margin-bottom: 2px;
}

.chart-sub {
  font-size: @font-size-xs;
  color: @text-secondary;
}

.chart-period {
  font-size: @font-size-xs;
  font-weight: @font-weight-medium;
  color: @text-placeholder;
  padding: 2px 10px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  border: 1px solid @border-color;
}

.chart-body { height: 320px; }
</style>
