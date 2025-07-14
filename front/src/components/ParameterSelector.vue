<template>
  <Card class="p-4">
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium text-foreground">Parameter</h3>
        <QualityIndicator :quality="currentQuality" size="sm" />
      </div>

      <!-- PARAMETERS GRID -->
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-2">
        <!-- PARAMETER -->
        <Button
          v-for="parameter in parameters"
          :key="parameter.key"
          :variant="modelValue.key === parameter.key ? 'default' : 'outline'"
          size="sm"
          @click="selectParameter(parameter)"
          class="flex flex-col items-center gap-1 h-auto py-3"
        >
          <div
            class="w-3 h-3 rounded-full"
            :style="{ backgroundColor: parameter.color }"
          />
          <!-- TITLE -->
          <span class="text-xs font-medium text-wrap wrap-normal">{{
            parameter.label
          }}</span>
          <!-- SUBTITLE -->
          <span class="text-xs text-muted-foreground">{{
            parameter.unit
          }}</span>
        </Button>
      </div>

      <!-- SELECTED PARAMETER INFORMATION -->
      <div v-if="selectedParameter" class="space-y-2">
        <div class="text-xs text-muted-foreground">
          <!-- SELECTED PARAMETER NAME -->
          <p class="font-medium">{{ selectedParameter.label }}</p>
          <!-- SELECTED PARAMETER UNIT -->
          <p>Unit: {{ selectedParameter.unit }}</p>
        </div>

        <!-- QUALITY LEVELS -->
        <div class="grid grid-cols-3 gap-2 text-xs">
          <!-- GOOD -->
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-full bg-green-500" />
            <span>Good: ≤{{ selectedParameter.thresholds.good }}</span>
          </div>
          <!-- MODERATE -->
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Moderate: ≤{{ selectedParameter.thresholds.moderate }}</span>
          </div>
          <!-- BAD -->
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-full bg-red-500" />
            <span>Bad: >{{ selectedParameter.thresholds.unhealthy }}</span>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue"
import type { AirQualityParameter } from "@/types/air-quality"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import QualityIndicator from "@/components/QualityIndicator.vue"

interface Props {
  modelValue: AirQualityParameter
  parameters: AirQualityParameter[]
  currentValue?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  "update:modelValue": [value: AirQualityParameter]
}>()

const selectedParameter = computed(() => props.modelValue)

const currentQuality = computed(() => {
  if (!props.currentValue || !selectedParameter.value) return "good"

  const { thresholds } = selectedParameter.value
  const value = props.currentValue

  if (value <= thresholds.good) return "good"
  if (value <= thresholds.moderate) return "moderate"
  if (value <= thresholds.unhealthy) return "unhealthy"
  return "hazardous"
})

const selectParameter = (parameter: AirQualityParameter) => {
  emit("update:modelValue", parameter)
}
</script>
