
import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());

const CAPTURE_CONCURRENCY = Math.max(
    1,
    Number(process.env.SCREENSHOT_CONCURRENCY || 1)
);

const pendingCaptures = [];
let activeCaptures = 0;

const enqueueCapture = (task) => {
    return new Promise((resolve, reject) => {
        pendingCaptures.push({ task, resolve, reject });
        runCaptureQueue();
    });
};

const runCaptureQueue = () => {
    if (activeCaptures >= CAPTURE_CONCURRENCY) {
        return;
    }

    const nextJob = pendingCaptures.shift();
    if (!nextJob) {
        return;
    }

    activeCaptures += 1;
    nextJob
        .task()
        .then(nextJob.resolve, nextJob.reject)
        .finally(() => {
            activeCaptures -= 1;
            runCaptureQueue();
        });
};

let browserPromise = null;

const launchBrowser = async () => {
    if (!browserPromise) {
        browserPromise = puppeteer
            .launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            })
            .catch((err) => {
                browserPromise = null;
                throw err;
            });
    }
    return browserPromise;
};

const closeBrowser = async () => {
    if (!browserPromise) return;
    try {
        const browser = await browserPromise;
        await browser.close();
    } catch (closeError) {
        console.warn('Error closing browser instance', closeError);
    } finally {
        browserPromise = null;
    }
};

const shouldResetBrowser = (error) => {
    const message = error?.message || '';
    return /Target closed|browser has disconnected|Session closed/i.test(message);
};

const captureScreenshot = async ({
    targetUrl,
    width,
    height,
    deviceScaleFactor,
    isMobile,
    hasTouch,
    userAgent,
    isFullPage
}) => {
    const browser = await launchBrowser();
    const page = await browser.newPage();
    try {
        console.log(`[Local] Taking screenshot of: ${targetUrl}`);

        await page.setViewport({
            width,
            height,
            deviceScaleFactor,
            isMobile,
            hasTouch
        });

        if (userAgent) {
            await page.setUserAgent(userAgent);
        }

        await page.goto(targetUrl, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        await new Promise(r => setTimeout(r, 2000));

        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight || totalHeight > 2000) {
                        clearInterval(timer);
                        window.scrollTo(0, 0);
                        resolve();
                    }
                }, 100);
            });
        });

        await new Promise(r => setTimeout(r, 1000));

        await page.addStyleTag({ content: 'body { overflow: hidden !important; }' });

        return await page.screenshot({
            type: 'jpeg',
            quality: 80,
            fullPage: isFullPage
        });
    } catch (error) {
        if (shouldResetBrowser(error)) {
            await closeBrowser();
        }
        throw error;
    } finally {
        try {
            await page.close();
        } catch (pageCloseError) {
            console.warn('Failed to close page cleanly', pageCloseError);
        }
    }
};

app.get('/api/screenshot', async (req, res) => {
    let { url, width, height, isMobile, deviceScaleFactor, hasTouch, userAgent } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    if (!url.startsWith('http')) {
        url = 'https://' + url;
    }

    const viewportWidth = parseInt(width, 10) || 1280;
    const viewportHeight = parseInt(height, 10) || 800;
    const scaleFactor = parseInt(deviceScaleFactor, 10) || 1;
    const wantsMobile = isMobile === 'true';
    const wantsTouch = hasTouch === 'true';
    const isFullPage = req.query.fullPage === 'true';

    try {
        const screenshotBuffer = await enqueueCapture(() =>
            captureScreenshot({
                targetUrl: url,
                width: viewportWidth,
                height: viewportHeight,
                deviceScaleFactor: scaleFactor,
                isMobile: wantsMobile,
                hasTouch: wantsTouch,
                userAgent,
                isFullPage
            })
        );

        res.set('Content-Type', 'image/jpeg');
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.send(screenshotBuffer);
    } catch (error) {
        console.error('Screenshot error:', error);
        res.status(500).json({ error: 'Failed to generate screenshot', details: error.message });
    }
});



const gracefulShutdown = async (signal) => {
    if (signal) {
        console.log(`Received ${signal}. Shutting down screenshot browser...`);
    }
    await closeBrowser();
    if (signal) {
        process.exit(0);
    }
};

process.once('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('exit', () => {
    if (browserPromise) {
        closeBrowser().catch(() => { });
    }
});

const server = app.listen(port, () => {
    console.log(`Screenshot server running at http://localhost:${port}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Error: Port ${port} is already in use.`);
    } else {
        console.error('Server error:', err);
    }
});


