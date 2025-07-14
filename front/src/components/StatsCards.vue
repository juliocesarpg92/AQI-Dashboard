<template>
  <!-- GRID -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- CARD -->
    <Card v-for="stat in stats" :key="stat.title" class="p-4">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <!-- TITLE -->
          <p class="text-sm font-medium text-muted-foreground">
            {{ stat.title }}
          </p>
          <!-- ICON -->
          <!-- <span :class="cn('w-4 h-4 inline-block', stat.iconColor)"> -->
          <component :is="stat.icon" :color="stat.iconColor" />
          <!-- </span> -->
        </div>

        <div class="space-y-1">
          <!-- VALUE -->
          <p class="text-2xl font-bold text-foreground">
            {{ stat.value }}
          </p>
          <div class="flex items-center gap-2">
            <!-- QUALITY INDICATOR -->
            <QualityIndicator
              v-if="stat.quality"
              :quality="stat.quality"
              size="sm"
            />
            <!-- TREND INDICATOR -->
            <div
              v-if="stat.trend"
              :class="
                cn(
                  'flex items-center gap-1 text-xs',
                  stat.trend === 'up'
                    ? 'text-red-600'
                    : stat.trend === 'down'
                    ? 'text-green-600'
                    : 'text-gray-600'
                )
              "
            >
              <span class="w-3 h-3 inline-block">
                {{ getTrendIcon(stat.trend) }}
              </span>
              <span>{{ getTrendText(stat.trend) }}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { Activity, BarChart3, TrendingDown, TrendingUp } from "lucide-vue-next"

import type { ChartDataPoint, AirQualityParameter } from "@/types/air-quality"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import QualityIndicator from "@/components/QualityIndicator.vue"

interface Props {
  data: ChartDataPoint[]
  parameters: AirQualityParameter[]
}

const props = defineProps<Props>()

const getQualityLevel = (
  value: number,
  parameter: AirQualityParameter
): "good" | "moderate" | "unhealthy" | "hazardous" | undefined => {
  if (value <= parameter.thresholds.good) return "good"
  if (value <= parameter.thresholds.moderate) return "moderate"
  if (value <= parameter.thresholds.unhealthy) return "unhealthy"
  return "hazardous"
}

const getTrendIcon = (trend: "up" | "down" | "stable" | undefined) => {
  switch (trend) {
    case "up":
      return "↑"
    case "down":
      return "↓"
    default:
      return "→"
  }
}

const getTrendText = (trend: "up" | "down" | "stable" | undefined): string => {
  switch (trend) {
    case "up":
      return "Rising"
    case "down":
      return "Falling"
    default:
      return "Stable"
  }
}

const stats = computed(() => {
  const currentValue = {
    title: "Current Value",
    value: "--",
    icon: Activity,
    iconColor: "var(--color-blue-600)",
    quality: undefined as
      | "good"
      | "moderate"
      | "unhealthy"
      | "hazardous"
      | undefined,
    trend: undefined as "up" | "down" | "stable" | undefined,
  }
  const averageValue = Object.assign({}, currentValue, {
    title: "Average",
    icon: BarChart3,
    iconColor: "var(--color-green-600)",
  })
  const minValue = Object.assign({}, currentValue, {
    title: "Minimum",
    icon: TrendingDown,
    iconColor: "var(--color-green-600)",
  })
  const maxValue = Object.assign({}, currentValue, {
    title: "Maximum",
    icon: TrendingUp,
    iconColor: "var(--color-red-600)",
  })

  if (!props.data.length) {
    return [currentValue, averageValue, minValue, maxValue]
  }

  const values = props.data.map((d) => d.value)
  const current = values[values.length - 1]
  const average = values.reduce((sum, val) => sum + val, 0) / values.length
  const min = Math.min(...values)
  const max = Math.max(...values)

  // Calculate trend
  const recentCount = Math.max(1, Math.floor(values.length * 0.1))
  const recentAvg =
    values.slice(-recentCount).reduce((sum, val) => sum + val, 0) / recentCount
  const oldAvg =
    values.slice(0, recentCount).reduce((sum, val) => sum + val, 0) /
    recentCount

  let trend: "up" | "down" | "stable" = "stable"
  const change = (recentAvg - oldAvg) / oldAvg
  if (change > 0.05) trend = "up"
  else if (change < -0.05) trend = "down"

  // Get current parameter (assuming it's the first one)
  const currentParameter = props.parameters[0]
  const currentQuality = getQualityLevel(current, currentParameter)

  currentValue.value = `${current.toFixed(1)} ${currentParameter.unit}`
  currentValue.quality = currentQuality
  currentValue.trend = trend

  averageValue.value = `${average.toFixed(1)} ${currentParameter.unit}`
  averageValue.quality = getQualityLevel(average, currentParameter)

  minValue.value = `${min.toFixed(1)} ${currentParameter.unit}`
  minValue.quality = getQualityLevel(min, currentParameter)

  maxValue.value = `${max.toFixed(1)} ${currentParameter.unit}`
  maxValue.quality = getQualityLevel(max, currentParameter)
  return [currentValue, averageValue, minValue, maxValue]
})
</script>
