import { useCallback, useEffect, useRef, useState } from 'react';
import { useEventListener } from './useEventListener';

export function useLocalStorage<T>(key: string, initialValue: T) {
    const readValue = useCallback(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);

            return item ? parseJSON(item) : initialValue;
        } catch (error) {
            console.error(`Error getting storage key “${key}”:`, error);

            return initialValue;
        }
    }, [initialValue, key]);

    const [storedValue, setStoredValue] = useState(readValue);
    const setValue = useCallback((value: T | ((val: T) => T), onError?: (error: Error) => void) => {
    try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        window.localStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
        window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
        if (onError && error instanceof Error) onError(error);
        else console.warn(`Error setting localStorage key “${key}”:`, error);
    }
}, [key, storedValue]);

    useEffect(() => {
        setStoredValue(readValue());
    }, []);

    const handleStorageChange = useCallback(
    (_event: Event) => setStoredValue(readValue()),
    [readValue],
);
    useEventListener('storage', handleStorageChange);
    useEventListener('local-storage', handleStorageChange);
    return [storedValue, setValue];
}

function parseJSON(value: any) {
    try {
        return value === 'undefined' ? undefined : JSON.parse(value ?? '');
    } catch {
        return undefined;
    }
}