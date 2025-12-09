
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Increase timeout for serverless function
chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

export default async function handler(req, res) {
    const { url, width, height, isMobile, deviceScaleFactor, hasTouch, userAgent } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const targetUrl = url.startsWith('http') ? url : `https://${url}`;

    let browser = null;
    try {
        // Determine if we are running locally or on Vercel
        const isLocal = process.env.VERCEL_ENV === undefined;

        // Launch options for Vercel vs Local
        // Note: locally this file might fail if you don't have the executables linked, 
        // but the intention is to use server.js locally, and this file on Vercel.
        const executablePath = await chromium.executablePath();

        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: executablePath || '/usr/bin/google-chrome', // Fallback for some envs
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

        await page.goto(targetUrl, {
            waitUntil: 'networkidle0',
            timeout: 10000 // Vercel free tier limit is tight, keep it 10s or less safe
        });

        // Hide scrollbars
        await page.addStyleTag({ content: 'body { overflow: hidden !important; }' });

        const file = await page.screenshot({
            type: 'jpeg',
            quality: 80
        });

        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
        res.status(200).send(file);

    } catch (error) {
        console.error('Vercel Screenshot Error:', error);
        res.status(500).json({
            error: 'Failed to generate screenshot',
            details: error.message
        });
    } finally {
        if (browser) await browser.close();
    }
}
