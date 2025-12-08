
const fetch = require('node-fetch'); // actually standard fetch is available in Node 18+, but let's see. 
// If node < 18, we might have issues. using https module is safer if no dependencies.
const https = require('https');

const url = 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://sportex-lac.vercel.app/');

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("Status Code:", json.status ? json.status.http_code : 'unknown');
            console.log("Content Length:", json.contents ? json.contents.length : 0);
            if (json.contents) {
                console.log("--- HTML CONTENT PREVIEW ---");
                console.log(json.contents.substring(0, 1000));
                console.log("--- HTML CONTENT END ---");
            } else {
                console.log("No contents found in response");
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
            console.log("Raw Data:", data);
        }
    });
}).on('error', (err) => {
    console.error("Error fetching:", err.message);
});
