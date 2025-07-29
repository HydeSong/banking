import { useEffect, useRef, useState } from 'react';

/**
 * 跟踪鼠标位置的React Hook，支持全局坐标和相对元素坐标两种模式
 * 当提供目标元素时计算相对坐标，否则返回基于视口的全局坐标
 * 自动处理坐标边界，确保值非负并四舍五入为整数
 *
 * @returns {Object} 鼠标位置信息对象
 * @returns {React.RefObject} target - 用于相对坐标计算的目标元素引用
 * @returns {number} x - 鼠标X坐标（相对目标元素左上角或视口左上角）
 * @returns {number} y - 鼠标Y坐标（相对目标元素左上角或视口左上角）
 *
 * @example
 * // 全局鼠标位置跟踪
 * const { x, y } = useMousePosition();
 * return <div>鼠标位置: ({x}, {y})</div>;
 *
 * @example
 * // 相对元素的鼠标位置跟踪
 * const { target, x, y } = useMousePosition();
 * return (
 *   <div ref={target} style={{ width: '300px', height: '300px', border: '1px solid black' }}>
 *     鼠标在框内位置: ({x}, {y})
 *   </div>
 * );
 *
 * @note 坐标计算逻辑:
 * - 无目标元素时: 使用clientX/clientY获取视口坐标
 * - 有目标元素时: 计算相对于元素左上角的坐标，考虑元素滚动偏移
 * - 所有坐标值通过Math.max(0, ...)确保非负，并使用Math.round()取整
 *
 * @note 内部实现:
 * - 使用useRef存储目标元素引用，避免闭包问题
 * - 在useEffect中绑定mousemove事件，自动清理以防止内存泄漏
 * - 事件处理函数根据target.current是否存在动态切换坐标计算方式
 */
export function useMousePosition() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const { max } = Math;
    const target = useRef();

    const setMousePosition = (event: MouseEvent) => {
        if (target.current) {
            // @ts-ignore
            const r = event?.currentTarget?.getBoundingClientRect();
            const x = max(
                0,
                Math.round(
                    event.pageX - r.left - (typeof window !== 'undefined' ? (window.pageXOffset || window.scrollX) : 0),
                ),
            );
            const y = max(
                0,
                Math.round(
                    event.pageY - r.top - (typeof window !== 'undefined' ? (window.pageYOffset || window.scrollY) : 0),
                ),
            );
            setPosition({ x, y });
        } else setPosition({ x: event.clientX, y: event.clientY });
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const element = target?.current ? target.current : document;
        element.addEventListener('mousemove', setMousePosition);

        return () => element.removeEventListener('mousemove', setMousePosition);
    }, [target.current]);

    return { target, ...position };
}