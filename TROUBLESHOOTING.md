# Troubleshooting Guide

## Login Issues - "Invalid Credentials"

If you're getting "Invalid credentials" when trying to login, follow these steps:

### Step 1: Verify Backend is Running

Make sure the Django backend server is running:

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

**Test the API directly:**
```bash
# Test if the server is responding
curl http://localhost:8000/api/token/ -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

### Step 2: Verify User Exists

Check if you have created a user account:

```bash
cd backend
source venv/bin/activate
python manage.py shell
```

Then in the Python shell:
```python
from django.contrib.auth.models import User
users = User.objects.all()
for user in users:
    print(f"Username: {user.username}, Email: {user.email}")
```

If no users exist, create one:
```bash
python manage.py createsuperuser
```

### Step 3: Verify Database Setup

Make sure migrations are applied:

```bash
cd backend
source venv/bin/activate
python manage.py migrate
```

Check database connection in `.env`:
```
DB_NAME=jobtracker
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### Step 4: Check Browser Console

Open browser DevTools (F12) and check the Console tab for errors:

1. **Network errors**: Check if the request is reaching the server
2. **CORS errors**: Should be handled, but check if you see CORS-related messages
3. **404 errors**: API endpoint might be wrong
4. **500 errors**: Server-side error, check backend logs

### Step 5: Test API Endpoint Directly

Use curl or Postman to test the login endpoint:

```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

Expected response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

If you get an error, check:
- Username and password are correct
- User account is active
- Backend is running on port 8000

### Step 6: Check API Base URL

Verify the API base URL in your frontend code:

**Dashboard** (`dashboard/src/App.jsx`):
```javascript
const API_BASE_URL = 'http://localhost:8000';
// Endpoints should be: ${API_BASE_URL}/api/token/
```

**Extension** (`extension/src/popup/App.jsx`):
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
// Endpoints should be: ${API_BASE_URL}/token/
```

### Step 7: Clear Browser Storage

Sometimes cached tokens can cause issues:

1. Open browser DevTools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Clear Local Storage
4. Try logging in again

### Step 8: Check Backend Logs

Look at the terminal where you're running `python manage.py runserver` for any error messages.

Common errors:
- `OperationalError: could not connect to server` - Database not running
- `django.db.utils.OperationalError: no such table` - Migrations not applied
- `Authentication failed` - Wrong credentials

### Step 9: Verify JWT Settings

Check that JWT is properly configured in `backend/jobtracker/settings.py`:

```python
INSTALLED_APPS = [
    ...
    'rest_framework',
    'rest_framework_simplejwt',
    ...
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    ...
}
```

### Step 10: Create a Test User

If you're unsure about credentials, create a fresh test user:

```bash
cd backend
source venv/bin/activate
python manage.py shell
```

```python
from django.contrib.auth.models import User
user = User.objects.create_user('testuser', 'test@example.com', 'testpass123')
user.save()
print("Created user: testuser / testpass123")
```

Then try logging in with:
- Username: `testuser`
- Password: `testpass123`

## Common Solutions

### Solution 1: Backend Not Running
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

### Solution 2: No User Account
```bash
cd backend
source venv/bin/activate
python manage.py createsuperuser
```

### Solution 3: Database Not Set Up
```bash
cd backend
source venv/bin/activate
# Create database first (if needed)
createdb jobtracker
# Then run migrations
python manage.py migrate
```

### Solution 4: Wrong Port
If backend is running on a different port, update `API_BASE_URL` in:
- `dashboard/src/App.jsx`
- `extension/src/popup/App.jsx`

## Still Having Issues?

1. Check the browser console for detailed error messages
2. Check the backend terminal for server errors
3. Verify all environment variables in `.env` are correct
4. Make sure PostgreSQL is running: `pg_isready`
5. Try accessing the admin panel: `http://localhost:8000/admin/`

