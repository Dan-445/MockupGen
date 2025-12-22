import React, { useRef } from 'react';
import { DeviceFrame } from './DeviceFrame';
import { Download, Share2, ZoomIn, Check, Sparkles } from 'lucide-react';
import JSZip from 'jszip';
import { toPng } from 'html-to-image';

const SOLID_COLOR_GRID = [
    '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e',
    '#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#f97316', '#ea580c', '#c2410c', '#9a3412',
    '#fef9c3', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207', '#854d0e',
    '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d',
    '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985',
    '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af',
    '#e0f2f1', '#b2f5ea', '#81e6d9', '#4fd1c5', '#38b2ac', '#319795', '#2c7a7b', '#285e61',
    '#ecfccb', '#d9f99d', '#bef264', '#a3e635', '#84cc16', '#65a30d', '#4d7c0f', '#3f6212',
    '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534',
    '#f1f5f9', '#e2e8f0', '#cbd5f5', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b'
];

const GRADIENT_BACKGROUNDS = [
    { id: 'sunrise', label: 'Sunrise', from: '#fbd3e9', to: '#bb377d' },
    { id: 'sherbet', label: 'Sherbet', from: '#fbc2eb', to: '#a6c1ee' },
    { id: 'tangerine', label: 'Tangerine', from: '#f6d365', to: '#fda085' },
    { id: 'candy', label: 'Candy', from: '#f7797d', to: '#FBD786' },
    { id: 'aurora', label: 'Aurora', from: '#a7ffeb', to: '#17ead9' },
    { id: 'ocean', label: 'Ocean', from: '#99f2c8', to: '#1f4037' },
    { id: 'reef', label: 'Reef', from: '#4facfe', to: '#00f2fe' },
    { id: 'lagoon', label: 'Lagoon', from: '#43cea2', to: '#185a9d' },
    { id: 'skyline', label: 'Skyline', from: '#e0c3fc', to: '#8ec5fc' },
    { id: 'midnight', label: 'Midnight', from: '#1e3c72', to: '#2a5298' },
    { id: 'royal', label: 'Royal', from: '#654ea3', to: '#eaafc8' },
    { id: 'velvet', label: 'Velvet', from: '#141e30', to: '#243b55' },
    { id: 'emberglow', label: 'Ember Glow', from: '#f83600', to: '#fe8c00' },
    { id: 'blush', label: 'Blush', from: '#ff9a9e', to: '#fad0c4' },
    { id: 'mint', label: 'Mint', from: '#c1dfc4', to: '#deecdd' },
    { id: 'sapphire', label: 'Sapphire', from: '#09203f', to: '#537895' },
    { id: 'sunray', label: 'Sunray', from: '#fceabb', to: '#f8b500' },
    { id: 'nebula', label: 'Nebula', from: '#5f72bd', to: '#9b23ea' },
    { id: 'copper', label: 'Copper', from: '#d66d75', to: '#e29587' },
    { id: 'forest', label: 'Forest', from: '#5A3F37', to: '#2C7744' },
    { id: 'berry', label: 'Berry', from: '#A73737', to: '#7A2828' },
    { id: 'polar', label: 'Polar', from: '#d7d2cc', to: '#304352' },
    { id: 'prism', label: 'Prism', from: '#00C9FF', to: '#92FE9D' },
    { id: 'cosmo', label: 'Cosmo', from: '#ffd194', to: '#70e1f5' },
    { id: 'citrus', label: 'Citrus', from: '#FDEB71', to: '#F8D800' },
    { id: 'sunset', label: 'Sunset', from: '#ee9ca7', to: '#ffdde1' },
    { id: 'lilac', label: 'Lilac', from: '#a18cd1', to: '#fbc2eb' },
    { id: 'tide', label: 'Tide', from: '#209cff', to: '#68e0cf' },
    { id: 'ember', label: 'Amber Ember', from: '#f83600', to: '#f9d423' },
    { id: 'blossom', label: 'Blossom', from: '#f68084', to: '#a6c0fe' },
    { id: 'camo', label: 'Camouflage', from: '#134E5E', to: '#71B280' },
    { id: 'midday', label: 'Midday', from: '#96deda', to: '#50c9c3' },
    // New Additions
    { id: 'astral', label: 'Astral', from: '#667db6', to: '#0082c8' },
    { id: 'titanium', label: 'Titanium', from: '#283048', to: '#859398' },
    { id: 'flamingo', label: 'Flamingo', from: '#ff9a9e', to: '#fecfef' },
    { id: 'juicy', label: 'Juicy', from: '#84fab0', to: '#8fd3f4' },
    { id: 'haze', label: 'Purple Haze', from: '#7303c0', to: '#ec38bc' },
    { id: 'mojito', label: 'Mojito', from: '#1d976c', to: '#93f9b9' },
    { id: 'cherry', label: 'Cherry', from: '#eb3349', to: '#f45c43' },
    { id: 'frost', label: 'Frost', from: '#004e92', to: '#000428' },
    { id: 'mauve', label: 'Mauve', from: '#42275a', to: '#734b6d' },
    { id: 'coffee', label: 'Coffee', from: '#c04848', to: '#480048' },
    { id: 'slate', label: 'Slate', from: '#434343', to: '#000000' },
    { id: 'dracula', label: 'Dracula', from: '#283c86', to: '#45a247' },
    { id: 'mantle', label: 'Mantle', from: '#24c6dc', to: '#514a9d' },
    { id: 'shimmer', label: 'Shimmer', from: '#ff6e7f', to: '#bfe9ff' },
    { id: 'electric', label: 'Electric', from: '#4776E6', to: '#8E54E9' }
];

