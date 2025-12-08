
const https = require('https');

const targetUrl = 'https://sportex-lac.vercel.app/';
const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}&prerender=true&meta=false&data.html.selector=html&data.html.attr=outerHTML`;

console.log('Fetching from:', microlinkUrl);

https.get(microlinkUrl, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.status === 'fail' || !json.data || !json.data.html) {
                console.log('Microlink failed:', json);
                return;
            }
            const html = json.data.html;
            console.log('HTML Length:', html.length);

            // Primitive parsing checks since we don't have DOMParser in Node
            const hasNav = html.includes('<nav');
            const hasHeader = html.includes('<header');
            const linkCount = (html.match(/<a\s/g) || []).length;

            console.log('Has <nav>:', hasNav);
            console.log('Has <header>:', hasHeader);
            console.log('Total <a> tags:', linkCount);

            // Check if nav has links
            if (hasNav) {
                const navContent = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/);
                if (navContent) {
                    const navLinks = (navContent[1].match(/<a\s/g) || []).length;
                    console.log('Links inside <nav>:', navLinks);
                    console.log('Nav content preview:', navContent[1].substring(0, 200));
                }
            }

            // Check for other common containers
            const linksWithText = [];
            const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/g;
            let match;
            while ((match = linkRegex.exec(html)) !== null) {
                const href = match[1];
                const text = match[2].replace(/<[^>]+>/g, '').trim(); // strip tags
                if (href && text && !href.startsWith('#') && !href.startsWith('java')) {
                    linksWithText.push({ text, href });
                }
            }
            console.log('Found valid links (sample):', linksWithText.slice(0, 10));

        } catch (e) {
            console.error('Error:', e);
        }
    });
}).on('error', e => console.error(e));
