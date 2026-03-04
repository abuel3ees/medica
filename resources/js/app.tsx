import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { SplashScreen } from './components/splash-screen';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Medica';

function AppWithSplash({ children, splashEnabled }: { children: React.ReactNode; splashEnabled: boolean }) {
    const [showSplash, setShowSplash] = useState(() => {
        if (!splashEnabled) return false;
        // Only show splash once per session (open a new tab or clear sessionStorage to replay)
        if (sessionStorage.getItem('medica_splash_shown')) return false;
        return true;
    });

    const handleSplashComplete = useCallback(() => {
        sessionStorage.setItem('medica_splash_shown', '1');
        setShowSplash(false);
    }, []);

    return (
        <>
            {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
            <div style={{ visibility: showSplash ? 'hidden' : 'visible' }}>
                {children}
            </div>
        </>
    );
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Read splash flag from initial page props (shared via HandleInertiaRequests)
        const pageProps = props.initialPage.props as Record<string, unknown>;
        const featureFlags = pageProps.featureFlags as Record<string, boolean> | undefined;
        const splashEnabled = featureFlags?.splash_animation !== false;

        root.render(
            <StrictMode>
                <AppWithSplash splashEnabled={splashEnabled}>
                    <App {...props} />
                </AppWithSplash>
            </StrictMode>,
        );
    },
    progress: {
        color: '#C46A47',
    },
});

// This will set light / dark mode on load...
initializeTheme();
