'use client'

import { useEffect, useRef, useState } from 'react';
import { useBatteryStatus } from '@/hooks/useBatteryStatus';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useClipboard } from '@/hooks/useClipboard';
import { useConfirmExit } from '@/hooks/useConfirmExit';
import { useCookie } from '@/hooks/useCookie';
import { useCookieListener } from '@/hooks/useCookieListener';
import { useDebounce } from '@/hooks/useDebounce';
import { useDeviceOS } from '@/hooks/useDeviceOS';
import { useEventListener } from '@/hooks/useEventListener';
import { useFavicon } from '@/hooks/useFavicon';
import { useFirstRender } from '@/hooks/useFirstRender';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useHold } from '@/hooks/useHold';
import { useHover } from '@/hooks/useHover';
import { useIdle } from '@/hooks/useIdle';
import { useInputValue } from '@/hooks/useInputValue';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useInterval } from '@/hooks/useInterval';
import { useKeyPress } from '@/hooks/useKeyPress';
import { useLeaveDetection } from '@/hooks/useLeaveDetection';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useNetwork } from '@/hooks/useNetwork';
import { useOrientation } from '@/hooks/useOrientation';
import { usePermission } from '@/hooks/usePermission';
import { usePreventBodyScroll } from '@/hooks/usePreventBodyScroll';
import { usePrevious } from '@/hooks/usePrevious';
import { useScrollDevice } from '@/hooks/useScrollDevice';
import { useTitle } from '@/hooks/useTitle';
import { useTimer } from '@/hooks/useTimer';
import { useWindowSize } from '@/hooks/useWindowSize';

function BatteryIndicator() {
    const { level, isCharging } = useBatteryStatus();

    return (
        <div className="p-4 border rounded-md">
            <p>🔋 Battery Level: {level}%</p>
            <p>{isCharging ? '⚡ Charging' : '🔌 Not Charging'}</p>
        </div>
    );
}

function Dropdown() {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useClickOutside(ref, () => setOpen(false));

    return (
        <div>
            <button onClick={() => setOpen((prev) => !prev)}>
                Toggle Dropdown
            </button>
            {open && (
                <div ref={ref} className="absolute bg-white border p-4 shadow">
                    <p>This is the dropdown content.</p>
                </div>
            )}
        </div>
    );
}

function CopyInvite() {
    const { copy, copied, error } = useClipboard({ timeout: 1500 });

    return (
        <div className="p-4 border rounded">
            <button onClick={() => copy('https://example.com/invite')}>
                Copy Invite Link
            </button>

            {copied && <p className="text-green-500">✅ Copied!</p>}
            {error && <p className="text-red-500">❌ {error.message}</p>}
        </div>
    );
}

function BlogEditor() {
    const [content, setContent] = useState('');
    const hasUnsavedChanges = content.length > 0;

    useConfirmExit(() => hasUnsavedChanges, 'You have unsaved changes!');

    return (
        <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog here..."
            className="w-full h-64 p-2 border"
        />
    );
}

function ThemeSwitcher() {
    // 解构时类型已明确：theme是string，setTheme是函数，deleteTheme是函数
    const [theme, setTheme, deleteTheme] = useCookie('theme', 'light');

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light'); // 正确，setTheme是函数
    };

    return (
        <div className={`app-container ${theme}`}>
            <p>Current theme: {theme}</p>
            <button onClick={toggleTheme}>Toggle Theme</button>
            <button onClick={deleteTheme}>Reset</button>
        </div>
    );
}

function CookieWatcher() {
    useCookieListener<string>(
        (value, key) => {
            console.log(`Cookie "${key}" changed to:`, value);
        },
        ['authToken', 'theme']
    );

    return <p>Watching cookie changes...</p>;
}

function SearchBox() {
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        if (debouncedQuery) {
            // Call API with debounced query
            console.log('Searching for:', debouncedQuery);
        }
    }, [debouncedQuery]);

    return (
        <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="border p-2 w-full"
        />
    );
}

