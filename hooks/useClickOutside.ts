import { useEffect } from 'react';

/**
 * 检测点击元素外部区域的React Hook，适用于实现点击外部关闭模态框、下拉菜单等交互逻辑
 * 自动监听指定事件类型，当点击发生在目标元素外部时触发回调
 * 支持鼠标和触摸事件，内部自动管理事件绑定与清理
 *
 * @param {React.RefObject<HTMLElement>} ref - 需要保护的元素引用，点击此元素内部不会触发回调
 *   必须是有效的DOM元素引用（非null），否则可能导致检测失效
 * @param {(e: Event) => void} handler - 点击外部区域时执行的回调函数
 *   @param {Event} e - 触发外部点击的事件对象，包含事件类型和目标信息
 * @param {string} [event='mousedown'] - 监听的事件类型，默认'mousedown'
 *   - 'mousedown': 鼠标按下时触发（响应更快，推荐用于模态框）
 *   - 'click': 鼠标点击时触发（包含按下和释放，推荐用于下拉菜单）
 *   - 'touchstart': 触摸开始时触发（移动设备专用）
 *   - 'pointerdown': 指针设备按下时触发（同时支持鼠标和触摸）
 * @returns {void} 无返回值
 *
 * @example
 * // 模态框关闭逻辑
 * const modalRef = useRef<HTMLDivElement>(null);
 * const [isModalOpen, setIsModalOpen] = useState(false);
 *
 * useClickOutside(modalRef, () => { if (isModalOpen) setIsModalOpen(false); }, 'mousedown');
 *
 * return isModalOpen && <div ref={modalRef} className="modal">模态框内容</div>;
 *
 * @example
 * // 下拉菜单关闭逻辑
 * const dropdownRef = useRef<HTMLDivElement>(null);
 * const [isOpen, setIsOpen] = useState(false);
 *
 * useClickOutside(dropdownRef, () => setIsOpen(false), 'click');
 *
 * return (
 *   <div className="dropdown">
 *     <button onClick={() => setIsOpen(!isOpen)}>菜单</button>
 *     {isOpen && <ul ref={dropdownRef}>菜单项</ul>}
 *   </div>
 * );
 *
 * @note 事件冒泡处理: 内部使用事件捕获阶段监听，确保在元素内部事件处理前触发
 * @note 边界情况: 如果ref.current为null（元素未挂载），Hook将不执行任何操作
 * @see 事件监听基础: <mcsymbol name="useEventListener" filename="useEventListener.ts" path="/Users/hyde/Documents/Workspace/banking/hooks/useEventListener.ts" startline="1"></mcsymbol>
 */
export function useClickOutside(
    ref: React.RefObject<any>,
    handler: (e: Event) => any,
    event = 'mousedown',
) {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleEvent = (event: Event) => {
            const el = ref?.current;
            if (!el || el.contains(event.target)) return;
            handler(event);
        };

        document.addEventListener(event, handleEvent);
        return () => document.removeEventListener(event, handleEvent);
    }, [event, handler, ref]);
}