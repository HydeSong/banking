import { useState, useEffect, useRef } from 'react';

interface UseTimerProps {
    startTime?: number;
    endTime?: number;
    interval?: number;
}

interface UseTimerReturn {
    time: number;
    isRunning: boolean;
    start: () => void;
    pause: () => void;
    reset: () => void;
}

const validateInputs = (
    startTime?: number,
    endTime?: number,
    interval?: number,
) => {
    if (
        typeof startTime !== 'number' ||
        (endTime !== undefined && typeof endTime !== 'number')
    ) {
        throw new Error('startTime and endTime must be numbers');
    }
    if (interval !== undefined && interval <= 0) {
        throw new Error('Interval must be a positive number');
    }
};

/**
 * 提供倒计时/正计时功能的React Hook，支持开始、暂停和重置操作
 * 可配置起始时间、结束时间和更新间隔，到达结束时间时自动停止
 * 
 * @param {Object} options - 计时器配置选项
 * @param {number} [options.startTime=0] - 起始时间(秒)，默认为0
 * @param {number} [options.endTime] - 结束时间(秒)，未提供时将无限制计时
 * @param {number} [options.interval=1000] - 时间更新间隔(毫秒)，必须为正数
 * @returns {{time: number, isRunning: boolean, start: () => void, pause: () => void, reset: () => void}} 计时器状态和控制函数:
 *   - time: 当前时间(秒)
 *   - isRunning: 计时器运行状态
 *   - start: 开始或恢复计时
 *   - pause: 暂停计时
 *   - reset: 重置计时器到起始时间
 * 
 * @throws {Error} 当startTime或endTime不是数字，或interval不是正数时抛出错误
 * 
 * @example
 * // 正计时器(秒表)示例
 * function Stopwatch() {
 *   const { time, isRunning, start, pause, reset } = useTimer({
 *     startTime: 0
 *   });
 *   
 *   return (
 *     <div>
 *       <h1>{formatTime(time)}</h1>
 *       <button onClick={start} disabled={isRunning}>开始</button>
 *       <button onClick={pause} disabled={!isRunning}>暂停</button>
 *       <button onClick={reset}>重置</button>
 *     </div>
 *   );
 * }
 * 
 * @example
 * // 倒计时器示例
 * function CountdownTimer() {
 *   const { time, isRunning, start, pause, reset } = useTimer({
 *     startTime: 60, // 从60秒开始
 *     endTime: 0,    // 到0秒结束
 *     interval: 1000 // 每秒更新
 *   });
 *   
 *   return (
 *     <div>
 *       <h1>倒计时: {time}秒</h1>
 *       <button onClick={start} disabled={isRunning}>开始</button>
 *       <button onClick={pause} disabled={!isRunning}>暂停</button>
 *       <button onClick={reset}>重置</button>
 *     </div>
 *   );
 * }
 * 
 * @note 实现细节:
 *   - 当endTime < startTime时自动切换为倒计时模式
 *   - 使用setInterval实现时间更新，精度受浏览器事件循环影响
 *   - 组件卸载时自动清除interval，避免内存泄漏
 *   - 调用reset会将时间重置为startTime并暂停计时器
 */
export const useTimer = ({
    startTime = 0,
    endTime,
    interval = 1000,
}: UseTimerProps): UseTimerReturn => {
    validateInputs(startTime, endTime, interval);
    const [time, setTime] = useState<number>(startTime);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isCountingDown = endTime !== undefined && startTime > endTime;

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTime((prevTime) => {
                    const nextTime = isCountingDown ? prevTime - 1 : prevTime + 1;

                    //  Stop timer when it reaches the endTime
                    if (
                        (isCountingDown &&
                            nextTime <= (endTime ?? Number.NEGATIVE_INFINITY)) ||
                        (!isCountingDown &&
                            nextTime >= (endTime ?? Number.POSITIVE_INFINITY))
                    ) {
                        clearInterval(timerRef.current!);
                        setIsRunning(false); // Ensure timer stops
                        return endTime!;
                    }

                    return nextTime;
                });
            }, interval);
        } else {
            // Clear timer when paused or stopped
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, endTime, interval, isCountingDown]);

    const start = () => {
        if (!isRunning) setIsRunning(true); // Prevent multiple starts
    };

    const pause = () => {
        if (isRunning) setIsRunning(false);
    };

    const reset = () => {
        setIsRunning(false);
        setTime(startTime); // Reset time to initial value
    };

    return { time, isRunning, start, pause, reset };
};