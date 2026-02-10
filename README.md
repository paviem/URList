# URList - Chrome Extension

A Chrome extension that extracts all URLs from the current webpage and displays them in a clean, searchable interface with export functionality.

## Features

- **Extract all links**: Scans the current page for all `<a href>` elements
- **Smart title extraction**: Prioritizes visible text, falls back to title attribute
- **Search functionality**: Filter links by title or URL
- **Duplicate removal**: Option to remove duplicate URLs
- **Unique domains**: Option to show only one link per domain
- **Export options**: Export as CSV or TXT files
- **Clean UI**: Modern, responsive interface
- **Relative URL conversion**: Automatically converts relative URLs to absolute

## Screenshots

<img width="390" height="301" alt="Screenshot 2026-02-10 at 4 28 31 AM" src="https://github.com/user-attachments/assets/8f21ef62-4f0f-42bf-b9db-2c80a832cf87" />

<img width="1173" height="775" alt="Screenshot 2026-02-10 at 4 34 21 AM" src="https://github.com/user-attachments/assets/84cc5d78-6da0-419f-bc6a-24ad5d5e9e6d" />

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The URList extension will appear in your extensions list

## Usage

1. Navigate to any webpage
2. Click the URList extension icon in your toolbar
3. The popup will open and automatically extract all links from the current page
4. Use the search box to filter results
5. Toggle options to customize the display:
   - **Remove duplicates**: Hide duplicate URLs
   - **Show unique domains only**: Show only one link per domain
   - **Include mailto/tel/javascript**: Include non-HTTP links
6. Export results using the CSV or TXT buttons

## File Structure

```
urlist-extension/
├── manifest.json       # Extension manifest (Manifest V3)
├── popup.html          # Popup interface HTML
├── popup.css           # Popup styling
├── popup.js            # Main popup logic
├── content.js          # Content script for link extraction
└── README.md           # This file
```

## Technical Details

- **Manifest V3**: Uses the latest Chrome extension manifest
- **Content Script Injection**: Uses `chrome.scripting.executeScript` to extract links
- **URL Conversion**: Converts relative URLs to absolute using `new URL()`
- **Export Functionality**: Generates downloadable files using Blob API
- **Error Handling**: Gracefully handles Chrome pages and extraction errors

## Permissions

- `activeTab`: Access the current active tab
- `scripting`: Inject scripts to extract links
- `downloads`: Handle file downloads
- `<all_urls>`: Work on all websites

## Browser Compatibility

- Chrome 88+ (Manifest V3 support)
- Edge 88+ (Chromium-based)

## License

MIT License
