import { useEffect, useRef, useState } from 'react';

/**
 * The useInterval hook takes in two parameters as arguments, first it takes a `callback` function
 * and second is the `initialDelay`.
 * It runs the callback function after every fixed interval of time.
 *
 * ```js
 * function Timer() {
 *   const { start, stop } = useInterval(() => {
 *     console.log('Runs every one second!')
 *   }, 1000)
 *
 *   return <div>useInterval</div>;
 * }
 * ```
 * @param {() => void} callback
 * The callback function does not take any input as argument and returns `void` on execution.
 * @param {number} initialDelay
 * It sets the time period after which the callback gets called.
 *
 *
 * @returns {{start: (delay?: number) => void, stop: () => void}}
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