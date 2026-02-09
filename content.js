(function() {
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
                // Invalid URL, skip
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
    
    // Send the extracted links back to the popup
    const links = extractLinks();
    return links;
})();
