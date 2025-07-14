import fs from "node:fs"
import csvParser from "csv-parser"

/**
 * Ingests CSV data
 * @param filePath - Path to the CSV file
 * @param chunkHandler - Function to handle each chunk of data
 * @param chunkSize - Number of records per chunk
 * @returns Promise that resolves when processing is complete
 */
export default function importCsvData(
  filePath: string,
  chunkHandler: (data: Record<string, any>[]) => Promise<void>,
  chunkSize: number = 500
): Promise<void> {
  return new Promise((resolve, reject) => {
    let chunks: Record<string, any>[] = []
    const stream = fs.createReadStream(filePath)

    const csvHeaderFormatter = ({
      header,
    }: {
      header: string
    }): string | null => {
      header = header.trim().toLowerCase()
      header = header
        .replaceAll(" ", "_")
        .replaceAll(".", "_")
        .replaceAll("(", "_")
        .replaceAll(")", "")
      if (header === "") return null
      return header
    }

    const csvValueFormatter = ({
      header,
      value,
    }: {
      header: string
      value: string
    }): number | string | Date | null => {
      value = value.trim() // remove leading/trailing whitespace
      if (value === "") {
        return null
      }
      if (header === "time") {
        return value.replaceAll(".", ":")
      }
      if (header === "date") {
        const [day, month, year] = value.split("/")
        return new Date(`${year}-${month}-${day}`)
      }
      value = value.replace(",", ".") // replace comma with dot for decimal values
      const numValue = parseFloat(value)
      return isNaN(numValue) ? value : numValue
    }

    const onDataHandler = (data: Record<string, any>) => {
      // skip records with null values
      if (Object.values(data).every((value) => value === null)) {
        // console.warn("Skipping record with null values:", data)
        return
      }

      // combine date and time into a timestamp
      const timestamp: Date = new Date(data.date)
      if (data.time) {
        const timeParts = data.time.split(":")
        timestamp.setHours(
          parseInt(timeParts[0], 10),
          parseInt(timeParts[1], 10),
          parseInt(timeParts[2] || "0", 10)
        )
      }
      data.timestamp = timestamp.getTime()
      // remove date and time fields after combining
      delete data.date
      delete data.time

      // convert all -200 values to null
      for (const [key, value] of Object.entries(data)) {
        if (value === -200 || value === "-200") {
          data[key] = null
        }
      }

      chunks.push(data)

      if (chunks.length === chunkSize) {
        stream.pause()
        // create a copy of chunks to pass to chunkHandler
        chunkHandler([...chunks])
          .then(() => {
            stream.resume()
          })
          .catch((error) => {
            stream.destroy()
            reject(error)
          })
        chunks = [] // clear chunks immediately, if not fails
      }
    }

    const flushData = () => {
      if (chunks.length > 0) {
        chunkHandler([...chunks])
          .then(() => resolve())
          .catch((error) => reject(error))
        chunks.length = 0 // clear chunks after processing
      } else {
        resolve()
      }
    }

    stream
      .pipe(
        csvParser({
          separator: ";",
          mapHeaders: csvHeaderFormatter,
          mapValues: csvValueFormatter,
        })
      )
      .on("data", onDataHandler)
      .on("end", flushData)
      .on("error", (error) => reject(error))
  })
}
