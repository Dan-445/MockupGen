
import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());

app.get('/api/screenshot', async (req, res) => {
    let { url, width, height, isMobile, deviceScaleFactor, hasTouch, userAgent } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // Add protocol if missing
    if (!url.startsWith('http')) {
        url = 'https://' + url;
    }

    let browser = null;
    try {
        console.log(`[Local] Taking screenshot of: ${url}`);

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Set viewport
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

        await page.goto(url, {
            waitUntil: 'networkidle0', // Wait for network to be idle (better for SPA)
            timeout: 60000 // Increase to 60s
        });

        // Add extra delay for React hydration/animations
        await new Promise(r => setTimeout(r, 2000));

        // Scroll down and back up to trigger lazy loading
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight || totalHeight > 2000) { // Limit scroll depth
                        clearInterval(timer);
                        window.scrollTo(0, 0); // Scroll back top
                        resolve();
                    }
                }, 100);
            });
        });

        // Wait a bit more after scroll
        await new Promise(r => setTimeout(r, 1000));

        // Remove scrollbars for cleaner shot
        await page.addStyleTag({ content: 'body { overflow: hidden !important; }' });

        const isFullPage = req.query.fullPage === 'true';

        const screenshotBuffer = await page.screenshot({
            type: 'jpeg',
            quality: 80,
            fullPage: isFullPage
        });

        res.set('Content-Type', 'image/jpeg');
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate'); // Disable cache
        res.send(screenshotBuffer);

    } catch (error) {
        console.error('Screenshot error:', error);
        res.status(500).json({ error: 'Failed to generate screenshot', details: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(port, () => {
    console.log(`Screenshot server running at http://localhost:${port}`);
});
