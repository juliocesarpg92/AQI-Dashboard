import type {
  AirQualityData,
  AirQualityFilters,
  AirQualityParameter,
} from "@/types/air-quality"

// Development data simulation
const generateMockData = (count: number = 10000): AirQualityData[] => {
  const data: AirQualityData[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - (count - i) * 60 * 60 * 1000) // Data every hour

    data.push({
      id: `data-${i}`,
      timestamp,
      co_gt: Math.random() * 100 + 10,
      nmhc_gt: Math.random() * 150 + 20,
      c6h6_gt: Math.random() * 1000 + 400,
      nox_gt: Math.random() * 80 + 10,
      no2_gt: Math.random() * 80 + 10,
      temperature: Math.random() * 30 + 10,
      relative_humidity: Math.random() * 80 + 20,
      absolute_humidity: Math.random() * 80 + 20,
    })
  }

  return data
}

class AirQualityService {
  private mockData: AirQualityData[] = generateMockData()

  async fetchData(filters: AirQualityFilters): Promise<AirQualityData[]> {
    // Filter data by date range
    // const filteredData = this.mockData.filter(
    //   (item) =>
    //     item.timestamp >= filters.dateRange.startDate &&
    //     item.timestamp <= filters.dateRange.endDate
    // )
    try {
      const response = await fetch("http://localhost:8000/filter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parameters: [filters.parameter.key],
          startDate: filters.dateRange.startDate.getTime(),
          endDate: filters.dateRange.endDate.getTime(),
        }),
      })

    // Aggregate data according to aggregation type
    // const aggregatedData = this.aggregateData(filteredData, filters)

      const filteredData: AirQualityData[] = await response
        .json()
        .then((data) => data.data)

      return filteredData
    } catch (error) {
      console.error("Error fetching air quality data:", error)
      return []
    }
  }

  // private aggregateData(
  //   data: AirQualityData[],
  //   filters: AirQualityFilters
  // ): AirQualityData[] {
  //   if (filters.aggregation === "hourly" || data.length <= 1000) {
  //     return data
  //   }

  //   const groupSize = filters.aggregation === "daily" ? 24 : 168 // 24 hours or 168 hours (week)
  //   const aggregated: AirQualityData[] = []

  //   for (let i = 0; i < data.length; i += groupSize) {
  //     const group = data.slice(i, i + groupSize)
  //     if (group.length === 0) continue

  //     const avgData: AirQualityData = {
  //       id: `agg-${i}`,
  //       timestamp: group[0].timestamp,
  //       co_gt: this.average(group.map((d) => d.co_gt)),
  //       nmhc_gt: this.average(group.map((d) => d.nmhc_gt)),
  //       c6h6_gt: this.average(group.map((d) => d.c6h6_gt)),
  //       nox_gt: this.average(group.map((d) => d.nox_gt)),
  //       no2_gt: this.average(group.map((d) => d.no2_gt)),
  //       temperature: this.average(group.map((d) => d.temperature)),
  //       relative_humidity: this.average(group.map((d) => d.relative_humidity)),
  //       absolute_humidity: this.average(group.map((d) => d.absolute_humidity)),
  //     }

  //     aggregated.push(avgData)
  //   }

  //   return aggregated
  // }

  // private average(values: number[]): number {
  //   return values.reduce((sum, val) => sum + val, 0) / values.length
  // }

  getQualityLevel(
    value: number,
    parameter: AirQualityParameter
  ): "good" | "moderate" | "unhealthy" | "hazardous" {
    const thresholds = parameter.thresholds

    if (value <= thresholds.good) return "good"
    if (value <= thresholds.moderate) return "moderate"
    if (value <= thresholds.unhealthy) return "unhealthy"
    return "hazardous"
  }

  // async getStats(filters: AirQualityFilters) {
  //   const data = await this.fetchData(filters)

  //   if (data.length === 0) {
  //     return {
  //       current: 0,
  //       average: 0,
  //       min: 0,
  //       max: 0,
  //       trend: "stable" as const,
  //       quality: "good" as const,
  //     }
  //   }

  //   const values = data.map((d) => d.value)
  //   const current = values[values.length - 1]
  //   const average = values.reduce((sum, val) => sum + val, 0) / values.length
  //   const min = Math.min(...values)
  //   const max = Math.max(...values)

  //   // Calculate trend comparing last 10% vs first 10%
  //   const recentCount = Math.max(1, Math.floor(values.length * 0.1))
  //   const recentAvg =
  //     values.slice(-recentCount).reduce((sum, val) => sum + val, 0) /
  //     recentCount
  //   const oldAvg =
  //     values.slice(0, recentCount).reduce((sum, val) => sum + val, 0) /
  //     recentCount

  //   let trend: "up" | "down" | "stable" = "stable"
  //   const change = (recentAvg - oldAvg) / oldAvg
  //   if (change > 0.05) trend = "up"
  //   else if (change < -0.05) trend = "down"

  //   return {
  //     current,
  //     average,
  //     min,
  //     max,
  //     trend,
  //     quality: this.getQualityLevel(current, filters.parameter),
  //   }
  // }
}

export const airQualityService = new AirQualityService()
