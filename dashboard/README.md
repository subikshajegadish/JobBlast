# Web Dashboard - Job Application Tracker

A React-based web dashboard for viewing and managing job applications with a clean, modern UI built with TailwindCSS.

## Features

- ✅ Table view of all job applications
- ✅ Filter by status, company, and search
- ✅ Create, edit, and delete applications
- ✅ JWT authentication
- ✅ Responsive design
- ✅ Clean UI with TailwindCSS

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend API running (see [Backend README](../backend/README.md))

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

   The dashboard will be available at `http://localhost:5173`

## Configuration

The dashboard is configured to connect to the backend API at `http://localhost:8000`. To change this:

1. Edit `src/App.jsx` and update the `API_BASE_URL` constant.

## Usage

### Login

1. Enter your username and password (from the backend)
2. Click "Login"
3. Your JWT token will be stored in localStorage

### Viewing Applications

- Applications are displayed in a table format
- Default sorting is by date applied (newest first)
- Use the search bar to search by job title or company
- Use the status filter to filter by application status
- Use the company filter to filter by specific company

### Adding Applications

1. Click the "Add Application" button
2. Fill in the form:
   - Job Title (required)
   - Company (required)
   - Location (optional)
   - Job Link (required)
   - Date Applied (required)
   - Status (required)
   - Notes (optional)
3. Click "Save"

### Editing Applications

1. Click the edit icon (pencil) next to an application
2. Modify the fields in the modal
3. Click "Update"

### Deleting Applications

1. Click the delete icon (trash) next to an application
2. Confirm the deletion

## Project Structure

```
dashboard/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   ├── index.css        # Global styles with Tailwind
│   └── lib/
│       └── utils.js     # Utility functions (cn for className merging)
├── index.html
├── package.json
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # TailwindCSS configuration
└── postcss.config.js    # PostCSS configuration
```

## Building for Production

```bash
npm run build
```

This will create a `dist` folder with optimized production files.

## Preview Production Build

```bash
npm run preview
```

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Lucide React** - Icon library

## Styling

The dashboard uses TailwindCSS for styling. Key features:
- Responsive design with mobile-first approach
- Custom color scheme for status badges
- Clean, modern UI components
- Hover states and transitions

## API Integration

The dashboard communicates with the backend API using:
- JWT tokens for authentication
- Axios for HTTP requests
- Automatic token refresh handling
- Error handling for 401 (unauthorized) responses

## Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      // Add your custom colors
    },
  },
}
```

### Status Colors

Status badge colors are defined in `src/App.jsx` in the `getStatusColor` function. Modify this to change status colors.

## Troubleshooting

1. **API connection errors**:
   - Ensure the backend is running at `http://localhost:8000`
   - Check CORS settings in backend
   - Verify API_BASE_URL in App.jsx

2. **Authentication issues**:
   - Clear localStorage: `localStorage.removeItem('jwt_token')`
   - Login again
   - Check that backend JWT settings are correct

3. **Build errors**:
   - Delete `node_modules` and `.vite` folders
   - Run `npm install` again
   - Check Node.js version (should be 18+)

4. **Styling issues**:
   - Ensure TailwindCSS is properly configured
   - Check that `index.css` imports Tailwind directives
   - Verify `tailwind.config.js` content paths

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lazy loading for large lists (can be added)
- Optimistic UI updates
- Efficient re-renders with React hooks

## Future Enhancements

Potential features to add:
- Pagination for large datasets
- Export to CSV/PDF
- Charts and statistics
- Email notifications
- Calendar view
- Dark mode

