import { useMediaQuery } from "./useMediaQuery";

/**
 * 获取系统主题偏好的Hook
 * @param {'light'|'dark'} initialValue - 初始主题值
 * @returns {'light'|'dark'} 当前系统偏好的主题
 * @note 基于prefers-color-scheme媒体查询实现
 */
export function usePrefersTheme(initialValue: 'light' | 'dark') {
    return useMediaQuery('(prefers-color-scheme: dark)', initialValue === 'dark')
        ? 'dark'
        : 'light';
}