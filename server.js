
import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT || 3001);

const MAX_CAPTURE_TIME_MS = Number(process.env.MAX_CAPTURE_TIME_MS || 45_000);
const CACHE_TTL_MS = Number(process.env.SCREENSHOT_CACHE_TTL_MS || 60_000);
const MAX_CACHE_ENTRIES = Number(process.env.SCREENSHOT_CACHE_SIZE || 30);

app.set('trust proxy', Number(process.env.TRUST_PROXY || 1));
app.disable('x-powered-by');

app.use('/api', (req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    next();
});

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

const corsOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors(corsOrigins.length ? { origin: corsOrigins } : { origin: false }));

app.use(rateLimit({
    windowMs: 60_000,
    limit: Number(process.env.RATE_LIMIT_PER_MIN || 300),
    standardHeaders: true,
    legacyHeaders: false
}));

const CAPTURE_CONCURRENCY = Math.max(
    1,
    Number(process.env.SCREENSHOT_CONCURRENCY || 3) // allow a few concurrent captures to cut queue wait
);

const pendingCaptures = [];
let activeCaptures = 0;
const screenshotCache = new Map();

const buildCacheKey = ({
    url,
    width,
    height,
    deviceScaleFactor,
    isMobile,
    hasTouch,
    userAgent,
    isFullPage
}) =>
    JSON.stringify({
        url,
        width,
        height,
        deviceScaleFactor,
        isMobile,
        hasTouch,
        userAgent: userAgent || '',
        isFullPage: Boolean(isFullPage)
    });

const MAX_URL_LENGTH = Number(process.env.MAX_URL_LENGTH || 2048);
const ALLOW_PRIVATE_URLS =
    process.env.ALLOW_PRIVATE_URLS === 'true' || process.env.NODE_ENV !== 'production';

const isPrivateIp = (ip) => {
    if (typeof ip !== 'string') return false;
    if (ip === '127.0.0.1' || ip === '0.0.0.0') return true;
    if (ip.startsWith('10.')) return true;
    if (ip.startsWith('192.168.')) return true;
    if (ip.startsWith('169.254.')) return true;
    const match172 = ip.match(/^172\.(\d+)\./);
    if (match172) {
        const second = Number(match172[1]);
        if (second >= 16 && second <= 31) return true;
    }
    return false;
};

const normalizeAndValidateTargetUrl = (rawUrl) => {
    if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
        return { ok: false, error: 'URL is required' };
    }
    if (rawUrl.length > MAX_URL_LENGTH) {
        return { ok: false, error: 'URL is too long' };
    }

    const candidate = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    let parsed;
    try {
        parsed = new URL(candidate);
    } catch {
        return { ok: false, error: 'Invalid URL' };
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { ok: false, error: 'Only http/https URLs are allowed' };
    }

    const hostname = (parsed.hostname || '').toLowerCase();
    if (!hostname) return { ok: false, error: 'Invalid URL host' };

    if (!ALLOW_PRIVATE_URLS) {
        if (
            hostname === 'localhost' ||
            hostname.endsWith('.localhost') ||
            hostname.endsWith('.local') ||
            hostname === '0.0.0.0' ||
            hostname === '127.0.0.1' ||
            hostname === '::1'
        ) {
            return { ok: false, error: 'Local URLs are not allowed' };
        }
        const isIpv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
        if (isIpv4 && isPrivateIp(hostname)) {
            return { ok: false, error: 'Private network URLs are not allowed' };
        }
    }

    return { ok: true, url: parsed.toString() };
};

const clampInt = (value, fallback, min, max) => {
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
};

const getCachedScreenshot = (key) => {
    if (!key || !screenshotCache.size) return null;
    const now = Date.now();
    const cached = screenshotCache.get(key);
    if (!cached) {
        return null;
    }
    if (cached.expiresAt <= now) {
        screenshotCache.delete(key);
        return null;
    }
    return cached.buffer;
};

const setCachedScreenshot = (key, buffer) => {
    if (!key || !buffer) return;
    const expiresAt = Date.now() + CACHE_TTL_MS;
    screenshotCache.set(key, { buffer, expiresAt });
    if (screenshotCache.size > MAX_CACHE_ENTRIES) {
        const oldestKey = screenshotCache.keys().next().value;
        if (oldestKey) {
            screenshotCache.delete(oldestKey);
        }
    }
};

