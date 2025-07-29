import { useRef } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/**
 * 跟踪值的先前状态的React Hook，在值变化时更新存储的先前值
 * 
 * @template T - 要跟踪的值的类型
 * @param {T} value - 当前值，每次变化时会更新先前值
 * @returns {T} 上一次渲染时的值，首次渲染时返回初始value
 * 
 * @example
 * function Counter() {
 *   const [count, setCount] = useState(0);
 *   const prevCount = usePrevious(count);
 *   
 *   return (
 *     <div>
 *       Current: {count}, Previous: {prevCount}
 *       <button onClick={() => setCount(c => c + 1)}>Increment</button>
 *     </div>
 *   );
 * }
 * 
 * @note 使用{@link useIsomorphicLayoutEffect}确保在DOM更新后立即同步先前值，适用于SSR环境
 */
export const usePrevious = <T>(value: T): T => {
    const ref = useRef(value)

    useIsomorphicLayoutEffect(() => {
        ref.current = value
    }, [value])

    return ref.current
}