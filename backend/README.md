# Backend - Django REST Framework API

RESTful API for the Job Application Tracker using Django REST Framework with JWT authentication and PostgreSQL.

## Features

- JWT-based authentication
- Full CRUD operations for job applications
- Filtering and search capabilities
- PostgreSQL database
- CORS enabled for extension and web UI

## Prerequisites

- Python 3.8 or higher
- PostgreSQL 12 or higher
- pip

## Installation

1. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create a database named 'jobtracker'
   createdb jobtracker
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   DB_NAME=jobtracker
   DB_USER=postgres
   DB_PASSWORD=your-password
   DB_HOST=localhost
   DB_PORT=5432
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

## Running the Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication

- **POST** `/api/token/` - Obtain JWT token
  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```
  Response:
  ```json
  {
    "access": "jwt_access_token",
    "refresh": "jwt_refresh_token"
  }
  ```

- **POST** `/api/token/refresh/` - Refresh JWT token
  ```json
  {
    "refresh": "jwt_refresh_token"
  }
  ```

### Applications

All application endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

- **GET** `/api/applications/` - List all applications
  - Query parameters:
    - `status` - Filter by status (Applied, Interview, Offer, Rejected, Ghosted)
    - `company` - Filter by company name
    - `search` - Search in job_title, company, location
    - `ordering` - Order by field (e.g., `-date_applied`)

- **POST** `/api/applications/` - Create new application
  ```json
  {
    "job_title": "Software Engineer",
    "company": "Tech Corp",
    "location": "San Francisco, CA",
    "job_link": "https://example.com/job",
    "date_applied": "2024-01-15",
    "status": "Applied",
    "notes": "Great opportunity"
  }
  ```

- **GET** `/api/applications/{id}/` - Get specific application

- **PUT** `/api/applications/{id}/` - Update application

- **PATCH** `/api/applications/{id}/` - Partially update application

- **DELETE** `/api/applications/{id}/` - Delete application

## Data Model

### JobApplication

- `id` (auto-generated)
- `user` (ForeignKey to User)
- `job_title` (CharField, required)
- `company` (CharField, required)
- `location` (CharField, optional)
- `date_applied` (DateField, required)
- `job_link` (URLField, required)
- `status` (CharField, choices: Applied, Interview, Offer, Rejected, Ghosted)
- `notes` (TextField, optional)
- `created_at` (DateTimeField, auto-generated)
- `updated_at` (DateTimeField, auto-updated)

## Testing

You can test the API using curl, Postman, or any HTTP client:

```bash
# Get token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'

# List applications
curl -X GET http://localhost:8000/api/applications/ \
  -H "Authorization: Bearer <your_access_token>"

# Create application
curl -X POST http://localhost:8000/api/applications/ \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_title": "Software Engineer",
    "company": "Tech Corp",
    "job_link": "https://example.com/job",
    "date_applied": "2024-01-15",
    "status": "Applied"
  }'
```

## Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/` using your superuser credentials.

## CORS Configuration

CORS is configured to allow requests from:
- `http://localhost:3000` (React dev server)
- `http://localhost:5173` (Vite dev server)
- Chrome extensions

To add more origins, edit `CORS_ALLOWED_ORIGINS` in `jobtracker/settings.py`.

## Troubleshooting

1. **Database connection error**: Ensure PostgreSQL is running and credentials in `.env` are correct.

2. **Migration errors**: Run `python manage.py makemigrations` then `python manage.py migrate`.

3. **CORS errors**: Check that your frontend origin is in `CORS_ALLOWED_ORIGINS`.

4. **JWT token expired**: Use the refresh endpoint to get a new access token.

