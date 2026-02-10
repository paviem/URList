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

<img width="401" height="312" alt="Screenshot 2026-02-10 at 4 17 05 AM" src="https://github.com/user-attachments/assets/5be1f94b-b7ad-4412-b2fe-993b4f01cee8" />

<img width="1320" height="784" alt="Screenshot 2026-02-10 at 4 18 18 AM" src="https://github.com/user-attachments/assets/0170f0b6-12c1-4c22-9e8c-0c4df5fd71ce" />

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
