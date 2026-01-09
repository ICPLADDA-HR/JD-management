# API Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start JSON Server (Mock API)
```bash
npm run json-server
```
This will start the mock API server on `http://localhost:3001`

### 3. Start Development Server
```bash
npm run dev
```
This will start the React app on `http://localhost:5173`

### 4. Run Both Simultaneously
```bash
npm run dev:full
```
This will start both the JSON server and React app concurrently.

## 📊 API Endpoints

The mock API provides the following endpoints:

### Job Descriptions
- `GET /jobDescriptions` - Get all job descriptions
- `GET /jobDescriptions/:id` - Get job description by ID
- `POST /jobDescriptions` - Create new job description
- `PUT /jobDescriptions/:id` - Update job description
- `PATCH /jobDescriptions/:id` - Partial update job description
- `DELETE /jobDescriptions/:id` - Delete job description

### Supporting Data
- `GET /locations` - Get all locations
- `GET /departments` - Get all departments
- `GET /teams` - Get all teams
- `GET /competencies` - Get all competencies
- `GET /users` - Get all users

## 🔧 Features Implemented

### ✅ CRUD Operations
- **Create**: Add new job descriptions with full form validation
- **Read**: Browse, search, and filter job descriptions
- **Update**: Edit existing job descriptions (coming in EditJDPage)
- **Delete**: Remove job descriptions with confirmation

### ✅ Search & Filter
- Text search across job descriptions
- Filter by status (draft, published, archived)
- Filter by department, location, job band
- Clear filters functionality

### ✅ Status Management
- Draft/Published/Archived status
- Publish draft job descriptions
- Archive published job descriptions

### ✅ Loading & Error States
- Loading spinners during API calls
- Error handling with toast notifications
- Success feedback for all operations

### ✅ Responsive Design
- Mobile-friendly interface
- Responsive tables and forms
- Touch-friendly buttons and interactions

## 🎯 Testing Flow

1. **Create Flow**: `/jd/create` → Fill form → Save → View created JD
2. **Browse Flow**: `/job-descriptions` → Search/Filter → View results
3. **View Flow**: Click any JD → View details → Edit/Delete options
4. **Edit Flow**: View JD → Edit button → Modify → Save (when EditJDPage is updated)

## 📝 Sample Data

The `db.json` file includes:
- 3 sample job descriptions (different statuses)
- 2 locations (Bangkok, Chiang Mai)
- 2 departments (Engineering, Marketing)
- 3 teams across departments
- 4 core competencies
- 2 sample users

## 🔄 API Client Features

- Axios-based HTTP client
- Automatic error handling
- Request/response interceptors
- Type-safe API calls
- Toast notifications for user feedback

## 🚨 Important Notes

1. **JSON Server**: The mock API uses json-server which provides a full REST API
2. **Data Persistence**: Data is stored in `db.json` and persists between sessions
3. **Auto-reload**: JSON server watches `db.json` for changes
4. **CORS**: No CORS issues since both servers run locally
5. **ID Generation**: Simple timestamp-based ID generation for new records

## 🔧 Troubleshooting

### Port Conflicts
If port 3001 is busy, modify the json-server command in `package.json`:
```json
"json-server": "json-server --watch db.json --port 3002"
```

### API Connection Issues
- Ensure json-server is running on http://localhost:3001
- Check browser network tab for failed requests
- Verify `db.json` file exists and is valid JSON

### Data Issues
- Reset data by restoring `db.json` from backup
- Check console for API errors
- Verify request/response format matches types