import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 检测元素悬停状态的Hook，通过鼠标事件监听实现
 * @returns {Object} 包含ref和悬停状态的对象
 * @returns {React.RefObject<HTMLElement|null>} ref - 需要监听悬停的元素引用，必须绑定到DOM元素
 * @returns {boolean} hovered - 元素是否处于悬停状态
 * @example
 * const { ref, hovered } = useHover();
 * return (
 *   <div ref={ref}>
 *     {hovered ? '鼠标悬停中' : '鼠标未悬停'}
 *   </div>
 * );
 * @note 内部使用mouseenter和mouseleave事件监听，自动处理事件解绑
 * @see 仅支持鼠标事件，不包含触摸设备的悬停检测
 */
export function useHover() {
    const [hovered, setHovered] = useState(false);
    const ref = useRef<EventTarget | null>(null);
    const onMouseEnter = useCallback(() => setHovered(true), []);
    const onMouseLeave = useCallback(() => setHovered(false), []);

    useEffect(() => {
        if (ref.current) {
            ref.current.addEventListener('mouseenter', onMouseEnter);
            ref.current.addEventListener('mouseleave', onMouseLeave);

            return () => {
                ref.current?.removeEventListener('mouseenter', onMouseEnter);
                ref.current?.removeEventListener('mouseleave', onMouseLeave);
            };
        }

        return undefined;
    }, []);

    return { ref, hovered };
}