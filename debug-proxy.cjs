
const https = require('https');

const userUrl = 'https://sportex-lac.vercel.app/';
const url = 'https://api.allorigins.win/get?url=' + encodeURIComponent(userUrl);

console.log('Fetching:', url);

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("Status Code:", json.status ? json.status.http_code : 'unknown');
            console.log("Contents Type:", typeof json.contents);
            console.log("Content Length:", json.contents ? json.contents.length : 0);

            if (json.contents) {
                console.log("--- HTML PREVIEW (First 2000 chars) ---");
                console.log(json.contents.substring(0, 2000));
                console.log("--- HTML END ---");

                // Simple regex check for headers/nav
                const lower = json.contents.toLowerCase();
                console.log("Has <nav>:", lower.includes('<nav'));
                console.log("Has <header>:", lower.includes('<header'));
                console.log("Match <a> tags:", (lower.match(/<a\s/g) || []).length);
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
            console.log("Raw Data:", data.substring(0, 500));
        }
    });
}).on('error', (err) => {
    console.error("Error fetching:", err.message);
});
