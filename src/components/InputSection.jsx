import React from 'react';
import { Globe, Smartphone, Tablet, Laptop, Monitor, Plus, Trash2 } from 'lucide-react';

export function InputSection({
    url,
    setUrl,
    onSubmit,
    onUpload,
    loading,
    mode,
    pages,
    onPageUrlChange,
    onPageLabelChange,
    onAddPage,
    onRemovePage,
    projectType,
    appScreens = [],
    onAppScreenLabelChange,
    onAddAppScreen,
    onRemoveAppScreen,
    onAppScreenUpload,
    onPageImageUpload,

}) {
    const isAppProject = projectType === 'app';

    const handleHardRefresh = () => {
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    const handleAppScreenFileChange = (id, file) => {
        if (!file || !onAppScreenUpload) return;
        const reader = new FileReader();
        reader.onload = (e) => onAppScreenUpload(id, e.target.result);
        reader.readAsDataURL(file);
    };





    const devices = isAppProject
        ? [{ id: 'mobile', icon: Smartphone, label: 'Phone Screen' }]
        : [
            { id: 'mobile', icon: Smartphone, label: 'Mobile' },
            { id: 'tablet', icon: Tablet, label: 'Tablet' },
            { id: 'laptop', icon: Laptop, label: 'Laptop' },
            { id: 'desktop', icon: Monitor, label: 'Desktop' },
        ];



    // Default View (Mockups)
    // Default View (Mockups)
    return (
        <div className="relative group isolate">
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/0 rounded-[2.5rem] -z-10 pointer-events-none"></div>
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-8 md:p-10 space-y-10 ring-1 ring-black/5">
                {/* Form wrapping inputs */}
                <form onSubmit={onSubmit} className="relative w-full space-y-4">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleHardRefresh}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            New Session
                        </button>
                    </div>
                    {mode === 'device' ? (
                        <div className="relative flex items-center">
                            <Globe className="absolute left-4 w-5 h-5 text-gray-400" />
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder={isAppProject ? 'https://yourapp.com/screen' : 'https://example.com'}
                                className="w-full pl-12 pr-40 py-5 bg-white/50 border border-gray-200/60 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-lg shadow-sm placeholder:text-gray-400"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="absolute right-2.5 top-2.5 bottom-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? 'Generating...' : isAppProject ? 'Generate Stack' : 'Generate'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">
                                    Pages to Capture
                                </label>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {pages.map((page) => (
                                    <div key={page.id} className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white/50 p-5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                                <input
                                                    type="text"
                                                    value={page.label}
                                                    onChange={(e) => onPageLabelChange(page.id, e.target.value)}
                                                    placeholder="Menu label"
                                                    className="w-full sm:w-40 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                />
                                                <input
                                                    type="url"
                                                    value={page.url}
                                                    onChange={(e) => onPageUrlChange(page.id, e.target.value)}
                                                    placeholder={`https://example.com/${page.label?.toLowerCase() === 'home' ? '' : page.label?.toLowerCase().replace(/\s+/g, '-')}`}
                                                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => onRemovePage(page.id)}
                                                disabled={pages.length <= 1}
                                                className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-2.5 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                title="Remove"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="w-full sm:w-32">
                                                <div className="relative w-full pt-[160%] rounded-xl border border-dashed border-gray-200 bg-gray-50 overflow-hidden">
                                                    {page.image ? (
                                                        <img src={page.image} alt={page.label} className="absolute inset-0 w-full h-full object-cover object-top" />
                                                    ) : (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] text-gray-400 uppercase tracking-[0.2em]">
                                                            Preview
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <label className="flex-1 text-xs font-medium text-gray-500">
                                                Upload Custom Screen
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => onPageImageUpload?.(page.id, e.target.files[0])}
                                                    className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700 cursor-pointer"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onAddPage}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Menu Item
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-3.5 rounded-xl font-semibold shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {loading ? 'Capturing Pages...' : 'Generate Stack'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                {mode === 'device' && (
                    <>
                        {isAppProject ? (
                            <div className="rounded-xl bg-purple-50/60 border border-purple-100 p-4 text-sm text-purple-900">
                                We'll only capture an iPhone-sized viewport for this mockup. Upload a custom phone screen below if you already have the design ready.
                            </div>
                        ) : null}

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-3 bg-white text-sm text-gray-500 font-medium">
                                    {isAppProject ? 'OR UPLOAD A PHONE SCREEN' : 'OR UPLOAD IMAGES'}
                                </span>
                            </div>
                        </div>

                        {isAppProject ? (
                            <div className="space-y-5">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-base font-semibold text-gray-900">Phone Screens</p>
                                        <p className="text-sm text-gray-500">Add up to 5 custom screens. These flow straight into the stacked and gallery layouts.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onAddAppScreen?.()}
                                        disabled={(appScreens?.length || 0) >= 5}
                                        className="inline-flex items-center gap-2 rounded-lg border border-purple-200 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Screen
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {(appScreens || []).map((screen) => (
                                        <div key={screen.id} className="rounded-2xl border border-gray-200 p-4 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={screen.label}
                                                    onChange={(e) => onAppScreenLabelChange?.(screen.id, e.target.value)}
                                                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-gray-50"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => onRemoveAppScreen?.(screen.id)}
                                                    disabled={(appScreens?.length || 0) <= 1}
                                                    className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:text-red-600 hover:border-red-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                                    title="Remove screen"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="aspect-[9/19.5] rounded-2xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                                {screen.image ? (
                                                    <img src={screen.image} alt={screen.label} className="h-full w-full object-cover object-top" />
                                                ) : (
                                                    <span className="text-xs text-gray-400 text-center px-4">Upload your screen image</span>
                                                )}
                                            </div>
                                            <label className="block">
                                                <span className="text-xs font-medium text-gray-500">Upload Design</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleAppScreenFileChange(screen.id, e.target.files[0])}
                                                    className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-purple-700 cursor-pointer"
                                                />
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {devices.map(({ id, icon: DeviceIcon, label }, index) => {
                                    // 3D Gradients per device
                                    const gradients = [
                                        'from-pink-500 to-rose-500',    // Mobile
                                        'from-purple-500 to-indigo-500', // Tablet
                                        'from-blue-500 to-cyan-500',     // Laptop
                                        'from-emerald-500 to-teal-500'   // Desktop
                                    ];
                                    const gradient = gradients[index % gradients.length];
                                    const shadowColor = [
                                        'shadow-pink-500/20',
                                        'shadow-purple-500/20',
                                        'shadow-blue-500/20',
                                        'shadow-emerald-500/20'
                                    ][index % 4];

                                    return (
                                        <div key={id} className="relative group cursor-pointer perspective-1000">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => onUpload(id, e.target.files[0])}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                title=""
                                            />
                                            <div className={`
                                                relative overflow-hidden rounded-2xl bg-white border border-gray-100 
                                                transition-all duration-300 ease-out
                                                group-hover:-translate-y-2 group-hover:shadow-2xl ${shadowColor}
                                                h-40 flex flex-col items-center justify-center gap-3
                                            `}>
                                                {/* Animated Gradient Background Blob */}
                                                <div className={`
                                                    absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${gradient} opacity-[0.03] 
                                                    group-hover:opacity-[0.08] transition-opacity duration-500
                                                `}></div>

                                                {/* 3D Icon Container */}
                                                <div className={`
                                                    relative w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} 
                                                    shadow-lg transform transition-transform duration-500 
                                                    group-hover:scale-110 group-hover:rotate-3 flex items-center justify-center
                                                    text-white
                                                `}>
                                                    <DeviceIcon className="w-7 h-7 drop-shadow-md" />
                                                    {/* Gloss effect */}
                                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
                                                </div>

                                                <div className="text-center z-10">
                                                    <span className="block text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                                                        {label}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider group-hover:text-blue-500 transition-colors">
                                                        Upload
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
