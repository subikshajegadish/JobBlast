# Quick Start Guide

Get the Job Application Tracker up and running in minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ Python 3.8+ installed
- ✅ Node.js 18+ installed
- ✅ PostgreSQL installed and running
- ✅ npm or yarn installed

## Step-by-Step Setup

### 1. Database Setup

Create a PostgreSQL database:

```bash
# Using psql
createdb jobtracker

# Or using SQL
psql -U postgres
CREATE DATABASE jobtracker;
```

### 2. Backend Setup (5 minutes)

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials:
# DB_NAME=jobtracker
# DB_USER=postgres
# DB_PASSWORD=your_password

# Run migrations
python manage.py migrate

# Create a user account
python manage.py createsuperuser
# Enter username, email, and password when prompted

# Start the server
python manage.py runserver
```

Backend should now be running at `http://localhost:8000`

### 3. Dashboard Setup (2 minutes)

Open a new terminal:

```bash
cd dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Dashboard should now be running at `http://localhost:5173`

### 4. Extension Setup (3 minutes)

Open a new terminal:

```bash
cd extension

# Install dependencies
npm install

# Build the extension
npm run build

# Load in Chrome
# 1. Open Chrome and go to chrome://extensions/
# 2. Enable "Developer mode" (toggle in top right)
# 3. Click "Load unpacked"
# 4. Select the 'dist' folder from the extension directory
```

**Note**: You'll need to add icons to the `icons/` folder. See `extension/ICONS.md` for instructions.

## First Use

1. **Login to Dashboard**: 
   - Go to `http://localhost:5173`
   - Login with the superuser credentials you created

2. **Login to Extension**:
   - Click the extension icon
   - Login with the same credentials

3. **Test Auto-Detection**:
   - Go to a LinkedIn or Indeed job posting
   - Click the extension icon
   - The form should auto-fill with job details

4. **Add Application**:
   - Fill in any missing details
   - Click "Save Application"
   - Check the dashboard to see your application

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `pg_isready`
- Verify database credentials in `.env`
- Check port 8000 is not in use

### Dashboard can't connect
- Ensure backend is running on port 8000
- Check browser console for CORS errors
- Verify API_BASE_URL in `dashboard/src/App.jsx`

### Extension not working
- Check that extension is loaded in Chrome
- Open Chrome DevTools (right-click extension icon > Inspect popup)
- Check for errors in console
- Verify backend is running and accessible

### Database errors
- Ensure PostgreSQL is running
- Check database exists: `psql -l | grep jobtracker`
- Verify user has permissions: `psql -U postgres -d jobtracker`

## Next Steps

- Add more job sites to the extension (edit `extension/content.js`)
- Customize the dashboard styling
- Set up production deployment
- Add email notifications
- Create API documentation

## Need Help?

Check the detailed README files:
- [Backend README](./backend/README.md)
- [Extension README](./extension/README.md)
- [Dashboard README](./dashboard/README.md)

