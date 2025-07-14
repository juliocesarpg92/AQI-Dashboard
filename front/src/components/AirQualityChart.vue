<template>
  <Card class="p-6">
    <div class="space-y-4">
      <!-- CHART HEADER -->
      <div class="flex items-center justify-between">
        <div>
          <!-- CHART TITLE -->
          <h3 class="text-lg font-semibold text-foreground">
            {{ selectedParameter.label }} - Temporal Trend
          </h3>
          <!-- SUBTITLE DATE RANGE -->
          <p class="text-sm text-muted-foreground">
            {{ formatDateRange(dateRange) }}
          </p>
        </div>
        <!-- REFRESH BUTTON -->
        <Button
          variant="outline"
          size="sm"
          @click="$emit('refresh')"
          :disabled="loading"
          aria-label="Refresh data"
        >
          <RotateCw
            :class="{ 'animate-spin': loading }"
            class="inline-block w-4 h-4"
          />
        </Button>
      </div>
      <!-- CHART AREA -->
      <div
        class="relative h-96 w-full"
        role="img"
        :aria-label="`Chart of ${selectedParameter.label} from ${formatDate(
          dateRange.startDate
        )} to ${formatDate(dateRange.endDate)}`"
      >
        <!-- LOADING STATE -->
        <div
          v-if="loading"
          class="absolute inset-0 flex items-center justify-center bg-background/50"
        >
          <div class="flex items-center gap-2 text-muted-foreground">
            <LoaderCircle class="w-4 h-4 border-2 animate-spin" />
            Loading data...
          </div>
        </div>

        <!-- ERROR STATE -->
        <div
          v-else-if="error"
          class="absolute inset-0 flex items-center justify-center"
        >
          <div class="text-center">
            <p class="text-destructive mb-2">{{ error }}</p>
            <Button variant="outline" size="sm" @click="$emit('refresh')">
              <RotateCw class="inline-block w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>

        <!-- CHART -->
        <v-chart
          v-else
          ref="chartRef"
          :option="chartOption"
          :loading="loading"
          class="w-full h-full"
          autoresize
        />
      </div>
      <!-- CHART FOOTER -->
      <div
        class="flex items-center justify-between text-xs text-muted-foreground"
      >
        <span>{{ dataPoints }} data points</span>
        <span>Last update: {{ lastUpdate }}</span>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { use } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { LineChart } from "echarts/charts"
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
} from "echarts/components"
import VChart from "vue-echarts"
import { format } from "date-fns"

import type {
  AirQualityParameter,
  DateRange,
  ChartDataPoint,
} from "@/types/air-quality"
import { formatDate } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoaderCircle, RotateCw } from "lucide-vue-next"

// Register ECharts components
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
])

interface Props {
  data: ChartDataPoint[]
  selectedParameter: AirQualityParameter
  dateRange: DateRange
  loading?: boolean
  error?: string | null
}

const props = defineProps<Props>()
defineEmits<{
  refresh: []
}>()

const chartRef = ref()

const dataPoints = computed(() => props.data.length)
const lastUpdate = computed(() => format(new Date(), "HH:mm:ss"))

const formatDateRange = (range: DateRange): string => {
  return `${formatDate(range.startDate)} - ${formatDate(range.endDate)}`
}

const getQualityColor = (quality: string): string => {
  const colors = {
    good: "#10B981",
    moderate: "#F59E0B",
    unhealthy: "#EF4444",
    hazardous: "#7C2D12",
  }
  return colors[quality as keyof typeof colors] || colors.good
}

const chartOption = computed(() => {
  if (!props.data.length) return {}

  const seriesData = props.data.map((point) => [
    point.timestamp.getTime(),
    point.value,
    point.quality,
  ])

  return {
    animation: true,
    animationDuration: 1000,
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const point = params[0]
        const [timestamp, value, quality] = point.data
        const date = format(new Date(timestamp), "dd/MM/yyyy HH:mm")
        const qualityLabels = {
          good: "Good",
          moderate: "Moderate",
          unhealthy: "Unhealthy",
          hazardous: "Hazardous",
        }
        const qualityText =
          qualityLabels[quality as keyof typeof qualityLabels] || "Unknown"

        return `
          <div class="p-2">
            <div class="font-medium">${date}</div>
            <div class="flex items-center gap-2">
              <span style="color: ${getQualityColor(quality)}">●</span>
              ${props.selectedParameter.label}: ${value.toFixed(2)} ${
          props.selectedParameter.unit
        }
            </div>
            <div class="text-sm text-gray-500">Status: ${qualityText}</div>
          </div>
        `
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "time",
      axisLabel: {
        formatter: (value: number) => format(new Date(value), "dd/MM"),
      },
    },
    yAxis: {
      type: "value",
      name: `${props.selectedParameter.label} (${props.selectedParameter.unit})`,
      nameLocation: "middle",
      nameGap: 50,
      axisLabel: {
        formatter: (value: number) => value.toFixed(1),
      },
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100,
      },
      {
        type: "slider",
        start: 0,
        end: 100,
        height: 30,
      },
    ],
    series: [
      {
        name: props.selectedParameter.label,
        type: "line",
        data: seriesData,
        smooth: true,
        lineStyle: {
          color: props.selectedParameter.color,
          width: 2,
        },
        itemStyle: {
          color: (params: any) => getQualityColor(params.data[2]),
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: props.selectedParameter.color + "40" },
              { offset: 1, color: props.selectedParameter.color + "10" },
            ],
          },
        },
        markLine: {
          silent: true,
          lineStyle: {
            type: "dashed",
          },
          data: [
            {
              yAxis: props.selectedParameter.thresholds.good,
              name: "Good Limit",
              label: { formatter: "Good" },
            },
            {
              yAxis: props.selectedParameter.thresholds.moderate,
              name: "Moderate Limit",
              label: { formatter: "Moderate" },
            },
            {
              yAxis: props.selectedParameter.thresholds.unhealthy,
              name: "Bad Limit",
              label: { formatter: "Bad" },
            },
          ],
        },
      },
    ],
  }
})
</script>
