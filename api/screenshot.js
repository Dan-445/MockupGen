
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Increase timeout for serverless function
chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

export const config = {
    maxDuration: 60, // Attempt to set longer timeout (only works on Pro, but good to have)
};

export default async function handler(req, res) {
    const { url, isMobile, hasTouch, userAgent } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const MAX_URL_LENGTH = Number(process.env.MAX_URL_LENGTH || 2048);
    const ALLOW_PRIVATE_URLS = process.env.ALLOW_PRIVATE_URLS === 'true';

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

    const normalized = normalizeAndValidateTargetUrl(url);
    if (!normalized.ok) {
        return res.status(400).json({ error: normalized.error });
    }

    const viewportWidth = clampInt(req.query.width, 1280, 240, 2400);
    const viewportHeight = clampInt(req.query.height, 800, 240, 2400);
    const scaleFactor = clampInt(req.query.deviceScaleFactor, 1, 1, 3);

    const targetUrl = normalized.url;

    let browser = null;
    try {
        const executablePath = await chromium.executablePath();

        browser = await puppeteer.launch({
            args: [...chromium.args, '--hide-scrollbars'],
            defaultViewport: chromium.defaultViewport,
            executablePath: executablePath || '/usr/bin/google-chrome',
            headless: chromium.headless,
        });

        const page = await browser.newPage();

        await page.setViewport({
            width: viewportWidth,
            height: viewportHeight,
            deviceScaleFactor: scaleFactor,
            isMobile: isMobile === 'true',
            hasTouch: hasTouch === 'true'
        });

        if (userAgent) {
            await page.setUserAgent(userAgent);
        }

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
