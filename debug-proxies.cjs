
const https = require('https');

const target = 'https://sportex-lac.vercel.app/';

const proxies = [
    { name: 'corsproxy.io', url: 'https://corsproxy.io/?' + encodeURIComponent(target) },
    { name: 'codetabs', url: 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(target) }
];

proxies.forEach(proxy => {
    console.log(`Testing ${proxy.name}...`);
    https.get(proxy.url, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log(`[${proxy.name}] Status: ${res.statusCode}`);
            console.log(`[${proxy.name}] Length: ${data.length}`);
            console.log(`[${proxy.name}] Preview: ${data.substring(0, 200).replace(/\n/g, ' ')}`);
        });
    }).on('error', e => console.log(`[${proxy.name}] Error: ${e.message}`));
});
