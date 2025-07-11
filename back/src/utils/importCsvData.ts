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
    const chunks: Record<string, any>[] = []
    const stream = fs.createReadStream(filePath)

    stream
      .pipe(
        csvParser({
          separator: ";",
          mapHeaders: ({ header }) => {
            header = header.trim().toLowerCase()
            header = header
              .replaceAll(" ", "_")
              .replaceAll(".", "_")
              .replaceAll("(", "_")
              .replaceAll(")", "")
            if (header === "") return null
            return header
          },
          mapValues: ({ header, value }) => {
            value = value.trim() // remove leading/trailing whitespace
            if (value === "" || value === "-200") return null
            if (header === "time") {
              return value.replace(".", ":")
            }
            if (header === "date") {
              const date = value.split("/")
              value = date.reverse().join("-")
              return new Date(value)
            }
            const numValue = parseFloat(value)
            return isNaN(numValue) ? value : numValue
          },
        })
      )
      .on("headers", (headers) => {
        console.log(`CSV headers: ${headers.join(", ")}`)
      })
      .on("data", (data) => {
        // skip records with null values
        if (Object.values(data).every((value) => value === null)) {
          console.warn("Skipping record with null values:", data)
          return
        }

        chunks.push(data)

        if (chunks.length === chunkSize) {
          stream.pause()
          // Create a copy of chunks to pass to chunkHandler
          chunkHandler([...chunks])
            .then(() => {
              stream.resume()
            })
            .catch((error) => {
              stream.destroy()
              reject(error)
            })
          chunks.length = 0 // clear chunks immediately, if not fails
        }
      })
      .on("end", () => {
        if (chunks.length > 0) {
          chunkHandler([...chunks])
            .then(() => resolve())
            .catch((error) => reject(error))
          chunks.length = 0 // clear chunks after processing
        } else {
          resolve()
        }
      })
      .on("error", (error) => reject(error))
  })
}
