import { useEffect } from 'react';

import { useFirstRender } from './useFirstRender';

/**
 * 只在依赖更新时执行的副作用Hook（跳过首次渲染）
 * @param {() => void | (() => void | undefined)} effect - 副作用函数，可返回清理函数
 * @param {ReadonlyArray<any>} deps - 依赖数组，变化时触发effect
 * @example
 * // 组件更新时记录日志
 * useUpdateEffect(() => {
 *   console.log('组件已更新');
 *   return () => console.log('清理副作用');
 * }, [data]);
 */
export function useUpdateEffect(
    effect: () => void | (() => void | undefined),
    deps: ReadonlyArray<any>,
) {
    const isFirstRender = useFirstRender();

    useEffect(() => {
        if (!isFirstRender) {
            return effect();
        }
    }, deps);
}