import { useToggle } from './useToggle';

/**
 * 专门用于管理布尔值状态切换的React Hook，提供简洁的true/false状态控制
 * 是更通用的<mcsymbol name="useToggle" filename="useToggle.ts" path="/Users/hyde/Documents/Workspace/banking/hooks/useToggle.ts" startline="1"></mcsymbol>的布尔值专用版本
 * 自动处理状态切换逻辑，无需手动管理状态值，内部固定使用[false, true]作为切换选项
 *
 * @param {boolean} [initialValue=false] - 初始布尔状态值
 *   - true: 初始状态为开启/激活
 *   - false: 初始状态为关闭/未激活（默认值）
 *
 * @returns {[boolean, () => void]} 包含当前状态和切换函数的元组
 * @returns {boolean} 0 - 当前布尔状态值
 * @returns {() => void} 1 - 无参数状态切换函数，调用时在true和false之间切换
 *
 * @example
 * // 基础用法 - 默认初始值false
 * function ToggleButton() {
 *   const [isActive, toggleActive] = useBoolToggle();
 *
 *   return (
 *     <button onClick={toggleActive}>
 *       {isActive ? '已激活' : '未激活'}
 *     </button>
 *   );
 * }
 *
 * @example
 * // 自定义初始值true
 * function Modal() {
 *   const [isOpen, toggleOpen] = useBoolToggle(true); // 初始为打开状态
 *
 *   return (
 *     <> 
 *       <button onClick={toggleOpen}>关闭</button>
 *       {isOpen && <div className="modal">模态框内容</div>}
 *     </>
 *   );
 * }
 *
 * @example
 * // 结合条件渲染
 * function AccordionItem() {
 *   const [isExpanded, toggleExpand] = useBoolToggle();
 *
 *   return (
 *     <div className="accordion-item">
 *       <h3 onClick={toggleExpand}>
 *         标题 {isExpanded ? '▼' : '►'}
 *       </h3>
 *       {isExpanded && <div className="content">折叠面板内容</div>}
 *     </div>
 *   );
 * }
 *
 * @note 使用场景: 当只需要在true和false之间切换时，推荐使用此Hook替代useToggle，代码更简洁
 * @see 通用切换Hook: <mcsymbol name="useToggle" filename="useToggle.ts" path="/Users/hyde/Documents/Workspace/banking/hooks/useToggle.ts" startline="1"></mcsymbol>
 */
export const useBoolToggle = (initialValue = false) => {
    return useToggle(initialValue, [true, false]);
}