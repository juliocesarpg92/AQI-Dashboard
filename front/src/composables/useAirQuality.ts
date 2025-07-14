import { ref, computed, watch } from "vue"
import { debounce } from "@/lib/utils"
import { airQualityService } from "@/services/airQualityService"
import type {
  AirQualityFilters,
  AirQualityParameter,
  ChartDataPoint,
  DateRange,
  // AirQualityStats,
} from "@/types/air-quality"

export function useAirQuality() {
  // Reactive state
  const data = ref<ChartDataPoint[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  // const stats = ref<AirQualityStats | null>(null)

  // Available parameters
  const parameters: AirQualityParameter[] = [
    {
      key: "co_gt",
      label: "Carbon Monoxide (CO)",
      unit: "mg/m³",
      color: "#3B82F6",
      thresholds: { good: 3, moderate: 7, unhealthy: 10 },
    },
    {
      key: "nmhc_gt",
      label: "Non-methane Hydrocarbons (NMHC)",
      unit: "µg/m³",
      color: "#10B981",
      thresholds: { good: 20, moderate: 50, unhealthy: 100 },
    },
    {
      key: "c6h6_gt",
      label: "Benzene (C₆H₆)",
      unit: "µg/m³",
      color: "#F59E0B",
      thresholds: { good: 2, moderate: 5, unhealthy: 10 },
    },
    {
      key: "nox_gt",
      label: "Nitrogen Oxides (NOx)",
      unit: "ppb",
      color: "#8B5CF6",
      thresholds: { good: 20, moderate: 50, unhealthy: 100 },
    },
    {
      key: "no2_gt",
      label: "Nitrogen Dioxide (NO₂)",
      unit: "µg/m³",
      color: "#EF4444",
      thresholds: { good: 25, moderate: 60, unhealthy: 150 },
    },
  ]

  // Filters
  const filters = ref<AirQualityFilters>({
    dateRange: {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      endDate: new Date(),
    },
    parameter: parameters[0], // Default parameter
    // aggregation: "hourly",
  })

  // Computed properties
  const selectedParameter = computed(
    () => filters.value.parameter || parameters[0]
  )

  const chartData = computed(() => data.value)

  // Determine automatic aggregation based on date range
  const determineAggregation = (
    dateRange: DateRange
  ): "hourly" | "daily" | "weekly" => {
    const diffDays = Math.ceil(
      (dateRange.endDate.getTime() - dateRange.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )

    if (diffDays <= 7) return "hourly"
    if (diffDays <= 30) return "daily"
    return "weekly"
  }

  // Function to get data
  const fetchData = async () => {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      // Determine automatic aggregation
      // filters.value.aggregation = determineAggregation(filters.value.dateRange)

      // Get data and statistics in parallel
      const [
        chartDataResponse,
        // statsData
      ] = await Promise.all([
        airQualityService.fetchData(filters.value).then((data) => {
          return data.map((item) => ({
            timestamp: item.timestamp,
            value: item[filters.value.parameter.key],
            quality: airQualityService.getQualityLevel(
              item[filters.value.parameter.key],
              selectedParameter.value
            ),
          }))
        }),
        // airQualityService.getStats(filters.value),
      ])

      data.value = chartDataResponse
      // stats.value = statsData
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Error loading data"
      console.error("Error fetching air quality data:", err)
    } finally {
      loading.value = false
    }
  }

  // Debounced function to avoid excessive calls
  const debouncedFetchData = debounce(fetchData, 300)

  // Watchers for filter changes
  watch(
    () => filters.value,
    () => {
      debouncedFetchData()
    },
    { deep: true }
  )

  // Functions to update filters
  const updateDateRange = (newRange: DateRange) => {
    filters.value.dateRange = newRange
  }

  const refreshData = () => {
    fetchData()
  }

  return {
    // State
    data,
    loading,
    error,
    // stats,
    filters,

    // Computed
    selectedParameter,
    chartData,
    parameters,

    // Methods
    updateDateRange,
    refreshData,
    fetchData,
  }
}
