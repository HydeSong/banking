import { useCallback, useState } from "react";
import { useEventListener } from "./useEventListener";

/**
 * 用于监听网络连接状态的Hook
 * @returns {boolean} 当前网络是否在线
 */
export function useNetwork() {
    const [isOnline, setIsOnline] = useState<boolean>(() => typeof window !== 'undefined' ? window.navigator.onLine : true);

    const handleOnline = useCallback(() => {
        setIsOnline(true);
    }, []);

    const handleOffline = useCallback(() => {
        setIsOnline(false);
    }, []);

    useEventListener('online', handleOnline);
    useEventListener('offline', handleOffline);

    return isOnline;
}