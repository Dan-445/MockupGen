import React from 'react';
import realLaptop from '../assets/laptop.png';
import realDesktop from '../assets/desktop.png';
import realMobile from '../assets/mobile.png';
import realTablet from '../assets/tablet.png';

export function DeviceFrame({ type, image, loading, contentFit = 'cover' }) {
    const [imageFailed, setImageFailed] = React.useState(false);

    React.useEffect(() => {
        setImageFailed(false);
    }, [image]);

    const renderScreen = () => (
        <div className="w-full h-full overflow-hidden flex flex-col relative transition-all duration-300 bg-black">
            <div className="flex-1 relative w-full h-full">
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-700 animate-pulse">
                        <div className="w-8 h-8 rounded-full border-4 border-current border-t-transparent animate-spin"></div>
                    </div>
                ) : image && !imageFailed ? (
                    <img
                        src={image}
                        alt="Preview"
                        className={`w-full h-full ${contentFit === 'contain'
                            ? 'object-contain bg-black'
                            : 'object-cover object-top brightness-110 contrast-105'
                            }`}
                        onError={() => setImageFailed(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <p className="text-white opacity-50">Screen Content Area</p>
                    </div>
                )}
            </div>
        </div>
    );

    if (type === 'mobile') {
        return (
            <div className="relative mx-auto w-full max-w-[360px]">
                <img
                    src={realMobile}
                    alt="Mobile frame"
                    className="relative z-10 w-full h-auto select-none pointer-events-none drop-shadow-[0_25px_45px_-18px_rgba(4,6,13,0.7)]"
                />
                <div
                    className="absolute z-0 rounded-[12px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.35)] bg-black"
                    style={{
                        top: '2.3%',
                        left: '28.5%',
                        width: '43.5%',
                        height: '96%'
                    }}
                >
                    {renderScreen()}
                </div>
            </div>
        );
    }

    if (type === 'tablet') {
        return (
            <div className="relative mx-auto w-full max-w-[520px]">
                <img
                    src={realTablet}
                    alt="Tablet frame"
                    className="relative z-10 w-full h-auto select-none pointer-events-none drop-shadow-[0_25px_45px_-20px_rgba(5,6,15,0.7)]"
                />
                <div
                    className="absolute z-0 rounded-[6px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.35)] bg-black"
                    style={{
                        top: '10.5%',
                        left: '17%',
                        width: '66%',
                        height: '79%'
                    }}
                >
                    {renderScreen()}
                </div>
            </div>
        );
    }

    if (type === 'laptop') {
        return (
            <div className="relative mx-auto w-full max-w-[880px]">
                <img
                    src={realLaptop}
                    alt="Laptop frame"
                    className="relative z-10 w-full h-auto select-none pointer-events-none drop-shadow-[0_25px_55px_rgba(4,6,13,0.6)]"
                />
                <div
                    className="absolute z-0 rounded-[8px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.45)] bg-black"
                    style={{
                        top: '21.5%',
                        left: '8.2%',
                        width: '83%',
                        height: '52.5%'
                    }}
                >
                    {renderScreen()}
                </div>
            </div>
        );
    }

    if (type === 'desktop') {
        return (
            <div className="relative mx-auto w-full max-w-[1040px] pb-[6%]">
                <img
                    src={realDesktop}
                    alt="Desktop frame"
                    className="relative z-10 w-full h-auto select-none pointer-events-none drop-shadow-[0_25px_55px_-25px_rgba(5,6,20,0.55)]"
                />
                <div
                    className="absolute z-0 rounded-[10px] overflow-hidden shadow-[0_18px_45px_rgba(0,0,0,0.45)] bg-black"
                    style={{
                        top: '12%',
                        left: '9%',
                        width: '82%',
                        height: '58%'
                    }}
                >
                    {renderScreen()}
                </div>
            </div>
        );
    }

    return null;
}
