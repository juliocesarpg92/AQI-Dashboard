<template>
  <div
    :class="
      cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium',
        qualityStyles[quality],
        sizeStyles[size]
      )
    "
    :aria-label="`Air quality: ${qualityLabels[quality]}`"
  >
    <div
      :class="cn('rounded-full', dotSizes[size])"
      :style="{ backgroundColor: qualityColors[quality] }"
    />
    <span>{{ qualityLabels[quality] }}</span>
  </div>
</template>

<script setup lang="ts">
import { cn } from "@/lib/utils"

interface Props {
  quality: "good" | "moderate" | "unhealthy" | "hazardous"
  size?: "sm" | "md" | "lg"
}

withDefaults(defineProps<Props>(), {
  size: "md",
})

const qualityLabels = {
  good: "Good",
  moderate: "Moderate",
  unhealthy: "Unhealthy",
  hazardous: "Hazardous",
}

const qualityColors = {
  good: "#10B981",
  moderate: "#F59E0B",
  unhealthy: "#EF4444",
  hazardous: "#7C2D12",
}

const qualityStyles = {
  good: "bg-green-100 text-green-800 border border-green-200",
  moderate: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  unhealthy: "bg-red-100 text-red-800 border border-red-200",
  hazardous: "bg-red-200 text-red-900 border border-red-300",
}

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-2 text-base",
}

const dotSizes = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5",
}
</script>