function App() {
    const os = useDeviceOS();

    return (
        <p>
            You’re currently using: <strong>{os}</strong>
        </p>
    );
}

function EscapeListener() {
    useEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            console.log('Escape key pressed');
        }
    });

    // eslint-disable-next-line react/no-unescaped-entities
    return <p>Press "Escape" and check the console</p>;
}

function TaskStatus({ status }: { status: 'idle' | 'processing' | 'done' }) {
    const { setFavicon } = useFavicon('/icons/favicon-idle.ico');

    useEffect(() => {
        if (status === 'processing') setFavicon('/icons/processing.svg', 'image/svg+xml');
        else if (status === 'done') setFavicon('/icons/favicon-success.ico', 'image/svg+xml');
        else setFavicon('/favicon-idle.ico', 'image/svg+xml');
    }, [status, setFavicon]);

    return <p>Current status: {status}</p>;
}

function MyComponent({ value }) {
    const isFirst = useFirstRender();

    useEffect(() => {
        if (isFirst) return;

        console.log('Value changed:', value);
    }, [value, isFirst]);

    return <p>Value: {value}</p>;
}

function FullscreenBox() {
    const boxRef = useRef(null);
    const { isFullscreen, toggleFullscreen } = useFullscreen(boxRef);

    return (
        <div ref={boxRef} className="relative w-full h-64 bg-gray-200">
            <button onClick={toggleFullscreen} className="absolute top-2 right-2">
                {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            </button>
            <p className="p-4">This box can go fullscreen!</p>
        </div>
    );
}

function HoldButton() {
    const holdHandlers = useHold(() => {
        alert('Long press activated!');
    }, { delay: 800 });

    return (
        <button
            {...holdHandlers}
            className="p-4 border rounded bg-blue-100 hover:bg-blue-200"
        >
            Hold Me
        </button>
    );
}

function HoverCard() {
    const { ref, hovered } = useHover();

    return (
        <div
            ref={ref as any}
            className={`p-6 rounded-md shadow-md transition-all ${hovered ? 'bg-blue-100 scale-105' : 'bg-white'
                }`}
        >
            <p>{hovered ? 'Hovered!' : 'Hover me!'}</p>
        </div>
    );
}

function IdleDetector() {
    const isIdle = useIdle(10000); // 10 seconds

    return (
        <div className="p-6 border rounded-md">
            <h2>User status: {isIdle ? 'Idle 😴' : 'Active 🏃‍♂️'}</h2>
        </div>
    );
}

function NameField() {
    const [name, onChange] = useInputValue('');

    return <input type="text" value={name} onChange={onChange} />;
}

function FadeInSection() {
    const { observeRef, isVisible } = useIntersectionObserver({ animateOnce: true });

    return (
        <div
            ref={observeRef as any}
            className={`transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'
                }`}
        >
            <h2>This section fades in on scroll</h2>
        </div>
    );
}

function Timer() {
    const { start, stop } = useInterval(() => {
        console.log('Runs every second!');
    }, 1000);

    return (
        <div>
            <button onClick={() => start()}>Start</button>
            <button onClick={stop}>Stop</button>
        </div>
    );
}

function ShortcutModal() {
    const [open, setOpen] = useState(false);

    useKeyPress(['Control', '/'], () => {
        setOpen((prev) => !prev);
    });

    return (
        <div>
            <p>Press Ctrl + / to toggle modal</p>
            {open && <div className="modal">Shortcut modal is open</div>}
        </div>
    );
}

function ExitIntentModal() {
    const [show, setShow] = useState(false);

    useLeaveDetection(() => {
        setShow(true);
    });

    return show ? (
        <div className="fixed top-10 right-10 bg-white p-4 shadow-lg">
            <p>Wait! Get 10% off your next order!</p>
        </div>
    ) : null;
}

function ThemeToggle() {
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

    return (
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            Current: {theme}
        </button>
    );
}

function CursorTracker() {
    const { x, y } = useMousePosition();

    return <p>Mouse Position: {x}px, {y}px</p>;
}

function ResponsiveBanner() {
    const isLargeScreen = useMediaQuery('(min-width: 1024px)', false);

    return (
        <div className="p-4 bg-gray-100">
            {isLargeScreen ? (
                <p>Welcome to our desktop experience ✨</p>
            ) : (
                <p>Mobile view activated 📱</p>
            )}
        </div>
    );
}

function NetworkStatus() {
    const isOnline = useNetwork();

    return !isOnline ? (
        <div className="bg-yellow-100 text-yellow-800 p-2 text-center">
            ⚠️ You’re currently offline. Changes may not be saved.
        </div>
    ) : null;
}

function OrientationNotice() {
    const orientation = useOrientation();

    return (
        <div className="p-4">
            <p>Your screen is currently in <strong>{orientation}</strong> mode.</p>
            {orientation === 'landscape' && (
                <p className="text-sm text-gray-500">
                    Tip: Rotate to portrait for easier reading.
                </p>
            )}
        </div>
    );
}

function ClipboardFeature() {
    const clipboardPermission = usePermission('clipboard-read');

    if (clipboardPermission === 'not-supported') {
        return <p>Your browser doesn’t support this feature.</p>;
    }

    if (clipboardPermission === 'denied') {
        return <p>Please enable clipboard access to use this feature.</p>;
    }

    return <button>Read from Clipboard</button>;
}

function Modal({ isOpen, onClose }) {
    const { setIsScrollLocked } = usePreventBodyScroll();

    useEffect(() => {
        setIsScrollLocked(isOpen);
    }, [isOpen, setIsScrollLocked]);

    return isOpen ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded">
                <p>This is a modal.</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    ) : null;
}

