import { useState, useEffect, useCallback } from 'react';

export function useMediaQuery<T>(query: string, initialValue: T) {
    const [matches, setMatches] = useState<T>(() => {
        if (initialValue !== undefined) return initialValue;
        if (typeof window === 'undefined') return false as unknown as T;
        return window.matchMedia(query).matches as unknown as T;
    });

    const handleChange = useCallback((event: MediaQueryListEvent) => {
        setMatches(event.matches as unknown as T);
    }, []);

    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);
        mediaQueryList.addEventListener('change', handleChange);
        setMatches(mediaQueryList.matches as unknown as T);

        return () => {
            mediaQueryList.removeEventListener('change', handleChange);
        };
    }, [query, handleChange]);

    return matches;
}