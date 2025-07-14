<template>
  <div class="min-h-screen bg-background">
    <!-- HEADER -->
    <header class="border-b bg-card">
      <div class="max-w-7xl mx-auto px-2 md:px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <!-- TITLE -->
            <h1 class="text-3xl font-bold text-foreground">
              Air Quality Monitor
            </h1>
            <!-- SUBTITLE -->
            <p class="text-muted-foreground mt-1">
              Real-time environmental data visualization
            </p>
          </div>
          <!-- REFRESH BUTTON -->
          <div class="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              @click="refreshData"
              :disabled="loading"
              aria-label="Refresh all data"
            >
              <RotateCw
                c:class="{ 'animate-spin': loading }"
                class="inline-block w-4 h-4 mr-2"
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- MAIN CONTENT -->
    <main class="max-w-7xl mx-auto px-2 md:px-4 py-8">
      <div class="space-y-8">
        <!-- CONTROLS -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DateRangeFilter
            v-model="filters.dateRange"
            @update:model-value="updateDateRange"
          />
          <ParameterSelector
            v-model="filters.parameter"
            :parameters="parameters"
          />
        </div>

        <!-- STATS CARDS -->
        <!-- <StatsCards :data="data" :parameters="parameters" /> -->

        <!-- CHART -->
        <AirQualityChart
          :data="chartData"
          :selected-parameter="selectedParameter"
          :date-range="filters.dateRange"
          :loading="loading"
          :error="error"
          @refresh="refreshData"
        />

        <!-- FOOTER INFO -->
        <Card class="p-6">
          <div
            class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground"
          >
            <div>
              <h4 class="font-semibold text-foreground mb-2">
                Dataset Information
              </h4>
              <ul class="space-y-1">
                <li>• Total records: {{ data.length.toLocaleString() }}</li>
                <li>• Period: {{ formatDateRange() }}</li>
                <!-- <li>• Frequency: {{ filters.aggregation }}</li> -->
              </ul>
            </div>
            <div>
              <h4 class="font-semibold text-foreground mb-2">
                Monitored Parameters
              </h4>
              <ul class="space-y-1">
                <li v-for="param in parameters" :key="param.key">
                  • {{ param.label }} ({{ param.unit }})
                </li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold text-foreground mb-2">Optimizations</h4>
              <ul class="space-y-1">
                <li>• Smart cache: 5 min</li>
                <li>• Auto aggregation</li>
                <li>• Debouncing: 300ms</li>
                <li>• Progressive rendering</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { useAirQuality } from "@/composables/useAirQuality"
import { formatDate } from "@/lib/utils"

import AirQualityChart from "@/components/AirQualityChart.vue"
import DateRangeFilter from "@/components/DateRangeFilter.vue"
import ParameterSelector from "@/components/ParameterSelector.vue"
// import StatsCards from "@/components/StatsCards.vue"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCw } from "lucide-vue-next"

const {
  data,
  loading,
  error,
  filters,
  selectedParameter,
  chartData,
  parameters,
  updateDateRange,
  refreshData,
  fetchData,
} = useAirQuality()

const formatDateRange = () => {
  return `${formatDate(filters.value.dateRange.startDate)} - ${formatDate(
    filters.value.dateRange.endDate
  )}`
}

onMounted(() => {
  fetchData()
})
</script>
