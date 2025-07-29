/**
 * 同构版的布局副作用Hook，根据环境自动选择useLayoutEffect或useEffect
 * @description 在浏览器环境使用useLayoutEffect（DOM更新后同步执行），
 *   在服务端环境（如Next.js SSR）使用useEffect避免警告
 * @example
 * // 同构应用中安全使用布局副作用
 * useIsomorphicLayoutEffect(() => {
 *   // DOM操作代码
 *   document.title = '页面加载完成';
 * }, []);
 * @see https://reactjs.org/docs/hooks-reference.html#uselayouteffect React官方文档
 */
import { useEffect, useLayoutEffect } from 'react';

export const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;