function Counter() {
    const [count, setCount] = useState(0);
    const prevCount = usePrevious(count);

    return (
        <div>
            <p>Current: {count}</p>
            <p>Previous: {prevCount}</p>
            <button onClick={() => setCount((c) => c + 1)}>Increment</button>
        </div>
    );
}

function ScrollAwareComponent() {
    const device = useScrollDevice();

    return (
        <div>
            {device === 'mouse' && <p>You’re using a mouse wheel 🖱️</p>}
            {device === 'trackpad' && <p>You’re using a trackpad 👆</p>}
        </div>
    );
}

function Clock() {
    const { time, isRunning, start, pause, reset } = useTimer({
        startTime: 0,
        endTime: 10,
        interval: 1000,
    });

    return (
        <div>
            <h2>Timer: {time}s</h2>
            <button onClick={start}>Start</button>
            <button onClick={pause}>Pause</button>
            <button onClick={reset}>Reset</button>
        </div>
    );
}

function ProfilePage() {
    useTitle('My Profile | DevPortal');

    return <div>Welcome to your profile</div>;
}

function ResponsiveComponent() {
    const { width, height } = useWindowSize();

    return (
        <div>
            <p>Window Width: {width}px</p>
            <p>Window Height: {height}px</p>

            {width < 768 && 'MobileMenu'}
            {width >= 768 && 'DesktopNav'}
        </div>
    );
}

function Demo() {
    return (
        <div>
            <BatteryIndicator />
            <Dropdown />
            <CopyInvite />
            <BlogEditor />
            <ThemeSwitcher />
            <CookieWatcher />
            <SearchBox />
            <App />
            <EscapeListener />
            <TaskStatus status='processing' />
            <MyComponent value="hello world" />
            <FullscreenBox />
            <HoldButton />
            <HoverCard />
            <IdleDetector />
            <NameField />
            <FadeInSection />
            <Timer />
            <ShortcutModal />
            <ExitIntentModal />
            <ThemeToggle />
            <ResponsiveBanner />
            <CursorTracker />
            <NetworkStatus />
            <OrientationNotice />
            <ClipboardFeature />
            {/* <Modal isOpen="true" onClose={() => alert('hello')} /> */}
            <Counter />
            <ScrollAwareComponent />
            <Clock />
            <ProfilePage />
            <ResponsiveComponent />
        </div>
    )
}

export default Demo