# Chrome Extension - Job Application Tracker

A Chrome extension that automatically detects job applications on LinkedIn, Indeed, and other job sites, and allows manual entry of applications.

## Features

- ✅ Automatic job detection on LinkedIn and Indeed
- ✅ Manual job application entry via popup
- ✅ React-based popup UI
- ✅ JWT authentication
- ✅ Manifest V3 compliant

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Chrome browser

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build the extension**
   ```bash
   npm run build
   ```

   This will create a `dist` folder with the compiled extension files.

3. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this directory

## Development

For development with hot reload:

```bash
npm run dev
```

This will watch for changes and rebuild automatically.

## Configuration

The extension is configured to connect to the backend API at `http://localhost:8000`. To change this:

1. Edit `src/popup/App.jsx` and update the `API_BASE_URL` constant.

## Usage

### Automatic Detection

1. Navigate to a job posting on LinkedIn or Indeed
2. Click the extension icon
3. The popup will automatically fill in job title, company, and location if detected
4. Review and add any missing information
5. Click "Save Application"

### Manual Entry

1. Click the extension icon on any page
2. Fill in the job application form
3. Click "Save Application"

### Login

1. Click the extension icon
2. Enter your username and password (from the backend)
3. The token will be stored locally in Chrome storage

## Supported Sites

Currently supports automatic detection on:
- LinkedIn (`linkedin.com`)
- Indeed (`indeed.com`)

The extension can still be used manually on any website.

## File Structure

```
extension/
├── manifest.json          # Extension manifest (Manifest V3)
├── background.js          # Service worker
├── content.js            # Content script for job detection
├── src/
│   └── popup/            # React popup UI
│       ├── index.html
│       ├── main.jsx
│       ├── App.jsx
│       └── styles.css
├── dist/                 # Built extension (generated)
└── package.json
```

## How It Works

1. **Content Script** (`content.js`): Injected into LinkedIn and Indeed pages to detect job information from the DOM.

2. **Popup** (`src/popup/App.jsx`): React-based UI that:
   - Communicates with content script to get job info
   - Allows manual entry
   - Sends data to backend API
   - Manages authentication

3. **Background Service Worker** (`background.js`): Handles extension lifecycle and message routing.

## Permissions

The extension requires:
- `storage` - To store JWT tokens
- `activeTab` - To access current tab URL
- `scripting` - To inject content scripts
- `host_permissions` - To make API requests

## Troubleshooting

1. **Extension not detecting job info**: 
   - Make sure you're on a job posting page (not search results)
   - Wait a few seconds for the page to fully load
   - Check browser console for errors

2. **API connection errors**:
   - Ensure the backend is running at `http://localhost:8000`
   - Check CORS settings in backend
   - Verify you're logged in

3. **Build errors**:
   - Delete `node_modules` and `dist` folders
   - Run `npm install` again
   - Run `npm run build`

## Adding Support for More Sites

To add support for additional job sites:

1. Edit `content.js`
2. Add a new detection function (e.g., `detectNewSiteJob()`)
3. Add the site's hostname to the detection logic
4. Add the site's URL pattern to `manifest.json` content_scripts matches

Example:
```javascript
function detectNewSiteJob() {
  const titleElement = document.querySelector('.job-title-selector');
  if (titleElement) {
    jobInfo.job_title = titleElement.textContent.trim();
  }
  // ... more detection logic
}
```

## Icons

Place extension icons in the `icons/` directory:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

You can create these using any image editor or online icon generator.

## Security Notes

- JWT tokens are stored in Chrome's local storage
- Tokens are sent with every API request
- Make sure to use HTTPS in production
- Never commit tokens or sensitive data to version control

