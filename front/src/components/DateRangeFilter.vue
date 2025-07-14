<template>
  <Card class="p-4">
    <div class="space-y-4">
      <!-- CARD HEADER -->
      <div class="flex items-center justify-between">
        <!-- CARD TITLE -->
        <h3 class="text-sm font-medium text-foreground">Date Range</h3>
        <!-- RESET BUTTON -->
        <Button
          variant="ghost"
          size="sm"
          @click="resetToDefault"
          class="text-xs"
        >
          Reset
        </Button>
      </div>

      <!-- QUICK PRESETS -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <Button
          v-for="preset in presets"
          :key="preset.label"
          variant="outline"
          size="sm"
          @click="applyPreset(preset)"
          :class="{ 'bg-accent': isActivePreset(preset) }"
          class="text-xs"
        >
          {{ preset.label }}
        </Button>
      </div>

      <!-- DATE INPUTS -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- START DATE -->
        <div class="space-y-2">
          <label class="text-xs font-medium text-muted-foreground">
            Start date
          </label>
          <Input
            type="date"
            :value="formatInputDate(localRange.startDate)"
            @input="updateStartDate"
            :max="formatInputDate(localRange.endDate)"
            class="text-sm"
          />
        </div>
        <!-- END DATE -->
        <div class="space-y-2">
          <label class="text-xs font-medium text-muted-foreground">
            End date
          </label>
          <Input
            type="date"
            :value="formatInputDate(localRange.endDate)"
            @input="updateEndDate"
            :min="formatInputDate(localRange.startDate)"
            :max="formatInputDate(new Date())"
            class="text-sm"
          />
        </div>
      </div>

      <!-- RANGE INFORMATION -->
      <div class="text-xs text-muted-foreground">
        <p>{{ getRangeInfo() }}</p>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import {
  format,
  differenceInDays,
  subDays,
  subMonths,
  startOfDay,
  endOfDay,
} from "date-fns"

import type { DateRange } from "@/types/air-quality"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DatePreset {
  label: string
  getValue: () => DateRange
}

const props = defineProps({
  modelValue: {
    type: Object as () => DateRange,
    required: true,
  },
})
const emit = defineEmits<{
  "update:modelValue": [value: DateRange]
}>()

const localRange = ref<DateRange>({ ...props.modelValue })

const presets: DatePreset[] = [
  {
    label: "Today",
    getValue: () => ({
      startDate: startOfDay(new Date()),
      endDate: endOfDay(new Date()),
    }),
  },
  {
    label: "7 days",
    getValue: () => ({
      startDate: subDays(new Date(), 7),
      endDate: new Date(),
    }),
  },
  {
    label: "30 days",
    getValue: () => ({
      startDate: subDays(new Date(), 30),
      endDate: new Date(),
    }),
  },
  {
    label: "3 months",
    getValue: () => ({
      startDate: subMonths(new Date(), 3),
      endDate: new Date(),
    }),
  },
]

const formatInputDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd")
}

const updateStartDate = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newDate = new Date(target.value)
  if (!isNaN(newDate.getTime())) {
    localRange.value.startDate = newDate
    emitUpdate()
  }
}

const updateEndDate = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newDate = new Date(target.value)
  if (!isNaN(newDate.getTime())) {
    localRange.value.endDate = newDate
    emitUpdate()
  }
}

const applyPreset = (preset: DatePreset) => {
  localRange.value = preset.getValue()
  emitUpdate()
}

const isActivePreset = (preset: DatePreset): boolean => {
  const presetRange = preset.getValue()
  const diffFrom = Math.abs(
    localRange.value.startDate.getTime() - presetRange.startDate.getTime()
  )
  const diffTo = Math.abs(
    localRange.value.endDate.getTime() - presetRange.endDate.getTime()
  )

  // 1-day tolerance to consider preset active
  return diffFrom < 24 * 60 * 60 * 1000 && diffTo < 24 * 60 * 60 * 1000
}

const resetToDefault = () => {
  localRange.value = {
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
  }
  emitUpdate()
}

const getRangeInfo = (): string => {
  const days = differenceInDays(
    localRange.value.endDate,
    localRange.value.startDate
  )
  const fromStr = format(localRange.value.startDate, "dd MMM yyyy")
  const toStr = format(localRange.value.endDate, "dd MMM yyyy")

  return `${fromStr} - ${toStr} (${days} days)`
}

const emitUpdate = () => {
  emit("update:modelValue", { ...localRange.value })
}

// Synchronize with props
watch(
  () => props.modelValue,
  (newValue) => {
    localRange.value = { ...newValue }
  },
  { deep: true }
)
</script>
