# Air Quality Monitoring System

## Project Overview

This is a **full-stack air quality monitoring application**. The system imports, processes, and visualizes air quality data from the [UCI Air Quality Dataset](https://archive.ics.uci.edu/dataset/360/air+quality), providing charts and filtering capabilities.

## Architecture

### Backend (back)
- **Framework**: [Hono.js](https://hono.dev/) with Node.js
- **Database**: PostgreSQL
- **Language**: TypeScript
- **Key Features**:
  - data streams to CSV processing and import (`importCsvData.ts`)
  - RESTful API with Zod schema validation (`index.ts`)
  - Database setup and querying (`db/index.js`)
  - Filter validation (`models/filters.js`)
  - Test key functionalities with node's built-in testing module

### Frontend (front)
- **Framework**: Vue 3 with Composition API
- **Charting**: ECharts via vue-echarts
- **Styling**: Shadcn-vue with Tailwind CSS
- **Key Features**:
  - Interactive data visualization
  - Date filtering and parameter search
  - Responsive design
  - API communication

## Data Processing Pipeline

1. **CSV Import**: Processes air quality data with automatic type conversion
2. **Data Cleaning**: Converts `-200` values to `null` (missing data indicators)
3. **Timestamp Handling**: Combines separate date and time fields
4. **Chunked Processing**: Handles large datasets with configurable batch sizes

## API Endpoints

### POST `/filter`
Filters air quality data by parameters and date range.

**Request Body**:
```typescript
{
  parameters: string[],  // e.g., ["co_gt", "no2_gt"]
  startDate: number,     // Unix epoch timestamp
  endDate: number        // Unix epoch timestamp
}
```

**Response**:
```typescript
{
  message: string,
  data: AirQualityData[]
}
```

## Data Model

### AirQualityData Interface
```typescript
interface AirQualityData {
  timestamp: number           // Unix epoch timestamp
  co_gt: number | undefined        // Carbon Monoxide
  nmhc_gt: number | undefined      // Non-methane hydrocarbons
  c6h6_gt: number | undefined      // Benzene
  nox_gt: number | undefined       // Nitrogen oxides
  no2_gt: number | undefined       // Nitrogen dioxide
  temperature: number | undefined
  relative_humidity: number | undefined
  absolute_humidity: number | undefined
}
```

## Current Status

### ✅ Completed Features
- CSV data import with error handling
- PostgreSQL database setup and seeding
- API endpoints with Zod validation
- Interactive ECharts visualization
- Date range filtering
- TypeScript type safety
- Environment configuration

### 🚧 In Progress
- Date range filter improvements
- Error handling enhancements
- Performance optimizations in frontend to handle larger datasets
- Docker containerization

### 📋 Planned Features
- Server-Sent Events (SSE) for real-time updates
- Bulk insert optimization
- Comprehensive test coverage
- Complete docker containerization
- Complete documentation

## Development Setup

### Prerequisites
- Node.js (v20 or higher)
- PostgreSQL (v12 or higher)
- npm (Node Package Manager)

### Installation Steps

```bash
# Database
./start_dev.sh

# Backend
cd back
npm install
cp .env.example .env
npm run dev

# Frontend  
cd front
npm install
cp .env.example .env
npm run dev
```


- [ ] backend
  - [x] import CSV data into the database
    - [x] test
  - [x] API endpoints
    - [x] schema validation
    - [ ] error handling
    - [ ] tests
  - [ ] Database setup
    <!-- - [ ] mount mongodb database -->
    - [x] create tables if not exist
    - [x] seed initial data (use the import CSV data step)
      - [x] data has errors: 
        - decimals numbers are not parsed correctly
        - time is not parsed correctly
      - [x] date/time fields should become timestamp field
    - [ ] implement bulk insert
    - [x] queries
  - [ ] implement streaming API
    - [ ] use server-sent events (SSE)
    - [ ] use cursor instead of offset
    
- [ ] frontend
  - [x] create a chart to display data
  - [x] implement search functionality by parameter and date range
    - [x] date range has error
  - [ ] efficiently handle the data

- [ ] Environment variables
- [ ] Dockerize the application
- [ ] update readme with instructions

