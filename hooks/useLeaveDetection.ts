import { useEffect, useRef } from 'react';

/**
 * 检测鼠标离开页面视口的Hook
 * @param {(this: HTMLElement, ev: MouseEvent) => void} onLeave - 鼠标离开页面时触发的回调函数
 *   @this {HTMLElement} - 绑定为document.documentElement
 *   @param {MouseEvent} ev - 鼠标事件对象
 * @example
 * // 显示离开确认对话框
 * useLeaveDetection(() => {
 *   const leaveConfirmed = confirm('确定要离开此页面吗？');
 *   if (!leaveConfirmed) {
 *     console.log('用户取消离开');
 *   }
 * });
 * @note 仅检测鼠标离开页面视口的行为，不包括通过键盘导航、标签页切换等方式离开
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/mouseleave_event mouseleave事件文档
 */
export function useLeaveDetection(
    onLeave: (this: HTMLElement, ev: MouseEvent) => any,
) {
    const onLeaveRef = useRef(onLeave);

    useEffect(() => {
        onLeaveRef.current = onLeave;
    }, [onLeave]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handler = function (this: HTMLElement, ev: MouseEvent) {
            onLeaveRef.current.call(this, ev);
        };

        document.documentElement.addEventListener('mouseleave', handler);

        return () =>
            document.documentElement.removeEventListener('mouseleave', handler);
    }, []);
}
