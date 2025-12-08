import React, { useRef } from 'react';
import { DeviceFrame } from './DeviceFrame';
import { Download, Share2, ZoomIn, Check, Sparkles } from 'lucide-react';
import JSZip from 'jszip';
import { toPng } from 'html-to-image';


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

    const getPixelRatio = (element, {
        targetWidth = 7680,
        targetHeight = 4320
    } = {}) => {
        if (typeof window === 'undefined') return 4;
        const rect = element?.getBoundingClientRect();
        const baseRatio = window.devicePixelRatio || 1;
        if (!rect) {
            return Math.max(4, Math.min(8, baseRatio * 3));
        }

        const widthRatio = targetWidth / rect.width;
        const heightRatio = targetHeight / rect.height;

        const desiredRatio = Math.max(widthRatio, heightRatio, 4);
        return Math.min(8, Math.max(desiredRatio, baseRatio * 2));
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

    const exportElement = async (element, options = {}) => {
        if (!element) return null;
        await waitForFonts();
        const rect = element.getBoundingClientRect();
        const pixelRatio = getPixelRatio(element, options);
        const canvasWidth = rect?.width ? rect.width * pixelRatio : undefined;
        const canvasHeight = rect?.height ? rect.height * pixelRatio : undefined;

        const hiddenNodes = hideElementsForExport(element);
        try {
            return await toPng(element, {
                cacheBust: true,
                pixelRatio,
                canvasWidth,
                canvasHeight,
                backgroundColor: '#00000000',
                ...options
            });
        } finally {
            restoreHiddenElements(hiddenNodes);
        }
    };

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
            const dataUrl = await exportElement(ref.current);
            if (!dataUrl) return;
            const link = document.createElement('a');
            link.download = `mockup-${device}.png`;
            link.href = dataUrl;
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
            const dataUrl = await exportElement(containerRef.current, { backgroundColor: '#ffffff00' }); // Transparent bg
            const link = document.createElement('a');
            link.download = `mockup-composition.png`;
            link.href = dataUrl;
            link.click();
            return dataUrl; // Return for zip
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
                        const dataUrl = await exportElement(ref.current);
                        const base64Data = dataUrl.replace(/^data:image\/(png|jpg);base64,/, "");
                        zip.file(`mockup-${name}.png`, base64Data, { base64: true });
                    }
                });
                await Promise.all(promises);
            }

            // Always download the composition
            if (containerRef.current) {
                const compositionDataUrl = await exportElement(containerRef.current, { backgroundColor: '#ffffff00' });
                if (compositionDataUrl) {
                    const compositionBase64 = compositionDataUrl.replace(/^data:image\/(png|jpg);base64,/, "");
                    zip.file(`mockup-composition.png`, compositionBase64, { base64: true });
                }
            }

            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "mockups.zip";
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h3 className="text-2xl font-bold text-gray-900">Preview</h3>

                <div className="flex items-center gap-4">
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
                <div className="w-full overflow-x-auto pb-12">
                    <div
                        ref={containerRef}
                        className="relative min-w-[1200px] mx-auto flex items-end justify-center gap-0 p-16 rounded-[40px] border border-white/60 bg-gradient-to-b from-white to-gray-50/50 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.1)]"
                    >
                        <div ref={mobileRef} className="relative z-30 w-[180px] -translate-y-3 mr-[-90px]">
                            <DeviceFrame type="mobile" image={getDeviceImage('mobile')} loading={loading} />
                        </div>
                        <div ref={tabletRef} className="relative z-20 w-[260px] -translate-y-3 mr-[-80px]">
                            <DeviceFrame type="tablet" image={getDeviceImage('tablet')} loading={loading} />
                        </div>
                        <div ref={desktopRef} className="relative z-10 w-[650px] translate-y-2 mx-[-45px]">
                            <DeviceFrame type="desktop" image={getDeviceImage('desktop')} loading={loading} />
                        </div>
                        <div ref={laptopRef} className="relative z-20 w-[420px] -translate-y-1 ml-[-50px]">
                            <DeviceFrame type="laptop" image={getDeviceImage('laptop')} loading={loading} />
                        </div>
                    </div>
                </div>
            )}

            {/* Linear Layout (Device Mode) - Left to Right */}
            {mode === 'device' && layout === 'linear' && !isAppProject && (
                <div className="w-full overflow-x-auto pb-12">
                    <div
                        ref={containerRef}
                        className="min-w-fit mx-auto flex items-center justify-center gap-0 p-6 rounded-[32px] border border-white/70 bg-[radial-gradient(circle_at_center,_#ffffff,_#eef2f8,_#dfe4ee)] shadow-[0_35px_90px_-50px_rgba(8,10,24,0.55)]"
                    >
                        {/* Desktop */}
                        <div ref={desktopRef} className="w-[700px] drop-shadow-2xl z-10 self-center">
                            <DeviceFrame type="desktop" image={getDeviceImage('desktop')} loading={loading} />
                        </div>

                        {/* Laptop */}
                        <div ref={laptopRef} className="w-[500px] drop-shadow-2xl z-20 self-center">
                            <DeviceFrame type="laptop" image={getDeviceImage('laptop')} loading={loading} />
                        </div>

                        {/* Tablet */}
                        <div ref={tabletRef} className="w-[340px] drop-shadow-2xl z-30 self-center">
                            <DeviceFrame type="tablet" image={getDeviceImage('tablet')} loading={loading} />
                        </div>

                        {/* Mobile */}
                        <div ref={mobileRef} className="w-[180px] drop-shadow-2xl z-40 self-center">
                            <DeviceFrame type="mobile" image={getDeviceImage('mobile')} loading={loading} />
                        </div>
                    </div>
                </div>
            )}

            {/* Grid Layout (Device Mode) */}
            {mode === 'device' && layout === 'grid' && !isAppProject && (
                <div
                    className="grid grid-cols-2 gap-0 p-8 rounded-[32px] border border-white/70 bg-[radial-gradient(circle_at_center,_#ffffff,_#eef2f8,_#dde2ed)] shadow-[0_35px_80px_-55px_rgba(8,10,24,0.5)] max-w-5xl mx-auto"
                    ref={containerRef}
                >
                    {/* Monitor - top left */}
                    <div className="flex justify-end items-center pr-4">
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
                    <div className="flex justify-start items-center pl-4">
                        <div ref={mobileRef} className="relative group w-[200px] transition-transform duration-500 hover:scale-105 drop-shadow-xl">
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
                    <div className="flex justify-end items-center pr-4">
                        <div ref={laptopRef} className="relative group w-[480px] transition-transform duration-500 hover:scale-105 drop-shadow-2xl self-end">
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
                    <div className="flex justify-start items-center pl-4">
                        <div ref={tabletRef} className="relative group w-[320px] transition-transform duration-500 hover:scale-105 drop-shadow-xl self-end">
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
                        className="relative min-w-[900px] mx-auto flex items-center justify-center rounded-[36px] p-16 bg-gradient-to-br from-[#eef2ff] via-white to-[#dbeafe] border border-white/70 shadow-[0_40px_90px_rgba(70,90,255,0.2)] overflow-hidden"
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
                        className="relative min-w-[900px] mx-auto rounded-[36px] border border-white/70 bg-white/90 backdrop-blur p-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 shadow-[0_30px_80px_rgba(15,23,42,0.25)]"
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
                <div className="w-full overflow-x-auto pb-24 pt-16">
                    <div
                        ref={containerRef}
                        className="relative min-w-[1200px] h-[800px] mx-auto flex items-center justify-center perspective-[2000px]"
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
                                        <img src={page.image || `https://placehold.co/400x600/eee/999?text=${page.label}`} alt={page.label} className="w-[400px] h-[600px] object-cover object-top" />
                                        <div className="absolute bottom-0 left-0 right-0 text-center font-bold text-gray-500 text-xs uppercase tracking-[0.2em] bg-white/95 backdrop-blur py-3 border-t border-gray-100">{page.label}</div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            )}

            {/* Showcase Layout (Pages Mode) */}
            {mode === 'pages' && layout === 'showcase' && !isAppProject && (
                <div className="w-full overflow-x-auto pb-24 pt-16">
                    <div
                        ref={containerRef}
                        className="relative min-w-[1400px] h-[800px] mx-auto flex items-center justify-center perspective-[2500px] gap-12"
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
                            const otherPages = pages.filter((_, i) => i !== centerIndex);
                            const leftPages = otherPages.slice(0, 2);
                            const rightPages = otherPages.slice(2, 4);

                            return (
                                <>
                                    {/* Left Side Pages */}
                                    <div className="flex flex-col gap-6 transform rotate-y-12 translate-x-24 z-10 transition-transform duration-700 hover:rotate-y-0 hover:translate-x-12">
                                        {leftPages.map((page) => (
                                            <div key={page.id} className="w-[280px] h-[380px] shadow-2xl rounded-xl overflow-hidden border-4 border-white bg-white transform transition-all duration-500 hover:scale-105 hover:-translate-x-4 group">
                                                <img src={page.image || `https://placehold.co/400x600/eee/999?text=${page.label}`} alt={page.label} className="w-full h-full object-cover object-top" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Main Device (Center) */}
                                    <div className="z-30 transform hover:scale-105 transition-all duration-700 w-[850px] drop-shadow-2xl">
                                        <DeviceFrame type="laptop" image={centerPage?.image} loading={loading} hideChrome={true} />
                                    </div>

                                    {/* Right Side Pages */}
                                    <div className="flex flex-col gap-6 transform -rotate-y-12 -translate-x-24 z-10 transition-transform duration-700 hover:rotate-y-0 hover:-translate-x-12">
                                        {rightPages.map((page) => (
                                            <div key={page.id} className="w-[280px] h-[380px] shadow-2xl rounded-xl overflow-hidden border-4 border-white bg-white transform transition-all duration-500 hover:scale-105 hover:translate-x-4 group">
                                                <img src={page.image || `https://placehold.co/400x600/eee/999?text=${page.label}`} alt={page.label} className="w-full h-full object-cover object-top" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                            </div>
                                        ))}
                                    </div>
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
                        className="relative min-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 p-12 rounded-[40px] border border-white/60 bg-gradient-to-br from-white to-blue-50 shadow-[0_40px_120px_rgba(59,130,246,0.25)]"
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
    );
}
