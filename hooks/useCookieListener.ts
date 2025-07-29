import { useRef } from 'react';

import { parseToCookieType, getCookies, parseToDataType } from '../helpers/cookie';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/**
 * 监听指定Cookie变化的React Hook，通过定时轮询机制检测Cookie值更新
 * 当监听的Cookie值发生变化时，自动解析值并触发回调函数
 * 适用于需要跨组件同步Cookie状态的场景
 *
 * @template T - Cookie值解析后的类型，支持：
 *   - 基本类型：string、number、boolean
 *   - 复杂类型：JSON可序列化对象（通过JSON.parse/stringify自动转换）
 *   - null/undefined：表示Cookie不存在
 *
 * @param {(value: T, key: string) => void} effect - Cookie变化时执行的回调函数
 *   @param {T} value - 解析后的Cookie新值，类型由T指定
 *   @param {string} key - 发生变化的Cookie名称
 * @param {string[]} cookies - 需要监听的Cookie名称数组
 *   格式：['cookieName1', 'cookieName2']
 *   为空数组时不监听任何Cookie
 *
 * @example
 * // 基础用法 - 监听单个Cookie
 * function ThemeSync() {
 *   useCookieListener<string>(
 *     (value, key) => {
 *       console.log(`主题Cookie ${key}已更新为:`, value);
 *       // 执行主题同步逻辑...
 *     },
 *     ['theme']
 *   );
 *   return null;
 * }
 *
 * @example
 * // 高级用法 - 监听多个Cookie并处理不同类型
 * interface UserState {
 *   isLoggedIn: boolean;
 *   permissions: string[];
 * }
 *
 * function AppStateManager() {
 *   useCookieListener<UserState>(
 *     (value, key) => {
 *       switch(key) {
 *         case 'userState':
 *           console.log('用户状态更新:', value);
 *           break;
 *         case 'notifications':
 *           console.log('通知设置更新:', value);
 *           break;
 *       }
 *     },
 *     ['userState', 'notifications'] // 监听两个Cookie
 *   );
 *   return null;
 * }
 *
 * @note 实现机制:
 * - 轮询检测: 使用setInterval每1000ms(1秒)检查一次Cookie值
 * - 变化检测: 通过比较解析后的Cookie值判断是否变化
 * - 初始状态: 组件挂载时立即获取一次当前Cookie值
 * - 清理机制: 组件卸载时自动清除定时器，防止内存泄漏
 * - SSR支持: 使用<mcsymbol name="useIsomorphicLayoutEffect" filename="useIsomorphicLayoutEffect.ts" path="/Users/hyde/Documents/Workspace/banking/hooks/useIsomorphicLayoutEffect.ts" startline="1"></mcsymbol>确保在浏览器环境执行
 *
 * @note 性能考虑:
 * - 轮询间隔固定为1秒，不可配置
 * - 仅监听指定Cookie，减少不必要的计算
 * - 建议: 避免在同一页面多次使用此Hook监听相同Cookie
 * - 替代方案: 对于高频变化的状态，考虑使用Context或状态管理库
 *
 * @note 数据解析流程:
 * 1. 使用parseToCookieType()从原始Cookie值提取类型信息
 * 2. 通过parseToDataType<T>()将原始值转换为指定类型T
 * 3. 比较解析前后的值，不同则触发effect回调
 * <mcfile name="cookie.ts" path="/Users/hyde/Documents/Workspace/banking/helpers/cookie.ts"></mcfile>
 *
 * @warning 由于浏览器安全限制，无法直接监听Cookie变化事件，
 *   此Hook使用轮询机制实现，可能存在最多1秒的延迟
 */
export const useCookieListener = <T>(
    effect: (a: T, b: string) => void,
    cookies: string[],
) => {
    const cookieValues = useRef<Record<string, unknown>>(getCookies(cookies));

    useIsomorphicLayoutEffect(() => {
        const cookieOnChange = () => {
            const currentCookiesValues = getCookies(cookies);

            Object.entries(cookieValues.current).forEach(
                ([cookieKey, cookieValue]) => {
                    const currentCookie = currentCookiesValues[cookieKey];

                    if (
                        parseToCookieType(currentCookie) !== parseToCookieType(cookieValue)
                    ) {
                        cookieValues.current = {
                            ...cookieValues.current,
                            [cookieKey]: currentCookie,
                        };

                        const parsedValue = parseToDataType<T>(
                            parseToCookieType(currentCookie),
                        );
                        if (parsedValue !== undefined) {
                            effect(parsedValue, cookieKey);
                        }
                    }
                },
            );
        };

        const cookieInterval = setInterval(cookieOnChange, 1000);

        return () => {
            clearInterval(cookieInterval);
        };
    }, [effect, cookies]);
};