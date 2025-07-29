import { off, on } from '@/helpers/event';
import { useCallback, useRef, type MouseEvent, type TouchEvent } from 'react';

type EventType = MouseEvent | TouchEvent;
const isTouchEvent = (e: EventType): e is TouchEvent => 'touches' in e;

const preventDefault = (e: EventType) => {
    if (!isTouchEvent(e)) {
        return;
    }

    if (e.touches.length < 2 && e.preventDefault) {
        e.preventDefault();
    }
};

/**
 * 检测元素长按事件的React Hook，同时支持鼠标和触摸设备
 * 自动区分鼠标和触摸事件，提供统一的长按检测逻辑
 * 长按触发前移动或释放会取消检测，确保交互准确性
 *
 * @param {(e: MouseEvent|TouchEvent) => void} callback - 长按成功触发时执行的回调函数
 *   @param {MouseEvent|TouchEvent} e - 触发事件对象，包含事件类型和位置信息
 * @param {Object} [options] - 长按行为配置选项
 * @param {boolean} [options.doPreventDefault=true] - 是否阻止触摸事件默认行为
 *   - true: 阻止触摸时页面滚动/缩放，提高长按检测可靠性
 *   - false: 保留默认行为，可能导致长按检测不稳定
 * @param {number} [options.delay=1000] - 触发长按所需的最小按住时间(毫秒)
 *   - 推荐范围: 300-2000ms
 *   - 常用值: 500ms(短按), 1000ms(标准长按), 2000ms(长按确认)
 *
 * @returns {Object} 事件处理器集合，必须全部绑定到同一目标元素
 * @returns {Function} onMouseDown - 鼠标按下事件处理器，开始长按计时
 * @returns {Function} onTouchStart - 触摸开始事件处理器，开始长按计时
 * @returns {Function} onMouseUp - 鼠标释放事件处理器，取消长按计时
 * @returns {Function} onMouseLeave - 鼠标离开元素事件处理器，取消长按计时
 * @returns {Function} onTouchEnd - 触摸结束事件处理器，取消长按计时
 * @returns {Function} onTouchCancel - 触摸中断事件处理器，取消长按计时
 *
 * @example
 * // 基础用法 - 1秒长按触发
 * const { onMouseDown, onTouchStart, onMouseUp, onMouseLeave, onTouchEnd, onTouchCancel } = useHold(() => {
 *   alert('长按1秒成功！');
 * });
 *
 * @example
 * // 高级用法 - 自定义延迟和行为
 * const { onMouseDown, onTouchStart, onMouseUp, onMouseLeave, onTouchEnd, onTouchCancel } = useHold(
 *   (e) => {
 *     console.log('长按触发位置:', isTouchEvent(e) ? e.touches[0] : e);
 *     // 执行操作...
 *   },
 *   { delay: 800, doPreventDefault: false } // 800ms触发，不阻止默认行为
 * );
 *
 * @example
 * // 按钮组件集成
 * function LongPressButton() {
 *   const { onMouseDown, onTouchStart, onMouseUp, onMouseLeave, onTouchEnd, onTouchCancel } = useHold(() => {
 *     console.log('执行长按操作');
 *   }, { delay: 600 });
 *
 *   return (
 *     <button
 *       onMouseDown={onMouseDown}
 *       onTouchStart={onTouchStart}
 *       onMouseUp={onMouseUp}
 *       onMouseLeave={onMouseLeave}
 *       onTouchEnd={onTouchEnd}
 *       onTouchCancel={onTouchCancel}
 *       style={{ padding: '10px 20px' }}
 *     >
 *       长按600ms触发
 *     </button>
 *   );
 * }
 *
 * @note 事件处理机制:
 * - 开始: 鼠标按下(MouseDown)或触摸开始(TouchStart)时启动计时器
 * - 取消: 鼠标释放/离开或触摸结束/取消时清除计时器
 * - 触发: 计时达到设定delay且未取消时执行callback
 *
 * @note 触摸事件处理:
 * - 使用isTouchEvent类型守卫区分鼠标/触摸事件
 * - preventDefault仅在触摸事件且doPreventDefault=true时调用
 * - 仅在单指触摸(touches.length < 2)时阻止默认行为
 *
 * @note 内部实现细节:
 * - 使用useRef存储计时器ID，避免闭包陷阱
 * - 通过useCallback记忆事件处理函数，优化性能
 * - 使用@/helpers/event的on/off工具函数统一事件管理
 * - 组件卸载时自动清除计时器，防止内存泄漏
 *
 * @warning 所有返回的事件处理器必须绑定到同一元素，拆分绑定会导致功能异常
 * @see 相关工具: @/helpers/event 提供的事件绑定工具函数
 */
// Removed the extra closing comment tag that was causing "Expression expected" error. No code needed to be inserted here.
export const useHold = (
    callback: (e: EventType) => any,
    { doPreventDefault = true, delay = 1000 } = {},
) => {
    const timeout = useRef<number | undefined>();
    const target = useRef<EventTarget | undefined>();

    const start = useCallback(
        (event: EventType) => {
            if (doPreventDefault && event.target) {
                on(event.target, 'touchend', (e: Event) => {
                    if (isTouchEvent(e as unknown as EventType)) {
                        preventDefault(e as unknown as EventType);
                    }
                }, { passive: false });
                target.current = event.target;
            }

            timeout.current = setTimeout(
                () => callback(event),
                delay,
            ) as unknown as number;
        },
        [callback, delay, doPreventDefault],
    );

    const clear = useCallback(() => {
        timeout.current && clearTimeout(timeout.current);

        if (doPreventDefault && target.current) {
            off(target.current, 'touchend', (e: Event) => {
                if (isTouchEvent(e as unknown as EventType)) {
                    preventDefault(e as unknown as EventType);
                }
            });
        }
    }, [doPreventDefault]);

    return {
        onMouseDown: (e: MouseEvent) => start(e),
        onTouchStart: (e: TouchEvent) => start(e),
        onMouseUp: clear,
        onMouseLeave: clear,
        onTouchEnd: clear,
    };
};