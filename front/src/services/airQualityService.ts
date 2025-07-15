import type {
  AirQualityData,
  AirQualityFilters,
  AirQualityParameter,
} from "@/types/air-quality"

class AirQualityService {
  async fetchData(filters: AirQualityFilters): Promise<AirQualityData[]> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/filter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            parameters: [filters.parameter.key],
            startDate: filters.dateRange.startDate.getTime(),
            endDate: filters.dateRange.endDate.getTime(),
          }),
        }
      )

      const filteredData: AirQualityData[] = await response
        .json()
        .then((data) => data.data)

      return filteredData
    } catch (error) {
      console.error("Error fetching air quality data:", error)
      return []
    }
  }

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
}

export const airQualityService = new AirQualityService()
