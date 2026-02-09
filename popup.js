class URListPopup {
    constructor() {
        this.allLinks = [];
        this.filteredLinks = [];
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadLinks();
    }
    
    bindEvents() {
        document.getElementById('search').addEventListener('input', () => this.filterLinks());
        document.getElementById('remove-duplicates').addEventListener('change', () => this.filterLinks());
        document.getElementById('unique-domains').addEventListener('change', () => this.filterLinks());
        document.getElementById('include-non-http').addEventListener('change', () => this.filterLinks());
        document.getElementById('export-csv').addEventListener('click', () => this.exportCSV());
        document.getElementById('export-txt').addEventListener('click', () => this.exportTXT());
        document.getElementById('open-tab').addEventListener('click', () => this.openInTab());
        document.getElementById('refresh').addEventListener('click', () => this.loadLinks());
    }
    
    async loadLinks() {
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        const linksList = document.getElementById('links-list');
        
        loading.style.display = 'block';
        error.style.display = 'none';
        linksList.innerHTML = '';
        
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                throw new Error('Cannot extract links from Chrome pages');
            }
            
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    function extractLinks() {
                        const links = document.querySelectorAll('a[href]');
                        const extractedLinks = [];
                        
                        links.forEach(link => {
                            const href = link.getAttribute('href');
                            if (!href) return;
                            
                            // Convert relative URLs to absolute URLs
                            let absoluteUrl;
                            try {
                                absoluteUrl = new URL(href, window.location.href).href;
                            } catch (e) {
                                return;
                            }
                            
                            // Get title priority: innerText > title attribute > (no title)
                            let title = link.innerText.trim();
                            if (!title) {
                                title = link.getAttribute('title') || '';
                                title = title.trim();
                            }
                            if (!title) {
                                title = '(no title)';
                            }
                            
                            extractedLinks.push({
                                title: title,
                                url: absoluteUrl,
                                domain: new URL(absoluteUrl).hostname
                            });
                        });
                        
                        return extractedLinks;
                    }
                    
                    return extractLinks();
                }
            });
            
            this.allLinks = results[0].result || [];
            this.filterLinks();
            
        } catch (err) {
            loading.style.display = 'none';
            error.style.display = 'block';
            error.textContent = `Error: ${err.message}`;
        }
    }
    
    filterLinks() {
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const removeDuplicates = document.getElementById('remove-duplicates').checked;
        const uniqueDomains = document.getElementById('unique-domains').checked;
        const includeNonHttp = document.getElementById('include-non-http').checked;
        
        let filtered = [...this.allLinks];
        
        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(link => 
                link.title.toLowerCase().includes(searchTerm) || 
                link.url.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filter non-HTTP links
        if (!includeNonHttp) {
            filtered = filtered.filter(link => 
                link.url.startsWith('http://') || link.url.startsWith('https://')
            );
        }
        
        // Remove duplicates
        if (removeDuplicates) {
            const seen = new Set();
            filtered = filtered.filter(link => {
                if (seen.has(link.url)) {
                    return false;
                }
                seen.add(link.url);
                return true;
            });
        }
        
        // Show unique domains only
        if (uniqueDomains) {
            const seenDomains = new Set();
            filtered = filtered.filter(link => {
                if (seenDomains.has(link.domain)) {
                    return false;
                }
                seenDomains.add(link.domain);
                return true;
            });
        }
        
        this.filteredLinks = filtered;
        this.renderLinks();
    }
    
    renderLinks() {
        const loading = document.getElementById('loading');
        const linksList = document.getElementById('links-list');
        const linkCount = document.getElementById('link-count');
        
        loading.style.display = 'none';
        
        linkCount.textContent = `${this.filteredLinks.length} link${this.filteredLinks.length !== 1 ? 's' : ''} found`;
        
        if (this.filteredLinks.length === 0) {
            linksList.innerHTML = '<div class="no-results">No links found</div>';
            return;
        }
        
        linksList.innerHTML = this.filteredLinks.map(link => `
            <div class="link-item">
                <div class="link-title">${this.escapeHtml(link.title)}</div>
                <a href="${this.escapeHtml(link.url)}" target="_blank" class="link-url">${this.escapeHtml(link.url)}</a>
            </div>
        `).join('');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    openInTab() {
        if (this.filteredLinks.length === 0) return;
        
        // Create HTML content for the new tab
        const html = this.generateTabHTML();
        
        // Create a blob URL and open it in a new tab
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        chrome.tabs.create({ url: url });
        
        // Clean up the blob URL after a short delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    
    generateTabHTML() {
        const pageTitle = `URList - ${this.filteredLinks.length} Links`;
        
        const linksHTML = this.filteredLinks.map(link => 
            '<div class="link-item"><div class="link-title">' + this.escapeHtml(link.title) + 
            '</div><a href="' + this.escapeHtml(link.url) + 
            '" target="_blank" class="link-url">' + this.escapeHtml(link.url) + '</a></div>'
        ).join('');
        
        // Generate CSV content
        const csvContent = 'title,url\n' + this.filteredLinks.map(link => 
            '"' + this.escapeCsv(link.title) + '","' + this.escapeCsv(link.url) + '"'
        ).join('\n');
        
        // Generate TXT content
        const txtContent = this.filteredLinks.map(link => 
            link.title + ' - ' + link.url
        ).join('\n');
        
        const css = '*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:1.4;color:#333;background:#fff;max-width:1200px;margin:0 auto;padding:20px}header{padding:20px 0;border-bottom:2px solid #e0e0e0;margin-bottom:20px}h1{font-size:24px;font-weight:600;color:#2c3e50;margin-bottom:8px}.stats{font-size:16px;color:#666}.controls{margin-bottom:20px;padding:20px;background:#f8f9fa;border-radius:8px}.search-box{width:100%;max-width:400px;padding:10px 15px;border:1px solid #ddd;border-radius:4px;font-size:16px;margin-bottom:15px}.search-box:focus{outline:none;border-color:#4a90e2;box-shadow:0 0 0 2px rgba(74,144,226,0.2)}.toggles{display:flex;flex-wrap:wrap;gap:15px}.toggle{display:flex;align-items:center;cursor:pointer;font-size:14px}.toggle input[type="checkbox"]{margin-right:8px;transform:scale(1.2)}.actions{margin-bottom:20px;display:flex;gap:10px;flex-wrap:wrap}.btn{padding:10px 20px;border:none;border-radius:4px;font-size:14px;cursor:pointer;transition:background-color .2s;text-decoration:none;display:inline-block}.btn-primary{background:#4a90e2;color:#fff}.btn-primary:hover{background:#357abd}.btn-secondary{background:#f0f0f0;color:#333;border:1px solid #ddd}.btn-secondary:hover{background:#e0e0e0}.links-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(400px,1fr));gap:15px}.link-item{padding:15px;border:1px solid #e0e0e0;border-radius:8px;background:#fafafa;transition:all .2s}.link-item:hover{background:#f0f8ff;transform:translateY(-2px);box-shadow:0 4px 8px rgba(0,0,0,0.1)}.link-title{font-weight:500;color:#333;margin-bottom:6px;word-break:break-word}.link-url{font-size:13px;color:#4a90e2;text-decoration:none;word-break:break-all}.link-url:hover{text-decoration:underline}.no-results{text-align:center;padding:40px;color:#666;font-style:italic}.notice{background:#fff3cd;border:1px solid #ffeaa7;border-radius:4px;padding:15px;margin-bottom:20px;color:#856404}';
        
        const date = new Date().toISOString().split('T')[0];
        const csvFilename = 'links-' + date + '.csv';
        const txtFilename = 'links-' + date + '.txt';
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <style>${css}</style>
</head>
<body>
    <div class="container">
        <div class="notice">
            <strong>Note:</strong> Interactive filtering is not available in this tab view due to browser security restrictions. 
            Please use the extension popup for filtering functionality. This view shows all ${this.filteredLinks.length} extracted links.
        </div>
        
        <header>
            <h1>URList</h1>
            <div class="stats">
                <span>${this.filteredLinks.length} links found</span>
            </div>
        </header>
        
        <div class="actions">
            <a href="data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}" 
               download="${csvFilename}" 
               class="btn btn-primary">Export CSV</a>
            <a href="data:text/plain;charset=utf-8,${encodeURIComponent(txtContent)}" 
               download="${txtFilename}" 
               class="btn btn-secondary">Export TXT</a>
        </div>
        
        <div class="links-container">
            <div class="links-list">${linksHTML}</div>
        </div>
    </div>
</body>
</html>`;
    }
    
    generateTabJS(allLinksData) {
        return `console.log('URList Tab JavaScript loading...');
window.allLinks = ${allLinksData};
console.log('Links data loaded:', window.allLinks.length, 'links');

class URListTab {
    constructor() {
        console.log('URListTab constructor called');
        this.allLinks = window.allLinks || [];
        this.filteredLinks = [...this.allLinks];
        console.log('Constructor: allLinks =', this.allLinks.length, 'links');
        this.init();
    }
    
    init() {
        console.log('URListTab init called');
        this.bindEvents();
        this.filterLinks();
    }
    
    bindEvents() {
        document.getElementById('search').addEventListener('input', () => this.filterLinks());
        document.getElementById('remove-duplicates').addEventListener('change', () => this.filterLinks());
        document.getElementById('unique-domains').addEventListener('change', () => this.filterLinks());
        document.getElementById('include-non-http').addEventListener('change', () => this.filterLinks());
        document.getElementById('export-csv').addEventListener('click', () => this.exportCSV());
        document.getElementById('export-txt').addEventListener('click', () => this.exportTXT());
        document.getElementById('refresh').addEventListener('click', () => this.refresh());
    }
    
    filterLinks() {
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const removeDuplicates = document.getElementById('remove-duplicates').checked;
        const uniqueDomains = document.getElementById('unique-domains').checked;
        const includeNonHttp = document.getElementById('include-non-http').checked;
        
        let filtered = [...this.allLinks];
        
        if (searchTerm) {
            filtered = filtered.filter(link => 
                link.title.toLowerCase().includes(searchTerm) || 
                link.url.toLowerCase().includes(searchTerm)
            );
        }
        
        if (!includeNonHttp) {
            filtered = filtered.filter(link => 
                link.url.startsWith('http://') || link.url.startsWith('https://')
            );
        }
        
        if (removeDuplicates) {
            const seen = new Set();
            filtered = filtered.filter(link => {
                if (seen.has(link.url)) {
                    return false;
                }
                seen.add(link.url);
                return true;
            });
        }
        
        if (uniqueDomains) {
            const seenDomains = new Set();
            filtered = filtered.filter(link => {
                if (seenDomains.has(link.domain)) {
                    return false;
                }
                seenDomains.add(link.domain);
                return true;
            });
        }
        
        this.filteredLinks = filtered;
        this.renderLinks();
    }
    
    renderLinks() {
        const linksList = document.getElementById('links-list');
        const linkCount = document.getElementById('link-count');
        
        linkCount.textContent = \`\${this.filteredLinks.length} link\${this.filteredLinks.length !== 1 ? 's' : ''} found\`;
        
        if (this.filteredLinks.length === 0) {
            linksList.innerHTML = '<div class="no-results">No links found</div>';
            return;
        }
        
        linksList.innerHTML = this.filteredLinks.map(link => 
            \`<div class="link-item">
                <div class="link-title">\${this.escapeHtml(link.title)}</div>
                <a href="\${this.escapeHtml(link.url)}" target="_blank" class="link-url">\${this.escapeHtml(link.url)}</a>
            </div>\`
        ).join('');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    exportCSV() {
        if (this.filteredLinks.length === 0) return;
        
        const date = new Date().toISOString().split('T')[0];
        const filename = \`links-\${date}.csv\`;
        
        let csv = 'title,url\\n';
        this.filteredLinks.forEach(link => {
            csv += \`"\${this.escapeCsv(link.title)}","\${this.escapeCsv(link.url)}"\\n\`;
        });
        
        this.downloadFile(csv, filename, 'text/csv');
    }
    
    exportTXT() {
        if (this.filteredLinks.length === 0) return;
        
        const date = new Date().toISOString().split('T')[0];
        const filename = \`links-\${date}.txt\`;
        
        let txt = '';
        this.filteredLinks.forEach(link => {
            txt += \`\${link.title} - \${link.url}\\n\`;
        });
        
        this.downloadFile(txt, filename, 'text/plain');
    }
    
    escapeCsv(text) {
        return text.replace(/"/g, '""');
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    refresh() {
        alert('Refresh functionality is only available in the extension popup. Please reopen the extension to refresh the links.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired, creating URListTab');
    new URListTab();
});`;
    }
    
    async exportCSV() {
        if (this.filteredLinks.length === 0) return;
        
        const hostname = new URL(window.location.href).hostname;
        const date = new Date().toISOString().split('T')[0];
        const filename = `links-${hostname}-${date}.csv`;
        
        let csv = 'title,url\n';
        this.filteredLinks.forEach(link => {
            csv += `"${this.escapeCsv(link.title)}","${this.escapeCsv(link.url)}"\n`;
        });
        
        this.downloadFile(csv, filename, 'text/csv');
    }
    
    async exportTXT() {
        if (this.filteredLinks.length === 0) return;
        
        const hostname = new URL(window.location.href).hostname;
        const date = new Date().toISOString().split('T')[0];
        const filename = `links-${hostname}-${date}.txt`;
        
        let txt = '';
        this.filteredLinks.forEach(link => {
            txt += `${link.title} - ${link.url}\n`;
        });
        
        this.downloadFile(txt, filename, 'text/plain');
    }
    
    escapeCsv(text) {
        return text.replace(/"/g, '""');
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new URListPopup();
});
