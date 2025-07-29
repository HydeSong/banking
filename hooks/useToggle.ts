import { useState } from 'react';

/**
 * 用于在两个值之间切换的React Hook
 * @template T - 切换值的类型
 * @param {T} initialValue - 初始值
 * @param {[T, T]} options - 两个可选值组成的数组
 * @returns {[T, (value?: T) => void]} 包含当前值和切换函数的元组
 * @example
 * // 在布尔值之间切换
 * const [isActive, toggleActive] = useToggle(false, [false, true]);
 * toggleActive(); // 切换到另一个值
 * toggleActive(true); // 直接设置为true
 */
export function useToggle<T>(initialValue: T, options: [T, T]) {
    const [state, setState] = useState(initialValue);
    const handleToggle = () =>
        setState((current) => (current === options[0] ? options[1] : options[0]));

    const toggle = (value: T) =>
        typeof value !== 'undefined' ? setState(value) : handleToggle();

    return [state, toggle];
}
