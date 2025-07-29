import { useState, useEffect, useCallback } from 'react';

/**
 * 用于监听媒体查询匹配状态的Hook
 * @template T - 返回值类型，通常为boolean
 * @param {string} query - 媒体查询字符串，如'(max-width: 768px)'或'(prefers-color-scheme: dark)'
 * @param {T} initialValue - 初始值，用于服务端渲染(SSR)时的默认状态，浏览器环境下会被实际匹配结果覆盖
 * @returns {T} 媒体查询当前匹配结果
 * @example
 * // 检测是否为移动设备视图
 * const isMobile = useMediaQuery('(max-width: 768px)', false);
 * // 检测系统深色模式偏好
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', false);
 * @note 依赖浏览器的matchMedia API，不支持的环境将始终返回初始值
 */
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