const enqueueCapture = (task, timeoutMs = MAX_CAPTURE_TIME_MS) => {
    return new Promise((resolve, reject) => {
        const job = { task, resolve, reject };
        // Drop the job if it waits too long in the queue
        job._timer = setTimeout(() => {
            const idx = pendingCaptures.indexOf(job);
            if (idx !== -1) {
                pendingCaptures.splice(idx, 1);
            }
            reject(new Error('Capture queue timeout'));
        }, timeoutMs);
        pendingCaptures.push(job);
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

    if (nextJob._timer) {
        clearTimeout(nextJob._timer);
        delete nextJob._timer;
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

        // Basic SSRF hardening: prevent non-http(s) navigations and block obvious local URLs.
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const requestUrl = request.url();
            try {
                const parsed = new URL(requestUrl);
                if (!['http:', 'https:'].includes(parsed.protocol)) {
                    return request.abort();
                }
                if (!ALLOW_PRIVATE_URLS) {
                    const hostname = (parsed.hostname || '').toLowerCase();
                    if (
                        hostname === 'localhost' ||
                        hostname.endsWith('.localhost') ||
                        hostname.endsWith('.local') ||
                        hostname === '0.0.0.0' ||
                        hostname === '127.0.0.1' ||
                        hostname === '::1'
                    ) {
                        return request.abort();
                    }
                    const isIpv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
                    if (isIpv4 && isPrivateIp(hostname)) {
                        return request.abort();
                    }
                }
            } catch {
                return request.abort();
            }
            return request.continue();
        });

        await page.goto(targetUrl, {
            waitUntil: 'domcontentloaded', // grab as soon as DOM is ready
            timeout: 20000
        });

        // Quick settle; most pages render hero content by now
        await new Promise(r => setTimeout(r, 300));

        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 300;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight || totalHeight > 900) {
                        clearInterval(timer);
                        window.scrollTo(0, 0);
                        resolve();
                    }
                }, 100);
            });
        });

        await new Promise(r => setTimeout(r, 200));

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

const screenshotLimiter = rateLimit({
    windowMs: 60_000,
    limit: Number(process.env.SCREENSHOT_RATE_LIMIT_PER_MIN || 30),
    standardHeaders: true,
    legacyHeaders: false
});

app.get('/api/screenshot', screenshotLimiter, async (req, res) => {
    const { url, isMobile, hasTouch, userAgent } = req.query;

    const normalized = normalizeAndValidateTargetUrl(url);
    if (!normalized.ok) {
        return res.status(400).json({ error: normalized.error });
    }

    const viewportWidth = clampInt(req.query.width, 1280, 240, 2400);
    const viewportHeight = clampInt(req.query.height, 800, 240, 2400);
    const scaleFactor = clampInt(req.query.deviceScaleFactor, 1, 1, 3);
    const wantsMobile = isMobile === 'true';
    const wantsTouch = hasTouch === 'true';
    const isFullPage = req.query.fullPage === 'true';
    const cacheKey = buildCacheKey({
        url: normalized.url,
        width: viewportWidth,
        height: viewportHeight,
        deviceScaleFactor: scaleFactor,
        isMobile: wantsMobile,
        hasTouch: wantsTouch,
        userAgent,
        isFullPage
    });

    const cachedBuffer = getCachedScreenshot(cacheKey);
    if (cachedBuffer) {
        res.set('Content-Type', 'image/jpeg');
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('X-Screenshot-Cache', 'HIT');
        return res.send(cachedBuffer);
    }

    try {
        const screenshotBuffer = await enqueueCapture(() =>
            captureScreenshot({
                targetUrl: normalized.url,
                width: viewportWidth,
                height: viewportHeight,
                deviceScaleFactor: scaleFactor,
                isMobile: wantsMobile,
                hasTouch: wantsTouch,
                userAgent,
                isFullPage
            })
        );
        setCachedScreenshot(cacheKey, screenshotBuffer);

        res.set('Content-Type', 'image/jpeg');
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('X-Screenshot-Cache', 'MISS');
        res.send(screenshotBuffer);
    } catch (error) {
        console.error('Screenshot error:', error);
        res.status(500).json({ error: 'Failed to generate screenshot', details: error.message });
    }
});

app.get('/healthz', (req, res) => {
    res.status(200).json({ ok: true });
});

if (process.env.NODE_ENV === 'production') {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const distPath = path.join(__dirname, 'dist');

    app.use(express.static(distPath, { maxAge: '1h', index: false }));
    // Express v5 + path-to-regexp v6: use a RegExp for SPA fallback routes.
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}



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
