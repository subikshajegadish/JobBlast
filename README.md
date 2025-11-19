# Job Application Tracker

A full-stack monorepo application for tracking job applications with automatic detection from job sites, a REST API backend, and a web dashboard.

## Project Structure

```
job-app-tracker/
├── backend/          # Django REST Framework API
├── extension/        # Chrome Extension (Manifest V3)
├── dashboard/        # React Web Dashboard
└── README.md         # This file
```

## Components

### 1. Backend (Django REST Framework)
- RESTful API with JWT authentication
- PostgreSQL database
- CORS enabled for extension and web UI
- Full CRUD operations for job applications

### 2. Chrome Extension
- Manifest V3
- Automatic job detection on LinkedIn, Indeed, and other sites
- React-based popup UI for manual entry
- Content scripts for scraping job information

### 3. Web Dashboard
- React application with TailwindCSS
- Table view with filtering and search
- CRUD operations
- Responsive design

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd job-app-tracker
   ```

2. **Set up the Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your database credentials
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   ```

3. **Set up the Dashboard**
   ```bash
   cd dashboard
   npm install
   npm run dev
   ```

4. **Set up the Extension**
   ```bash
   cd extension
   npm install
   npm run build
   # Load the extension/dist folder in Chrome
   ```

For detailed setup instructions, see the README files in each component directory:
- [Backend README](./backend/README.md)
- [Extension README](./extension/README.md)
- [Dashboard README](./dashboard/README.md)

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=jobtracker
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

## API Endpoints

- `POST /api/token/` - Get JWT token (login)
- `POST /api/token/refresh/` - Refresh JWT token
- `GET /api/applications/` - List applications
- `POST /api/applications/` - Create application
- `GET /api/applications/{id}/` - Get application
- `PUT /api/applications/{id}/` - Update application
- `DELETE /api/applications/{id}/` - Delete application

## Features

- ✅ Automatic job detection from LinkedIn and Indeed
- ✅ Manual job application entry
- ✅ Status tracking (Applied, Interview, Offer, Rejected, Ghosted)
- ✅ Filtering and search
- ✅ JWT authentication
- ✅ Responsive web dashboard
- ✅ Chrome extension integration

## Development

Each component can be developed independently. Make sure the backend is running before testing the extension or dashboard.

## License

MIT

