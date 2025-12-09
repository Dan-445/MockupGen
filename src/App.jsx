import React, { useState } from 'react';
import { InputSection } from './components/InputSection';
import { PreviewSection } from './components/PreviewSection';
import { Download, Monitor, Smartphone, Tablet, Laptop, AppWindowMac, Palette } from 'lucide-react';

const projectTypes = [
  {
    id: 'website',
    title: 'Website Mockups',
    description: 'Generate responsive website views for every device.',
    icon: Monitor,
    comingSoon: false,
  },
  {
    id: 'app',
    title: 'App Mockups',
    description: 'Create polished phone-first screens.',
    icon: AppWindowMac,
    comingSoon: false,
  },

];

function App() {
  const [mode, setMode] = useState('device'); // 'device' | 'pages'
  const [url, setUrl] = useState('');
  const [projectType, setProjectType] = useState('website');
  const slugify = (text = '') =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const selectedProject = projectTypes.find((p) => p.id === projectType);



  // Device Mode State
  const [images, setImages] = useState({
    mobile: null,
    tablet: null,
    laptop: null,
    desktop: null,
  });

  // Phone screens for App mockups
  const [appScreens, setAppScreens] = useState([
    { id: 'screen-1', label: 'Screen 1', image: null },
    { id: 'screen-2', label: 'Screen 2', image: null },
    { id: 'screen-3', label: 'Screen 3', image: null },
  ]);

  // Page Stack Mode State
  const [pages, setPages] = useState([
    { id: 'p1', label: 'Home Page', url: '', image: null },
    { id: 'p2', label: 'Features', url: '', image: null },
    { id: 'p3', label: 'Pricing', url: '', image: null },
  ]);

  const [loading, setLoading] = useState(false);

  // Helper to get screenshot URL
  const getScreenshotUrl = (targetUrl, width, height, isMobile = false, usePrerender = false, isFullPage = false) => {
    if (!targetUrl) return null;

    // Use our new local/serverless API
    const baseUrl = '/api/screenshot';

    const params = new URLSearchParams({
      url: targetUrl,
      width: width.toString(),
      height: height.toString(),
      deviceScaleFactor: '3', // High res
      ...(isFullPage && { fullPage: 'true' }),
      ...(isMobile && {
        isMobile: 'true',
        hasTouch: 'true',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      })
    });

    // Add a unique timestamp to bust React/Browser caching when re-generating
    params.set('t', Date.now().toString());

    return `${baseUrl}?${params.toString()}`;
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url && mode === 'device') return;
    setLoading(true);

    if (mode === 'device') {
      if (projectType === 'app') {
        const phoneScreenshot = getScreenshotUrl(url, 390, 844, true); // Phone-first for apps
        setImages({
          mobile: phoneScreenshot,
          tablet: null,
          laptop: null,
          desktop: null,
        });
        setAppScreens((prev) => {
          if (!prev.length) {
            return [{ id: `screen-${Date.now()}`, label: 'Screen 1', image: phoneScreenshot }];
          }
          return prev.map((screen, index) =>
            index === 0 ? { ...screen, image: phoneScreenshot } : screen
          );
        });
      } else {
        setImages({
          mobile: getScreenshotUrl(url, 390, 844, true), // iPhone 15 Pro dimensions
          tablet: getScreenshotUrl(url, 834, 1194, true), // iPad mini portrait
          laptop: getScreenshotUrl(url, 1512, 982, false),
          desktop: getScreenshotUrl(url, 1920, 1080, false),
        });
      }
    } else {
      // For pages mode, we use the URLs from the pages state
      const newPages = pages.map(page => {
        // If the user hasn't manually entered a URL for a specific page, 
        // we try to construct it from the main URL if provided, otherwise skip.
        let targetUrl = page.url;
        const slug = slugify(page.label);
        const pagePath = slug === 'home' || slug === 'home-page' ? '' : slug;

        if (!targetUrl && url) {
          const baseUrl = url.replace(/\/$/, '');
          // Heuristic: If label looks like it might be a path, use it. 
          // But for manual input boxes, user likely pastes full URL or relies on this helper.
          // Let's keep it simple: if empty, try to append label slug, else use input.
          targetUrl = pagePath ? `${baseUrl}/${pagePath}` : baseUrl;
        }

        const width = projectType === 'app' ? 430 : 1280;
        const height = projectType === 'app' ? 900 : 1800;
        const useMobileViewport = projectType === 'app';

        return {
          ...page,
          url: targetUrl, // Update the state with the constructed URL so the user sees it
          // switch to standard capture (false) to match device mockups reliability
          // Set fullPage to true for Pages mode
          image: getScreenshotUrl(targetUrl, width, height, useMobileViewport, false, true)
        };
      });
      setPages(newPages);
    }

    setTimeout(() => setLoading(false), 3000); // Give it a bit more time for multiple screenshots
  };

  const handlePageUrlChange = (id, newUrl) => {
    setPages(prev => prev.map(p => (p.id === id ? { ...p, url: newUrl } : p)));
  };

  const handlePageLabelChange = (id, newLabel) => {
    setPages(prev => prev.map(p => (p.id === id ? { ...p, label: newLabel } : p)));
  };

  const handleAddPage = () => {
    const newId = `custom-${Date.now()}`;
    setPages(prev => [
      ...prev,
      { id: newId, label: `Page ${prev.length + 1}`, url: '', image: null }
    ]);
  };

  const handleRemovePage = (id) => {
    setPages(prev => (prev.length <= 1 ? prev : prev.filter(p => p.id !== id)));
  };

  const handleAppScreenLabelChange = (id, newLabel) => {
    setAppScreens(prev => prev.map(screen => (screen.id === id ? { ...screen, label: newLabel } : screen)));
  };

  const handleAppScreenImageChange = (id, imageData) => {
    setAppScreens(prev => prev.map(screen => (screen.id === id ? { ...screen, image: imageData } : screen)));
  };

  const handleAddAppScreen = () => {
    setAppScreens(prev => {
      if (prev.length >= 5) return prev;
      const nextIndex = prev.length + 1;
      return [
        ...prev,
        { id: `screen-${Date.now()}`, label: `Screen ${nextIndex}`, image: null }
      ];
    });
  };

  const handleRemoveAppScreen = (id) => {
    setAppScreens(prev => (prev.length <= 1 ? prev : prev.filter(screen => screen.id !== id)));
  };

  const handleImageUpload = (device, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (projectType === 'app' && device === 'mobile') {
          const imageData = e.target.result;
          setAppScreens(prev => {
            if (!prev.length) {
              return [{ id: `screen-${Date.now()}`, label: 'Screen 1', image: imageData }];
            }
            return prev.map((screen, index) =>
              index === 0 ? { ...screen, image: imageData } : screen
            );
          });
        }
        setImages((prev) => ({ ...prev, [device]: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-[#f8fafc] selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px] mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[120px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-purple-100/50 blur-[120px] mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 inset-x-0 z-50 transition-all duration-300">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm supports-[backdrop-filter]:bg-white/60"></div>
          <div className="relative w-full px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25">M</div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">MockupGen</span>
            </div>


            <div className="flex items-center gap-4">
              {/* Mode Switcher */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setMode('device')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${mode === 'device' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Device Mockups
                </button>
                <button
                  onClick={() => setMode('pages')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${mode === 'pages' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Page Stack
                </button>
              </div>


            </div>

          </div>
        </header>

        <main className="w-full px-4 sm:px-6 lg:px-12 py-12 space-y-12">
          <div className="space-y-12">
            {/* Hero */}
            <div className="text-center space-y-6 w-full pt-20 pb-12">
              <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50/50 backdrop-blur-sm px-3 py-1 text-sm font-medium text-blue-800 shadow-sm mb-4">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                New: Page Stacks are here
              </div>
              <h2 className="text-5xl font-extrabold tracking-tight sm:text-7xl leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 pb-2">
                Generate Beautiful<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  {mode === 'device' ? 'Device Mockups' : '3D Page Stacks'}
                </span>
              </h2>
              <p className="text-xl text-gray-500 leading-relaxed">
                {mode === 'device'
                  ? 'Turn your website into professional visuals instantly. Paste a URL, get stunning device shots.'
                  : 'Visualize your user journey with cinematic 3D stacks. Perfect for pitch decks and portfolios.'}
              </p>
            </div>

            {/* Project Type Selection */}
            <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-[0.2em]">
                      Project Type
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      What are you building today?
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Website and App mockups are available.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {projectTypes.map(({ id, title, description, icon: Icon, comingSoon }) => {
                    const isSelected = projectType === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setProjectType(id)}
                        className={`text-left rounded-2xl border p-5 transition-all flex flex-col gap-3 ${isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/40'
                          } ${comingSoon ? 'cursor-not-allowed opacity-70' : ''}`}
                        disabled={comingSoon}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-3 rounded-2xl ${isSelected ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-600'
                              }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-lg font-semibold text-gray-900">{title}</p>
                            <p className="text-sm text-gray-500">{description}</p>
                          </div>
                          {comingSoon && (
                            <span className="text-xs font-semibold text-orange-600 bg-orange-50 rounded-full px-2 py-1">
                              Soon
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <span className="text-sm font-medium text-blue-700">Selected</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {!selectedProject?.comingSoon ? (
              <InputSection
                url={url}
                setUrl={setUrl}
                onSubmit={handleUrlSubmit}
                onUpload={handleImageUpload}
                loading={loading}
                mode={mode}
                pages={pages}
                onPageUrlChange={handlePageUrlChange}
                onPageLabelChange={handlePageLabelChange}
                onAddPage={handleAddPage}
                onRemovePage={handleRemovePage}
                projectType={projectType}
                appScreens={appScreens}
                onAppScreenLabelChange={handleAppScreenLabelChange}
                onAddAppScreen={handleAddAppScreen}
                onRemoveAppScreen={handleRemoveAppScreen}
                onAppScreenUpload={handleAppScreenImageChange}

              />
            ) : (
              <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-10 text-center space-y-4 shadow-inner">
                <p className="text-2xl font-semibold text-gray-800">
                  {selectedProject?.title} are coming soon!
                </p>
                <p className="text-gray-500 max-w-2xl mx-auto">
                  We&apos;re building dedicated experiences for this mockup type. Switch back to Website Mockups to keep creating today.
                </p>
              </div>
            )}

            {!selectedProject?.comingSoon && (
              <PreviewSection
                images={images}
                pages={pages}
                loading={loading}
                mode={mode}
                projectType={projectType}
                appScreens={appScreens}

              />
            )}
          </div>
        </main>

        {/* Debug Logs Overlay */}
        {/* Debug Logs Overlay */}
      </div>
    </div>
  );
}


export default App;
