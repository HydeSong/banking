import { useEffect, useRef, useState } from 'react';

/**
 * 管理周期性定时器的Hook，支持动态控制定时器的启动、停止和延迟调整
 * @param {() => void} callback - 定时器触发的回调函数，每次间隔后执行
 * @param {number} initialDelay - 初始延迟时间(毫秒)，必须是非负数字（0表示立即启动）
 * @returns {Object} 包含控制定时器的方法
 * @returns {Function} start - 启动或重启定时器
 *   @param {number} [delay] - 可选延迟时间(毫秒)，覆盖初始值
 * @returns {Function} stop - 停止定时器，暂停后可通过start()重启
 * @throws {Error} 当callback不是函数时抛出：'Invalid parameter type. 'callback' should be a function'
 * @throws {Error} 当initialDelay为负数时抛出：'Invalid parameter type. 'initialDelay' should be a non-negative number'
 * @example
 * // 基础用法
 * function Timer() {
 *   const { start, stop } = useInterval(() => {
 *     console.log('每秒执行一次');
 *   }, 1000);
 *   return (
 *     <div>
 *       <button onClick={() => start()}>开始</button>
 *       <button onClick={() => stop()}>停止</button>
 *     </div>
 *   );
 * }
 * @example
 * // 动态调整延迟
 * function DynamicTimer() {
 *   const { start, stop } = useInterval(() => {
 *     console.log('执行任务');
 *   }, 1000);
 *   // 切换为2秒间隔
 *   return <button onClick={() => start(2000)}>切换为2秒间隔</button>;
 * }
 * @note 组件卸载时会自动清除定时器；回调函数更新不会重启定时器
 * @see 内部使用setInterval实现，通过useRef保存最新回调函数避免闭包问题
 */
export function useInterval(callback: () => void, initialDelay: number) {
    if (typeof callback !== 'function') {
        throw new Error(
            `Invalid parameter type. 'callback' should be a function but received ${typeof callback}`,
        );
    }

    if (typeof initialDelay !== 'number' || initialDelay < 0) {
        throw new Error(
            `Invalid parameter type. 'initialDelay' should be a non-negative number but received ${initialDelay}`,
        );
    }

    const savedCallback = useRef<(() => void) | null>(null);
    const isMounted = useRef(true);
    const [delay, setDelay] = useState<number | null>(null);

    // 记录组件卸载状态
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // 保存最新的回调函数
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // 设置定时器
    useEffect(() => {
        function tick() {
            if (isMounted.current && savedCallback.current) {
                savedCallback.current();
            }
        }

        if (delay !== null) {
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);

    // 启动定时器
    const start = (newDelay: number | null = initialDelay) => {
        if (newDelay !== null && (typeof newDelay !== 'number' || newDelay < 0)) {
            throw new Error(
                `Invalid delay value. Expected non-negative number or null, but received ${newDelay}`,
            );
        }
        setDelay(newDelay);
    };

    // 停止定时器
    const stop = () => {
        setDelay(null);
    };

    // 重置为初始延迟
    const reset = () => {
        setDelay(initialDelay);
    };

    return { start, stop, reset, isRunning: delay !== null };
}