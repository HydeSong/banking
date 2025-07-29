import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/**
 * 设置文档标题的React Hook
 * @param {string} title - 要设置的文档标题字符串
 * @example
 * // 设置标题为"首页"
 * useTitle('首页');
 */
export function useTitle(title: string) {
    useIsomorphicLayoutEffect(() => {
        if (typeof title === 'string' && title.trim().length > 0) {
            document.title = title.trim();
        }
    }, [title]);
}