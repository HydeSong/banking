import { useEffect, useRef, useCallback } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

type ValidEventTarget = HTMLElement | Document | Window | EventTarget | null;

/**
 * 安全管理DOM事件监听器的React Hook
 * 自动处理事件监听的添加/移除，支持动态更新处理函数，避免常见的内存泄漏问题
 * 适用于需要在组件生命周期内安全管理事件监听的场景
 *
 * @template {keyof GlobalEventHandlersEventMap} K - 事件名称类型，限制为标准DOM事件
 * @param {K} eventName - 事件名称
 *   标准事件: 'click' | 'resize' | 'scroll' | 'keydown' | 'mousemove' 等
 *   自定义事件: 如 'custom-event' (需扩展GlobalEventHandlersEventMap类型)
 *
 * @param {(event: GlobalEventHandlersEventMap[K]) => void} handler - 事件处理函数
 *   支持动态更新，无需手动解绑/重新绑定
 *   接收原生Event对象作为参数，类型自动匹配事件名称
 *
 * @param {React.RefObject<ValidEventTarget>} [element] - 事件监听目标元素的Ref对象
 *   - 默认值: window (监听全局事件)
 *   - 支持类型: HTMLElement | Document | Window | EventTarget | null
 *   - 注意: 确保Ref指向的元素在挂载后才添加监听
 *
 * @returns {void} 无返回值
 *
 * @example
 * // 基础用法 - 监听窗口滚动事件
 * function ScrollPosition() {
 *   const [scrollY, setScrollY] = useState(0);
 *
 *   useEventListener('scroll', (event) => {
 *     setScrollY(window.scrollY);
 *   });
 *
 *   return <div>滚动位置: {scrollY}px</div>;
 * }
 *
 * @example
 * // 元素监听 - 监听输入框键盘事件
 * function SearchInput() {
 *   const inputRef = useRef<HTMLInputElement>(null);
 *   const [searchTerm, setSearchTerm] = useState('');
 *
 *   useEventListener('input', (event) => {
 *     setSearchTerm(event.target.value);
 *   }, inputRef);
 *
 *   return <input ref={inputRef} placeholder="搜索..." />
 * }
 *
 * @example
 * // 高级用法 - 监听自定义事件
 * // 首先扩展事件类型(在types/index.d.ts中)
 * declare global {
 *   interface GlobalEventHandlersEventMap {
 *     'theme-change': CustomEvent<{ theme: string }>;
 *   }
 * }
 *
 * function ThemeListener() {
 *   useEventListener('theme-change', (event) => {
 *     console.log('主题变更为:', event.detail.theme);
 *     // 应用主题变更逻辑
 *   });
 *   return null;
 * }
 *
 * @example
 * // 动态处理函数 - 支持处理函数更新
 * function DynamicHandler() {
 *   const [count, setCount] = useState(0);
 *   const [message, setMessage] = useState('');
 *
 *   // 动态变化的处理函数
 *   const handleClick = () => {
 *     setMessage(`点击了 ${count} 次`);
 *   };
 *
 *   useEventListener('click', handleClick);
 *
 *   return (
 *     <div>
 *       <button onClick={() => setCount(c => c + 1)}>点击</button>
 *       <p>{message}</p>
 *     </div>
 *   );
 * }
 *
 * @note 实现机制:
 * - 处理函数持久化: 使用<mcsymbol name="useRef" filename="react.d.ts" path="node_modules/@types/react/index.d.ts" startline="1368"></mcsymbol>保存最新handler
 * - 事件监听优化: 使用<mcsymbol name="useCallback" filename="react.d.ts" path="node_modules/@types/react/index.d.ts" startline="1364"></mcsymbol>记忆事件监听函数
 * - 执行时机控制: 通过<mcsymbol name="useIsomorphicLayoutEffect" filename="useIsomorphicLayoutEffect.ts" path="/Users/hyde/Documents/Workspace/banking/hooks/useIsomorphicLayoutEffect.ts" startline="1"></mcsymbol>确保在浏览器环境执行
 * - 自动清理: 组件卸载或依赖变化时自动移除事件监听
 *
 * @note 事件监听选项:
 * 虽然当前版本未直接暴露options参数，但可通过事件处理函数间接实现常见需求:
 * - 被动监听: handler = (e) => { e.preventDefault = () => {}; ... }
 * - 事件委托: 将监听绑定到父元素，通过event.target判断触发源
 * - 捕获阶段: 在事件名称后添加':capture'后缀(如'click:capture')
 *
 * @note 性能优化:
 * - 避免在handler中使用内联函数，优先使用useCallback记忆
 * - 对于高频事件(如scroll/mousemove)，考虑添加节流/防抖处理
 * - 不需要时移除element参数，默认使用window可减少不必要的DOM查询
 *
 * @warning 注意事项:
 * - SSR兼容性: 确保在服务端渲染时不会访问window对象
 * - 元素可用性: 当element.current为null时不会添加监听
 * - 事件冒泡: 部分事件(如focus/blur)不冒泡，需使用捕获阶段或直接绑定到元素
 * - 内存管理: 即使组件卸载，手动创建的EventTarget仍需自行管理监听
 */
export function useEventListener(
    eventName: string,
    handler: (event: Event) => void,
    element?: React.RefObject<ValidEventTarget>,
) {
    const savedHandler = useRef(handler);
    const eventListener = useCallback((event: Event) => savedHandler.current(event), [savedHandler]);

    useIsomorphicLayoutEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {

        const targetElement = element?.current || window;

        if (!(targetElement && targetElement.addEventListener)) {
            return;
        }

        targetElement.addEventListener(eventName, eventListener);
        return () => {
            targetElement.removeEventListener(eventName, eventListener);
        };
    }, [eventName, element, eventListener]);
}