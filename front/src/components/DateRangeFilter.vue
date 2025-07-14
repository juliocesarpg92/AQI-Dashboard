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

      <!-- DATE INPUTS -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- START DATE -->
        <div class="space-y-2">
          <label class="text-xs font-medium text-muted-foreground">
            Start date
          </label>
          <Input
            v-model="startDateInput"
            type="date"
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
            v-model="endDateInput"
            type="date"
            :min="formatInputDate(localRange.startDate)"
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
import { ref, watch, computed } from "vue"
import { format, differenceInDays, subDays } from "date-fns"

import type { DateRange } from "@/types/air-quality"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Props {
  modelValue: DateRange
}

const props = defineProps<Props>()
const emit = defineEmits<{
  "update:modelValue": [value: DateRange]
}>()

const localRange = ref<DateRange>({ ...props.modelValue })

const formatInputDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd")
}

const startDateInput = computed({
  get: () => formatInputDate(localRange.value.startDate),
  set: (value: string) => {
    const newDate = new Date(value)
    if (!isNaN(newDate.getTime())) {
      localRange.value.startDate = newDate
      emitUpdate()
    }
  },
})

const endDateInput = computed({
  get: () => formatInputDate(localRange.value.endDate),
  set: (value: string) => {
    const newDate = new Date(value)
    if (!isNaN(newDate.getTime())) {
      localRange.value.endDate = newDate
      emitUpdate()
    }
  },
})

const resetToDefault = () => {
  localRange.value = {
    startDate: new Date(2004, 2, 1, 0, 0, 0),
    endDate: new Date(2005, 3, 4, 23, 59, 59),
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