const GRADIENT_ORIENTATIONS = [
    { id: 'vertical', label: 'Vertical', css: 'to bottom' },
    { id: 'horizontal', label: 'Horizontal', css: 'to right' },
    { id: 'diagonal', label: 'Diagonal', css: '135deg' },
    { id: 'radial', label: 'Radial', css: 'circle' }
];

const normalizeHex = (value) => {
    if (!value) return null;
    let hex = value.trim();
    if (!hex) return null;
    if (!hex.startsWith('#')) hex = `#${hex}`;
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) {
        return null;
    }
    if (hex.length === 4) {
        hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    return hex.toUpperCase();
};


export function PreviewSection({
    images,
    pages,
    loading,
    mode,
    projectType,
    appScreens = [],

}) {
    const isAppProject = projectType === 'app';

    const previewRef = useRef(null);
    const [downloading, setDownloading] = React.useState(false);
    const [layout, setLayout] = React.useState('collection');
    const containerRef = useRef(null);

    const mobileRef = useRef(null);
    const tabletRef = useRef(null);
    const laptopRef = useRef(null);
    const desktopRef = useRef(null);

    const [backgroundType, setBackgroundType] = React.useState('solid');
    const [selectedSolid, setSelectedSolid] = React.useState(SOLID_COLOR_GRID[0]);
    const [selectedGradientId, setSelectedGradientId] = React.useState(GRADIENT_BACKGROUNDS[0].id);
    const [selectedGradientOrientation, setSelectedGradientOrientation] = React.useState(GRADIENT_ORIENTATIONS[0].id);
    const [isGradientInverted, setIsGradientInverted] = React.useState(false);
    const [customSolidInput, setCustomSolidInput] = React.useState('');

    const selectedGradient = GRADIENT_BACKGROUNDS.find(g => g.id === selectedGradientId) || GRADIENT_BACKGROUNDS[0];
    const gradientOrientation = GRADIENT_ORIENTATIONS.find(o => o.id === selectedGradientOrientation) || GRADIENT_ORIENTATIONS[0];
    const normalizedCustomSolid = React.useMemo(() => normalizeHex(customSolidInput), [customSolidInput]);

    const gradientColors = React.useMemo(() => {
        if (!selectedGradient) return { start: '#ffffff', end: '#f8fafc' };
        return isGradientInverted
            ? { start: selectedGradient.to, end: selectedGradient.from }
            : { start: selectedGradient.from, end: selectedGradient.to };
    }, [selectedGradient, isGradientInverted]);

    const backgroundStyle = React.useMemo(() => {
        if (backgroundType === 'gradient') {
            if (gradientOrientation.id === 'radial') {
                return {
                    backgroundColor: gradientColors.start,
                    backgroundImage: `radial-gradient(circle, ${gradientColors.start}, ${gradientColors.end})`
                };
            }
            return {
                backgroundColor: gradientColors.start,
                backgroundImage: `linear-gradient(${gradientOrientation.css}, ${gradientColors.start}, ${gradientColors.end})`
            };
        }
        return {
            backgroundColor: selectedSolid,
            backgroundImage: 'none'
        };
    }, [backgroundType, selectedSolid, gradientColors, gradientOrientation]);

    const exportBackgroundOptions = React.useMemo(() => ({
        backgroundColor: backgroundType === 'solid' ? selectedSolid : gradientColors.start || '#ffffff'
    }), [backgroundType, selectedSolid, gradientColors]);

    const applyCustomSolidColor = () => {
        if (normalizedCustomSolid) {
            setSelectedSolid(normalizedCustomSolid);
            setCustomSolidInput('');
        }
    };

    const getPixelRatio = (element, {
        targetWidth = 3840,
        targetHeight = 2160
    } = {}) => {
        if (typeof window === 'undefined') return 2;
        const rect = element?.getBoundingClientRect();

        // If no rect, default to high quality logic
        if (!rect || !rect.width || !rect.height) {
            return 4;
        }

        // Calculate scale needed to reach target 4K resolution
        const widthRatio = targetWidth / rect.width;
        const heightRatio = targetHeight / rect.height;

        // Use the larger ratio to ensure at least one dimension hits 4K
        const desiredRatio = Math.max(widthRatio, heightRatio);

        // Cap at reasonable limits to prevent crashes (max 3x is usually sufficient for 4K quality without glitches)
        // High pixel ratios (>3) often cause white lines, clipping, or z-fighting glitches on complex CSS layouts
        return Math.min(3, Math.max(desiredRatio, 2));
    };

    const waitForFonts = async () => {
        if (typeof document === 'undefined') return;
        const { fonts } = document;
        if (fonts && fonts.ready && fonts.status !== 'loaded') {
            try {
                await fonts.ready;
            } catch (err) {
                console.warn('Font loading wait failed', err);
            }
        }
    };

    const waitForImages = async (element) => {
        if (!element || typeof element.querySelectorAll !== 'function') return;
        const images = Array.from(element.querySelectorAll('img'));
        if (!images.length) return;

        await Promise.all(images.map(img => {
            if (img.complete && img.naturalWidth > 0) return Promise.resolve();
            return new Promise(resolve => {
                const cleanup = () => {
                    img.removeEventListener('load', cleanup);
                    img.removeEventListener('error', cleanup);
                    resolve();
                };
                const timer = setTimeout(cleanup, 8000);
                const wrapped = () => {
                    clearTimeout(timer);
                    cleanup();
                };
                img.addEventListener('load', wrapped, { once: true });
                img.addEventListener('error', wrapped, { once: true });
            });
        }));
    };

    const hideElementsForExport = (element) => {
        if (!element || typeof element.querySelectorAll !== 'function') return [];
        const hiddenNodes = Array.from(element.querySelectorAll('[data-hide-on-export="true"]'));
        hiddenNodes.forEach(node => {
            node.dataset.prevVisibility = node.style.visibility || '';
            node.style.visibility = 'hidden';
        });
        return hiddenNodes;
    };

    const restoreHiddenElements = (nodes = []) => {
        nodes.forEach(node => {
            if (!node) return;
            node.style.visibility = node.dataset.prevVisibility || '';
            delete node.dataset.prevVisibility;
        });
    };

    const dataUrlToBlob = async (dataUrl) => {
        const response = await fetch(dataUrl);
        return response.blob();
    };

    const blobToDataUrl = (blob) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    };

    const ensureMaxSize = async (dataUrl, {
        maxBytes = 10 * 1024 * 1024,
        mime = 'image/jpeg'
    } = {}) => {
        try {
            let blob = await dataUrlToBlob(dataUrl);
            if (blob.size <= maxBytes) {
                return dataUrl;
            }

            const bitmap = await createImageBitmap(blob);
            const canvas = document.createElement('canvas');
            let width = bitmap.width;
            let height = bitmap.height;
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(bitmap, 0, 0, width, height);

            // Initial attempt with high quality
            let quality = 1.0;
            let tempBlob = await new Promise(resolve => canvas.toBlob(resolve, mime, quality));

            if (tempBlob.size <= maxBytes) {
                return await blobToDataUrl(tempBlob);
            }

            // Optimize quality first, keep resolution
            let currentBlob = tempBlob;
            while (currentBlob.size > maxBytes && quality > 0.5) {
                quality -= 0.05;
                currentBlob = await new Promise(resolve => canvas.toBlob(resolve, mime, quality));
            }

            if (currentBlob.size <= maxBytes) {
                return await blobToDataUrl(currentBlob);
            }

            // Only downscale if quality reduction wasn't enough (rare for 10MB limit)
            let scale = 0.95;
            let currentWidth = width;
            let currentHeight = height;

            while (currentBlob.size > maxBytes && scale > 0.5) {
                currentWidth = Math.floor(width * scale);
                currentHeight = Math.floor(height * scale);

                // create temp canvas for resizing
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = currentWidth;
                tempCanvas.height = currentHeight;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(bitmap, 0, 0, currentWidth, currentHeight);

                currentBlob = await new Promise(resolve => tempCanvas.toBlob(resolve, mime, 0.7)); // mid quality for resized
                scale -= 0.05;
            }

            return await blobToDataUrl(currentBlob);

            return await blobToDataUrl(blob);
        } catch (error) {
            console.warn('Failed to compress image for export', error);
            return dataUrl;
        }
    };

    const exportElement = async (element, options = {}) => {
        if (!element) return null;
        await waitForFonts();
        await waitForImages(element);

        // Let html-to-image handle dimensions naturally.
        // Explicitly setting width/height can cause clipping if sub-pixels or transforms are involved.
        const pixelRatio = getPixelRatio(element, options);

        const hiddenNodes = hideElementsForExport(element);
        try {
            return await toPng(element, {
                cacheBust: true,
                useCors: true,
                pixelRatio,
                backgroundColor: '#00000000',
                skipAutoScale: true, // Prevent library from trying to fit weirdly
                style: {
                    // Ensure no transforms on the root interact with capture
                    transform: 'none',
                    margin: 0
                },
                ...options
            });
        } finally {
            restoreHiddenElements(hiddenNodes);
        }
    };

    const getTimestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

    const handleDownload = async (device) => {
        let ref;
        switch (device) {
            case 'mobile': ref = mobileRef; break;
            case 'tablet': ref = tabletRef; break;
            case 'laptop': ref = laptopRef; break;
            case 'desktop': ref = desktopRef; break;
            default: return;
        }

        if (!ref.current || downloading) return;

        try {
            setDownloading(true);
            const dataUrl = await exportElement(ref.current, exportBackgroundOptions);
            if (!dataUrl) return;
            const finalUrl = await ensureMaxSize(dataUrl);
            const link = document.createElement('a');
            link.download = `mockup-${device}-${getTimestamp()}.jpg`;
            link.href = finalUrl;
            link.click();
        } catch (err) {
            console.error('Failed to download image', err);
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadComposition = async () => {
        if (!containerRef.current || downloading) return;
        try {
            setDownloading(true);
            const dataUrl = await exportElement(containerRef.current, exportBackgroundOptions);
            const finalUrl = await ensureMaxSize(dataUrl);
            const link = document.createElement('a');
            link.download = `mockup-composition-${getTimestamp()}.jpg`;
            link.href = finalUrl;
            link.click();
            return finalUrl; // Return for zip
        } catch (err) {
            console.error('Failed to download composition', err);
            return null;
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadAll = async () => {
        if (downloading) return;
        const zip = new JSZip();
        const timestamp = getTimestamp();

        try {
            setDownloading(true);
            // Download individual devices if in device mode
            if (mode === 'device') {
                const devices = [
                    { name: 'mobile', ref: mobileRef },
                    { name: 'tablet', ref: tabletRef },
                    { name: 'laptop', ref: laptopRef },
                    { name: 'desktop', ref: desktopRef }
                ];

                const promises = devices.map(async ({ name, ref }) => {
                    if (ref.current && images[name]) {
                        const dataUrl = await exportElement(ref.current, exportBackgroundOptions);
                        const finalUrl = await ensureMaxSize(dataUrl);
                        const [meta = '', base64Data = ''] = finalUrl.split(',');
                        const extension = meta.includes('jpeg') ? 'jpg' : 'png';
                        if (base64Data) {
                            zip.file(`mockup-${name}-${timestamp}.${extension}`, base64Data, { base64: true });
                        }
                    }
                });
                await Promise.all(promises);
            }

            // Always download the composition
            if (containerRef.current) {
                const compositionDataUrl = await exportElement(containerRef.current, exportBackgroundOptions);
                if (compositionDataUrl) {
                    const finalUrl = await ensureMaxSize(compositionDataUrl);
                    const [meta = '', compositionBase64 = ''] = finalUrl.split(',');
                    const extension = meta.includes('jpeg') ? 'jpg' : 'png';
                    if (compositionBase64) {
                        zip.file(`mockup-composition-${timestamp}.${extension}`, compositionBase64, { base64: true });
                    }
                }
            }

            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `mockups-${timestamp}.zip`;
            link.click();
        } catch (err) {
            console.error('Failed to generate zip', err);
        } finally {
            setDownloading(false);
        }
    };

    React.useEffect(() => {
        if (mode === 'device') {
            setLayout(isAppProject ? 'phone-stack' : 'collection');
        } else {
            setLayout(isAppProject ? 'app-stack' : 'stack');
        }
    }, [mode, isAppProject]);

    const phoneScreens = React.useMemo(() => {
        const createPlaceholder = (label, index) => ({
            image: `https://placehold.co/420x880/eff1ff/94a3b8?text=${encodeURIComponent(label || `Screen ${index + 1}`)}`,
            label: label || `Screen ${index + 1}`,
            placeholder: true
        });

        if (isAppProject) {
            if (appScreens?.length) {
                return appScreens.map((screen, index) => ({
                    image: screen.image || createPlaceholder(screen.label, index).image,
                    label: screen.label || `Screen ${index + 1}`,
                    placeholder: !screen.image
                }));
            }
        }

        const fromPages = pages
            .filter(p => p.image)
            .map((p, index) => ({ image: p.image, label: p.label || `Page ${index + 1}` }));
        if (fromPages.length) return fromPages;

        if (images.mobile) {
            return [{ image: images.mobile, label: 'Screen' }];
        }

        if (isAppProject) {
            return [createPlaceholder('Screen 1', 0), createPlaceholder('Screen 2', 1), createPlaceholder('Screen 3', 2)];
        }

        return [];
    }, [appScreens, pages, images.mobile, isAppProject]);

    const getPhoneScreen = (index) => {
        if (!phoneScreens.length) {
            return {
                image: `https://placehold.co/420x880/eeeeee/888888?text=Screen+${index + 1}`,
                label: `Screen ${index + 1}`
            };
        }
        return phoneScreens[index % phoneScreens.length];
    };

    const devicePlaceholders = React.useMemo(() => ({
        desktop: 'https://placehold.co/1600x900/eff1ff/94a3b8?text=Desktop+Preview',
        laptop: 'https://placehold.co/1400x900/e0f2fe/0f172a?text=Laptop+Preview',
        tablet: 'https://placehold.co/1024x1366/f1f5f9/64748b?text=Tablet+Preview',
        mobile: 'https://placehold.co/430x880/f8fafc/94a3b8?text=Mobile+Preview'
    }), []);

    const getDeviceImage = (type) => images?.[type] || devicePlaceholders[type];
    const hasRealDeviceImages = Object.values(images || {}).some(Boolean);
    const hasPageImages = pages.some(p => p.image);

    const hasAnyDeviceOutput = isAppProject ? phoneScreens.length > 0 : hasRealDeviceImages;
    const hasAnyOutput = mode === 'device' ? hasAnyDeviceOutput : hasPageImages;

    const shouldShowDeviceLayout = mode === 'device';
    const shouldShowPageLayout = mode === 'pages' && (hasPageImages || loading);

    if (!shouldShowDeviceLayout && !shouldShowPageLayout) return null;

    return (
        <div className="space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
                <aside className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-5 flex flex-col gap-5">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.3em]">Background</p>
                        <div className="mt-3 flex flex-col gap-2">
                            {[
                                { id: 'solid', label: 'Solid Colors' },
                                { id: 'gradient', label: 'Gradients' }
                            ].map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => setBackgroundType(option.id)}
                                    className={`flex justify-between items-center px-4 py-2 rounded-xl border text-sm font-medium transition-all ${backgroundType === option.id
                                        ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/20'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900'}`}
                                >
                                    {option.label}
                                    {backgroundType === option.id && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.3em]">Palette</p>
                        {backgroundType === 'solid' ? (
                            <>
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {SOLID_COLOR_GRID.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedSolid(color)}
                                            className={`h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 rounded-full border transition-all relative shadow-none ${selectedSolid === color
                                                ? 'border-gray-900 ring-2 ring-gray-900/30 scale-105'
                                                : 'border-gray-200 hover:border-gray-400'}`}
                                            style={{ backgroundColor: color }}
                                            aria-label={`Select ${color}`}
                                        >
                                            {selectedSolid === color && (
                                                <Check className="w-2 h-2 text-white mix-blend-difference absolute inset-0 m-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-4 space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-[0.3em]">
                                        Custom Hex
                                    </label>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <input
                                            type="text"
                                            value={customSolidInput}
                                            onChange={(e) => setCustomSolidInput(e.target.value)}
                                            placeholder="#5A67D8"
                                            className="flex-1 min-w-[140px] rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm font-mono uppercase tracking-wide placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={applyCustomSolidColor}
                                            disabled={!normalizedCustomSolid}
                                            className="rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gray-900 disabled:bg-gray-300 disabled:text-gray-500 transition-colors whitespace-nowrap"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
                                        <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: normalizedCustomSolid || selectedSolid }} />
                                        <span>{normalizedCustomSolid || selectedSolid}</span>
                                        {!normalizedCustomSolid && customSolidInput && (
                                            <span className="text-red-500 font-sans normal-case">Enter #RGB or #RRGGBB</span>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="mt-3 space-y-3">
                                <div className="flex flex-wrap gap-1.5">
                                    {GRADIENT_BACKGROUNDS.map(gradient => (
                                        <button
                                            key={gradient.id}
                                            onClick={() => setSelectedGradientId(gradient.id)}
                                            className={`h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 rounded-full border transition-all relative overflow-hidden shadow-none ${selectedGradientId === gradient.id
                                                ? 'border-gray-900 ring-2 ring-gray-900/30 scale-105'
                                                : 'border-gray-200 hover:border-gray-400'}`}
                                            style={{
                                                backgroundImage: gradientOrientation.id === 'radial'
                                                    ? `radial-gradient(circle, ${isGradientInverted ? gradient.to : gradient.from}, ${isGradientInverted ? gradient.from : gradient.to})`
                                                    : `linear-gradient(135deg, ${isGradientInverted ? gradient.to : gradient.from}, ${isGradientInverted ? gradient.from : gradient.to})`
                                            }}
                                            aria-label={`Select ${gradient.label}`}
                                        >
                                            {selectedGradientId === gradient.id && (
                                                <Check className="w-2 h-2 text-white mix-blend-difference absolute inset-0 m-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="pt-4 border-t border-white/40">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.3em]">Direction</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {GRADIENT_ORIENTATIONS.map(option => (
                                            <button
                                                key={option.id}
                                                onClick={() => setSelectedGradientOrientation(option.id)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedGradientOrientation === option.id
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsGradientInverted(prev => !prev)}
                                        className="mt-3 inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                                    >
                                        {isGradientInverted ? 'Invert Off' : 'Invert Gradient'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                <div className="space-y-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <h3 className="text-2xl font-bold text-gray-900">Preview</h3>

                        <div className="flex items-center flex-wrap gap-3">
                            {/* Layout Toggles */}
                            {!isAppProject && (
                                <div className="bg-white/60 backdrop-blur-md border border-white/50 p-1.5 rounded-xl flex shadow-sm ring-1 ring-black/5">
                                    {mode === 'device' ? (
                                        <>
                                            <button
                                                onClick={() => setLayout('collection')}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${layout === 'collection' ? 'bg-white shadow-md text-blue-600 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}
                                            >
                                                Collection
                                            </button>
                                            <button
                                                onClick={() => setLayout('linear')}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${layout === 'linear' ? 'bg-white shadow-md text-blue-600 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}
                                            >
                                                Linear
                                            </button>
                                            <button
                                                onClick={() => setLayout('grid')}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${layout === 'grid' ? 'bg-white shadow-md text-blue-600 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}
                                            >
                                                Grid
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setLayout('stack')}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${layout === 'stack' ? 'bg-white shadow-md text-blue-600 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}
                                            >
                                                Stack
                                            </button>
                                            <button
                                                onClick={() => setLayout('showcase')}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${layout === 'showcase' ? 'bg-white shadow-md text-blue-600 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}
                                            >
                                                Showcase
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            {isAppProject && (
                                <div className="bg-gray-100 p-1 rounded-lg flex">
                                    {mode === 'device' ? (
                                        <>
                                            <button
                                                onClick={() => setLayout('phone-stack')}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${layout === 'phone-stack' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                                            >
                                                Stacked Phones
                                            </button>
                                            <button
                                                onClick={() => setLayout('phone-gallery')}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${layout === 'phone-gallery' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                                            >
                                                Screens Only
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setLayout('app-stack')}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${layout === 'app-stack' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                                            >
                                                Page Stack
                                            </button>
                                            <button
                                                onClick={() => setLayout('app-gallery')}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${layout === 'app-gallery' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                                            >
                                                Story Spread
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={handleDownloadComposition}
                                    disabled={downloading}
                                    className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {downloading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                                            Preparing...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4" />
                                            Download Composition
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleDownloadAll}
                                    disabled={!hasAnyOutput || downloading}
                                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                                >
                                    {downloading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Preparing...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4" />
                                            Download All
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Collection Layout (Device Mode) */}
                    {mode === 'device' && layout === 'collection' && !isAppProject && (
                        <div className="w-full flex justify-center pb-12 px-4">
	                            <div
	                                ref={containerRef}
	                                className="relative w-full max-w-[1200px] flex flex-col md:flex-row md:flex-wrap 2xl:flex-nowrap items-center md:items-end justify-center gap-8 md:gap-6 2xl:gap-0 p-8 md:p-16 rounded-[40px] border border-white/60 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.1)]"
	                                style={backgroundStyle}
	                            >
	                                <div
	                                    ref={mobileRef}
	                                    className="relative z-30 w-full max-w-[220px] md:w-[140px] lg:w-[180px] md:-translate-y-3 md:mr-0 2xl:mr-[-90px] md:shrink-0"
	                                >
	                                    <DeviceFrame type="mobile" image={getDeviceImage('mobile')} loading={loading} />
	                                </div>
	                                <div
	                                    ref={tabletRef}
	                                    className="relative z-20 w-full max-w-[360px] md:w-[200px] lg:w-[260px] md:-translate-y-3 md:mr-0 2xl:mr-[-80px] md:shrink-0"
	                                >
	                                    <DeviceFrame type="tablet" image={getDeviceImage('tablet')} loading={loading} />
	                                </div>
	                                <div
	                                    ref={desktopRef}
	                                    className="relative z-10 w-full max-w-[900px] md:w-[520px] lg:w-[650px] md:translate-y-2 md:mx-0 2xl:mx-[-45px] md:shrink-0"
	                                >
	                                    <DeviceFrame type="desktop" image={getDeviceImage('desktop')} loading={loading} />
	                                </div>
	                                <div
	                                    ref={laptopRef}
	                                    className="relative z-20 w-full max-w-[720px] md:w-[320px] lg:w-[420px] md:-translate-y-1 md:ml-0 2xl:ml-[-50px] md:shrink-0"
	                                >
	                                    <DeviceFrame type="laptop" image={getDeviceImage('laptop')} loading={loading} />
	                                </div>
	                            </div>
                        </div>
                    )}

                    {/* Linear Layout (Device Mode) - Left to Right */}
                    {mode === 'device' && layout === 'linear' && !isAppProject && (
                        <div className="w-full pb-12 px-4">
                            <div
                                ref={containerRef}
                                className="w-full max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 p-8 md:p-12 rounded-[32px] border border-white/70 shadow-[0_35px_90px_-50px_rgba(8,10,24,0.55)]"
                                style={backgroundStyle}
                            >
                                <div ref={desktopRef} className="w-[90%] md:w-[55%] drop-shadow-2xl z-10">
                                    <DeviceFrame type="desktop" image={getDeviceImage('desktop')} loading={loading} />
                                </div>

                                <div ref={laptopRef} className="w-[80%] md:w-[45%] drop-shadow-2xl z-20">
                                    <DeviceFrame type="laptop" image={getDeviceImage('laptop')} loading={loading} />
                                </div>

                                <div ref={tabletRef} className="w-[50%] md:w-[30%] drop-shadow-2xl z-30">
                                    <DeviceFrame type="tablet" image={getDeviceImage('tablet')} loading={loading} />
                                </div>

                                <div ref={mobileRef} className="w-[30%] md:w-[15%] drop-shadow-2xl z-40">
                                    <DeviceFrame type="mobile" image={getDeviceImage('mobile')} loading={loading} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Grid Layout (Device Mode) */}
                    {mode === 'device' && layout === 'grid' && !isAppProject && (
                        <div
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 p-8 rounded-[32px] border border-white/70 shadow-[0_35px_80px_-55px_rgba(8,10,24,0.5)] w-full max-w-5xl mx-auto"
                            ref={containerRef}
                            style={backgroundStyle}
                        >
                            {/* Monitor - top left */}
                            <div className="flex justify-center md:justify-end items-center md:pr-4">
                                <div ref={desktopRef} className="relative group w-full max-w-[600px] transition-transform duration-500 hover:scale-105 drop-shadow-2xl">
                                    <DeviceFrame type="desktop" image={getDeviceImage('desktop')} loading={loading} />
                                    <button
                                        data-hide-on-export="true"
                                        onClick={() => handleDownload('desktop')}
                                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:bg-white hover:scale-110"
                                        title="Download Desktop"
                                    >
                                        <Download className="w-5 h-5 text-gray-700" />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile - top right */}
                            <div className="flex justify-center md:justify-start items-center md:pl-4">
                                <div ref={mobileRef} className="relative group w-[50%] md:w-[200px] transition-transform duration-500 hover:scale-105 drop-shadow-xl">
                                    <DeviceFrame type="mobile" image={getDeviceImage('mobile')} loading={loading} />
                                    <button
                                        data-hide-on-export="true"
                                        onClick={() => handleDownload('mobile')}
                                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:bg-white hover:scale-110"
                                        title="Download Mobile"
                                    >
                                        <Download className="w-5 h-5 text-gray-700" />
                                    </button>
                                </div>
                            </div>

                            {/* Laptop - bottom left */}
                            <div className="flex justify-center md:justify-end items-center md:pr-4">
                                <div ref={laptopRef} className="relative group w-full max-w-[480px] transition-transform duration-500 hover:scale-105 drop-shadow-2xl self-end">
                                    <DeviceFrame type="laptop" image={getDeviceImage('laptop')} loading={loading} />
                                    <button
                                        data-hide-on-export="true"
                                        onClick={() => handleDownload('laptop')}
                                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:bg-white hover:scale-110"
                                        title="Download Laptop"
                                    >
                                        <Download className="w-5 h-5 text-gray-700" />
                                    </button>
                                </div>
                            </div>

                            {/* Tablet - bottom right */}
                            <div className="flex justify-center md:justify-start items-center md:pl-4">
                                <div ref={tabletRef} className="relative group w-[50%] md:w-[320px] transition-transform duration-500 hover:scale-105 drop-shadow-xl self-end">
                                    <DeviceFrame type="tablet" image={getDeviceImage('tablet')} loading={loading} />
                                    <button
                                        data-hide-on-export="true"
                                        onClick={() => handleDownload('tablet')}
                                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:bg-white hover:scale-110"
                                        title="Download Tablet"
                                    >
                                        <Download className="w-5 h-5 text-gray-700" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* App Project - Phone stack layout */}
                    {mode === 'device' && isAppProject && layout === 'phone-stack' && (
                        <div className="w-full overflow-x-auto pb-16">
                            <div
                                ref={containerRef}
                                className="relative min-w-[900px] mx-auto flex items-center justify-center rounded-[36px] p-16 border border-white/70 shadow-[0_40px_90px_rgba(70,90,255,0.2)] overflow-hidden"
                                style={backgroundStyle}
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_60%)]" />
                                <div className="relative flex items-end justify-center gap-8">
                                    {['left', 'center', 'right'].map((position, index) => {
                                        const rotations = { left: '-8deg', center: '0deg', right: '8deg' };
                                        const translate = {
                                            left: 'translateY(25px)',
                                            center: 'translateY(0px)',
                                            right: 'translateY(45px)'
                                        };
                                        const width = position === 'center' ? 'w-[260px]' : 'w-[220px]';
                                        const screen = getPhoneScreen(index);
                                        return (
                                            <div
                                                key={position}
                                                ref={position === 'center' ? mobileRef : undefined}
                                                className={`${width} transform ${position === 'center' ? '' : 'opacity-90'} drop-shadow-[0_25px_45px_rgba(15,23,42,0.3)]`}
                                                style={{ transform: `${translate[position]} rotate(${rotations[position]})` }}
                                            >
                                                <DeviceFrame
                                                    type="mobile"
                                                    image={screen.image}
                                                    loading={loading}
                                                    contentFit="contain"
                                                />
                                                {screen.label && (
                                                    <div className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
                                                        {screen.label}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* App Project - screen gallery */}
                    {mode === 'device' && isAppProject && layout === 'phone-gallery' && (
                        <div className="w-full overflow-x-auto pb-16">
                            <div
                                ref={containerRef}
                                className="relative min-w-[900px] mx-auto rounded-[36px] border border-white/70 backdrop-blur p-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 shadow-[0_30px_80px_rgba(15,23,42,0.25)]"
                                style={backgroundStyle}
                            >
                                {(phoneScreens.length ? phoneScreens : Array.from({ length: 4 }, (_, index) => getPhoneScreen(index))).map((screen, index) => (
                                    <div
                                        key={screen.label + index}
                                        ref={index === 0 ? mobileRef : undefined}
                                        className="relative h-[520px] rounded-[32px] bg-gradient-to-b from-gray-50 to-white border border-gray-100 shadow-[0_25px_45px_rgba(15,23,42,0.15)] overflow-hidden group"
                                    >
                                        <img
                                            src={screen.image}
                                            alt={screen.label || `Screen ${index + 1}`}
                                            crossOrigin="anonymous"
                                            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                                        />
                                        <div className="absolute inset-0 rounded-[32px] border border-white/40 pointer-events-none" />
                                        {screen.label && (
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/85 backdrop-blur px-4 py-1 rounded-full text-[11px] font-semibold tracking-[0.3em] text-gray-600 uppercase">
                                                {screen.label}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stack Layout (Pages Mode) */}
                    {mode === 'pages' && layout === 'stack' && !isAppProject && (
                        <div className="w-full overflow-x-auto pb-24 pt-16 customized-scrollbar">
                            {(() => {
                                // Calculate required width based on number of pages to prevent overflow
                                // Base width 1200px, add 250px per extra page over 3
                                const dynamicWidth = Math.max(1200, pages.length * 300);

                                return (
                                    <div
                                        ref={containerRef}
                                        className="relative h-[800px] mx-auto flex items-center justify-center perspective-[2000px] transition-all duration-300"
                                        style={{
                                            ...backgroundStyle,
                                            minWidth: `${dynamicWidth}px`
                                        }}
                                    >
                                        {(() => {
                                            // Find center index: 'Home' -> Middle -> First
                                            let centerIndex = pages.findIndex(p => p.label?.toLowerCase().includes('home'));
                                            if (centerIndex === -1) centerIndex = Math.floor(pages.length / 2);

                                            return pages.map((page, index) => {
                                                const distanceFromCenter = index - centerIndex;
                                                const offset = distanceFromCenter * 220; // Increased spacing (approx 50% of 400px width + gap)
                                                const zIndex = 50 - Math.abs(distanceFromCenter);
                                                const scale = 1 - Math.abs(distanceFromCenter) * 0.05; // Less aggressive scaling
                                                const rotateY = distanceFromCenter * -5; // Subtle rotation

                                                // Brightness/Opacity effect for depth
                                                const brightness = 100 - Math.abs(distanceFromCenter) * 10;

                                                return (
                                                    <div
                                                        key={page.id}
                                                        className="absolute transition-all duration-700 ease-out hover:z-[60] hover:scale-110 hover:rotate-y-0 cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-xl overflow-hidden bg-white border-[6px] border-white"
                                                        style={{
                                                            transform: `translateX(${offset}px) translateZ(${-Math.abs(distanceFromCenter) * 50}px) rotateY(${rotateY}deg) scale(${scale})`,
                                                            filter: `brightness(${brightness}%)`,
                                                            zIndex: zIndex,
                                                            left: `calc(50% - 200px)`, // Centered base
                                                            top: '100px'
                                                        }}
                                                    >
                                                        <img src={page.image || `https://placehold.co/400x600/eee/999?text=${page.label}`} alt={page.label} crossOrigin="anonymous" className="w-[400px] h-[600px] object-cover object-top" />
                                                        <div className="absolute bottom-0 left-0 right-0 text-center font-bold text-gray-500 text-xs uppercase tracking-[0.2em] bg-white/95 backdrop-blur py-3 border-t border-gray-100">{page.label}</div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Showcase Layout (Pages Mode) */}
                    {mode === 'pages' && layout === 'showcase' && !isAppProject && (
                        <div className="w-full overflow-x-auto pb-24 pt-16">
                            <div
                                ref={containerRef}
                                className="relative min-w-[1400px] h-[800px] mx-auto flex items-center justify-center perspective-[2500px] gap-12"
                                style={backgroundStyle}
                            >
                                {(() => {
                                    // Find center page (Home)
                                    let centerIndex = pages.findIndex(p => p.label?.toLowerCase().includes('home'));
                                    if (centerIndex === -1) centerIndex = 0;
                                    const centerPage = pages[centerIndex];

                                    // Get side pages (filtering out home/center page to avoid dupes in a perfect world, but for now just slicing around it or keeping original logic if simpler. 
                                    // To keep it balanced visually as per original code which sliced 1,3 and 3,5, let's just use the original slicing but ensure we don't pick the center page if possible, 
                                    // OR just stick to the requested "Center must be Home" and let sides be whatever. 
                                    // User asked "device scren must be home".
                                    // Let's filter out the center page from the "others" list.
                                    // Reduce to single side pages for cleaner "1 Left - Laptop - 1 Right" look
                                    const otherPages = pages.filter((_, i) => i !== centerIndex);
                                    const leftPage = otherPages[0];
                                    const rightPage = otherPages[1];

                                    return (
                                        <>
                                            {/* Left Side Page - Single Long Screenshot */}
                                            {leftPage && (
                                                <div className="transform rotate-y-12 translate-x-24 z-10 transition-transform duration-700 hover:rotate-y-0 hover:translate-x-12">
                                                    <div className="w-[240px] h-[580px] shadow-2xl rounded-2xl overflow-hidden border-4 border-white bg-white transform transition-all duration-500 hover:scale-105 hover:-translate-x-4 group relative">
                                                        <img
                                                            src={leftPage.image || `https://placehold.co/430x1200/eee/999?text=${leftPage.label}`}
                                                            alt={leftPage.label}
                                                            crossOrigin="anonymous"
                                                            className="w-full h-full object-cover object-top hover:object-contain transition-all duration-700 bg-gray-50"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                                                        <div className="absolute bottom-4 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-500 shadow-sm border border-gray-100">
                                                                {leftPage.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Main Device (Center) */}
                                            <div className="z-30 transform hover:scale-105 transition-all duration-700 w-[850px] drop-shadow-2xl">
                                                <DeviceFrame type="laptop" image={centerPage?.image} loading={loading} hideChrome={true} />
                                            </div>

                                            {/* Right Side Page - Single Long Screenshot */}
                                            {rightPage && (
                                                <div className="transform -rotate-y-12 -translate-x-24 z-10 transition-transform duration-700 hover:rotate-y-0 hover:-translate-x-12">
                                                    <div className="w-[240px] h-[580px] shadow-2xl rounded-2xl overflow-hidden border-4 border-white bg-white transform transition-all duration-500 hover:scale-105 hover:translate-x-4 group relative">
                                                        <img
                                                            src={rightPage.image || `https://placehold.co/430x1200/eee/999?text=${rightPage.label}`}
                                                            alt={rightPage.label}
                                                            crossOrigin="anonymous"
                                                            className="w-full h-full object-cover object-top hover:object-contain transition-all duration-700 bg-gray-50"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                                                        <div className="absolute bottom-4 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-500 shadow-sm border border-gray-100">
                                                                {rightPage.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                    {/* App project page stack */}
                    {mode === 'pages' && isAppProject && layout === 'app-stack' && (
                        <div className="w-full overflow-x-auto pb-24 pt-16">
                            <div
                                ref={containerRef}
                                className="relative min-w-[1100px] h-[780px] mx-auto flex items-center justify-center"
                                style={backgroundStyle}
                            >
                                {pages.map((page, index) => {
                                    const offset = (index - (pages.length - 1) / 2) * 120;
                                    const rotation = (index - (pages.length - 1) / 2) * -4;
                                    const depth = 40 * Math.abs(index - (pages.length - 1) / 2);
                                    return (
                                        <div
                                            key={page.id}
                                            className="absolute w-[360px] h-[720px] rounded-[36px] overflow-hidden shadow-[0_30px_60px_rgba(15,23,42,0.35)] border-[8px] border-white bg-white transition-transform duration-700 ease-out hover:translate-y-[-15px] hover:z-[80]"
                                            style={{
                                                transform: `translateX(${offset}px) translateZ(${-depth}px) rotate(${rotation}deg)`,
                                                zIndex: 100 - Math.abs(index - (pages.length - 1) / 2)
                                            }}
                                        >
                                            <img
                                                src={page.image || `https://placehold.co/430x880/eeeeee/888888?text=${page.label}`}
                                                alt={page.label}
                                                crossOrigin="anonymous"
                                                className="w-full h-full object-cover object-top"
                                            />
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-4 py-1 rounded-full text-xs font-semibold tracking-[0.3em] text-gray-600 uppercase">
                                                {page.label}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* App project gallery */}
                    {mode === 'pages' && isAppProject && layout === 'app-gallery' && (
                        <div className="w-full overflow-x-auto pb-24 pt-16">
                            <div
                                ref={containerRef}
                                className="relative min-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 p-12 rounded-[40px] border border-white/60 shadow-[0_40px_120px_rgba(59,130,246,0.25)]"
                                style={backgroundStyle}
                            >
                                {pages.map((page, index) => (
                                    <div
                                        key={page.id}
                                        className="relative h-[580px] rounded-[32px] border border-gray-100 bg-white overflow-hidden shadow-[0_25px_60px_rgba(15,23,42,0.25)] group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <img
                                            src={page.image || `https://placehold.co/430x880/eeeeee/888888?text=${page.label}`}
                                            alt={page.label}
                                            crossOrigin="anonymous"
                                            className="w-full h-full object-cover object-top"
                                        />
                                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/90 px-5 py-2 rounded-full text-sm font-semibold text-gray-700 tracking-[0.2em] uppercase">
                                            {page.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
