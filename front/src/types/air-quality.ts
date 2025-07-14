export interface AirQualityData {
  timestamp: number // Unix timestamp in milliseconds
  co_gt: number
  nmhc_gt: number
  c6h6_gt: number
  nox_gt: number
  no2_gt: number
  temperature: number
  relative_humidity: number
  absolute_humidity: number
}

export interface AirQualityParameter {
  key: keyof Omit<
    AirQualityData,
    "timestamp" | "temperature" | "relative_humidity" | "absolute_humidity"
  >
  label: string
  unit: string
  color: string
  thresholds: {
    good: number
    moderate: number
    unhealthy: number
  }
}

export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface ChartDataPoint {
  timestamp: Date
  value: number
  quality: "good" | "moderate" | "unhealthy" | "hazardous"
}

export interface AirQualityFilters {
  dateRange: DateRange
  parameter: AirQualityParameter
  // aggregation: "hourly" | "daily" | "weekly"
}

// export interface AirQualityStats {
//   current: number
//   average: number
//   min: number
//   max: number
//   trend: "up" | "down" | "stable"
//   quality: "good" | "moderate" | "unhealthy" | "hazardous"
// }
