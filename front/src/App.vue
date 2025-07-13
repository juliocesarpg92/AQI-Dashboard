<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b bg-card">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-foreground">
              Monitor de Calidad del Aire
            </h1>
            <p class="text-muted-foreground mt-1">
              Visualización en tiempo real de datos ambientales
            </p>
          </div>
          <div class="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              @click="refreshData"
              :disabled="loading"
              aria-label="Actualizar todos los datos"
            >
              <span
                :class="{ 'animate-spin': loading }"
                class="inline-block w-4 h-4 mr-2"
                >⟳</span
              >
              Actualizar
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="space-y-8">
        <!-- Controls -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DateRangeFilter
            v-model="filters.dateRange"
            @update:model-value="updateDateRange"
          />
          <ParameterSelector
            v-model="filters.parameter"
            :parameters="parameters"
            @update:model-value="updateParameter"
          />
        </div>

        <!-- Stats Cards -->
        <StatsCards :data="data" :parameters="parameters" />

        <!-- Chart -->
        <AirQualityChart
          :data="chartData"
          :selected-parameter="selectedParameter"
          :date-range="filters.dateRange"
          :loading="loading"
          :error="error"
          @refresh="refreshData"
        />

        <!-- Footer Info -->
        <Card class="p-6">
          <div
            class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground"
          >
            <div>
              <h4 class="font-semibold text-foreground mb-2">
                Información del Dataset
              </h4>
              <ul class="space-y-1">
                <li>
                  • Total de registros: {{ data.length.toLocaleString() }}
                </li>
                <li>• Período: {{ formatDateRange() }}</li>
                <li>• Frecuencia: {{ filters.aggregation }}</li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold text-foreground mb-2">
                Parámetros Monitoreados
              </h4>
              <ul class="space-y-1">
                <li v-for="param in parameters" :key="param.key">
                  • {{ param.label }} ({{ param.unit }})
                </li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold text-foreground mb-2">Optimizaciones</h4>
              <ul class="space-y-1">
                <li>• Caché inteligente: 5 min</li>
                <li>• Agregación automática</li>
                <li>• Debouncing: 300ms</li>
                <li>• Renderizado progresivo</li>
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
import StatsCards from "@/components/StatsCards.vue"
import Card from "@/components/ui/card"
import Button from "@/components/ui/button"

const {
  data,
  loading,
  error,
  filters,
  selectedParameter,
  chartData,
  parameters,
  updateDateRange,
  updateParameter,
  refreshData,
  fetchData,
} = useAirQuality()

const formatDateRange = () => {
  return `${formatDate(filters.value.dateRange.from)} - ${formatDate(
    filters.value.dateRange.to
  )}`
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.container {
  @apply max-w-7xl;
}

@media (max-width: 768px) {
  .container {
    @apply px-2;
  }
}
</style>
