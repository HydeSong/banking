import { useState, useEffect, useRef } from 'react';

const defaultEvents = [
    'keypress',
    'mousemove',
    'touchmove',
    'click',
    'scroll',
] as const;
type DefaultEvent = (typeof defaultEvents)[number];
type Options = {
    events?: DefaultEvent[];
    initialState?: boolean;
};
const defaultOptions: Options = {
    events: [...defaultEvents],
    initialState: true,
};

/**
 * 检测用户闲置状态的Hook，通过监听用户交互事件判断活跃度
 * @param {number} timeout - 闲置超时时间(毫秒)，例如30000表示30秒
 * @param {Object} [options] - 配置选项
 * @param {string[]} [options.events] - 触发用户活动的事件列表，默认包括：
 *   ['keypress', 'mousemove', 'touchmove', 'click', 'scroll']
 * @param {boolean} [options.initialState=true] - 初始闲置状态，默认true(闲置)
 * @returns {boolean} 当前是否处于闲置状态：
 *   - true: 用户已闲置超过指定时间
 *   - false: 用户处于活动状态
 * @example
 * // 检测用户30秒闲置状态
 * const isIdle = useIdle(30000);
 * 
 * return (
 *   <div>
 *     {isIdle ? '用户已闲置' : '用户活动中'}
 *   </div>
 * );
 * @note 组件卸载时会自动清除所有事件监听，避免内存泄漏
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener DOM事件监听
 */
export function useIdle(timeout: number, options: Options = {}) {
    const { events, initialState }: Options = { ...defaultOptions, ...options };
    const [idle, setIdle] = useState(initialState);
    const timer = useRef<number | undefined>(undefined);

    useEffect(() => {
        const handleEvents = () => {
            setIdle(false);

            if (timer.current) {
                window.clearTimeout(timer.current);
            }

            timer.current = window.setTimeout(() => setIdle(true), timeout);
        };

        events?.forEach((event) => document.addEventListener(event, handleEvents));

        return () =>
            events?.forEach((event) =>
                document.removeEventListener(event, handleEvents),
            );
    }, [timeout]);

    return idle;
}