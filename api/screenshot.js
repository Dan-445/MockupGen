
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Increase timeout for serverless function
chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

export const config = {
    maxDuration: 60, // Attempt to set longer timeout (only works on Pro, but good to have)
};

export default async function handler(req, res) {
    const { url, width, height, isMobile, deviceScaleFactor, hasTouch, userAgent } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const targetUrl = url.startsWith('http') ? url : `https://${url}`;

    let browser = null;
    try {
        const executablePath = await chromium.executablePath();

        browser = await puppeteer.launch({
            args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
            defaultViewport: chromium.defaultViewport,
            executablePath: executablePath || '/usr/bin/google-chrome',
            headless: chromium.headless,
        });

        const page = await browser.newPage();

        await page.setViewport({
            width: parseInt(width) || 1280,
            height: parseInt(height) || 800,
            deviceScaleFactor: parseInt(deviceScaleFactor) || 1,
            isMobile: isMobile === 'true',
            hasTouch: hasTouch === 'true'
        });

        if (userAgent) {
            await page.setUserAgent(userAgent);
        }

        // Optimize for speed: block fonts/images if not needed? No we need them.
        // But we can switch to networkidle2 which allows 2 active connections (e.g. tracking scripts)
        // This is much faster than networkidle0
        await page.goto(targetUrl, {
            waitUntil: 'networkidle2',
            timeout: 9000 // Set to 9s to fail gracefully before Vercel 10s hard timeout
        });

        // Hide scrollbars via CSS
        await page.addStyleTag({ content: 'body { overflow: hidden !important; }' });

        const file = await page.screenshot({
            type: 'jpeg',
            quality: 80
        });

        res.setHeader('Content-Type', 'image/jpeg');
        // Cache for 1 day, stale for 1 day
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=86400');
        res.status(200).send(file);

    } catch (error) {
        console.error('Vercel Screenshot Error:', error);

        // Return a JSON error that the frontend can handle nicely
        res.status(500).json({
            error: 'Failed to generate screenshot',
            details: error.message,
            hint: 'The page might be too slow for Vercel Serverless (10s limit).'
        });
    } finally {
        if (browser) await browser.close();
    }
}
