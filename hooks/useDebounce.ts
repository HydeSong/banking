import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number = 500) {
    const [debounced, setDebounced] = useState<T>(value);

    useEffect(() => {
        if (delay <= 0) {
            setDebounced(value);
            return;
        }
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}
