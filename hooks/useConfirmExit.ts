
import { off, on } from '@/helpers/event';
import { useCallback, useEffect } from 'react';

/**
 * 控制页面离开确认行为的React Hook，防止用户意外导航离开导致数据丢失
 * 通过beforeunload事件实现，当用户尝试关闭标签页、刷新页面或导航到其他URL时触发确认对话框
 * 支持动态启用/禁用控制，适用于表单编辑、文档创作等需要防止意外离开的场景
 *
 * @template {(boolean|(() => boolean))} T - 启用状态类型，支持布尔值或条件判断函数
 * @param {T} enabled - 控制确认功能的启用状态
 *   - boolean: 直接启用(true)或禁用(false)确认功能
 *   - () => boolean: 条件判断函数，返回true时启用确认，每次事件触发时重新计算
 *     适用于需要动态判断的场景（如表单是否有未保存更改）
 * @param {string} [message='Are you sure you want to exit?'] - 确认对话框提示消息
 *   注意：现代浏览器出于安全考虑可能会忽略此消息，显示浏览器默认文本
 *   参考: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#usage_notes
 * @returns {void} 无返回值
 *
 * @example
 * // 基础用法 - 状态变量控制
 * import { useState } from 'react';
 * function EditForm() {
 *   const [unsavedChanges, setUnsavedChanges] = useState(false);
 *   const [content, setContent] = useState('');
 *
 *   useConfirmExit(unsavedChanges, '您有未保存的内容，确定要离开吗？');
 *
 *   return (
 *     <textarea
 *       value={content}
 *       onChange={(e) => {
 *         setContent(e.target.value);
 *         setUnsavedChanges(true);
 *       }}
 *     />
 *   );
 * }
 *
 * @example
 * // 高级用法 - 条件函数控制
 * import { useForm } from 'some-form-library';
 * function DocumentEditor() {
 *   const { formState, handleSubmit } = useForm();
 *   const { isDirty, isSubmitting } = formState;
 *
 *   // 仅当表单有更改且未在提交中时启用确认
 *   useConfirmExit(
 *     () => isDirty && !isSubmitting,
 *     '文档尚未保存，确定要离开编辑页面吗？'
 *   );
 *
 *   function saveDocument() {
 *     // 保存文档的逻辑
 *   }
 *
 *   return (
 *     <form onSubmit={handleSubmit(saveDocument)}>
 *       表单内容 
 *       <button type="submit" disabled={isSubmitting}>
 *         {isSubmitting ? '保存中...' : '保存文档'}
 *       </button>
 *     </form>
 *   );
 * }
 *
 * @note 浏览器行为差异:
 * | 浏览器 | 自定义消息支持 | 行为特点 |
 * |--------|--------------|---------|
 * | Chrome | ❌ 不支持 | 始终显示默认消息 |
 * | Firefox| ✅ 支持 | 显示自定义消息 |
 * | Safari | ❌ 不支持 | 始终显示默认消息 |
 * | Edge   | ❌ 不支持 | 始终显示默认消息 |
 * | IE     | ✅ 支持 | 显示自定义消息 |
 *
 * @note 实现细节:
 * - 使用beforeunload事件监听页面离开行为
 * - 通过@/helpers/event的on/off工具函数安全管理事件绑定
 * - 使用useCallback记忆事件处理函数，避免不必要的重渲染
 * - 组件卸载时自动移除事件监听，防止内存泄漏
 * - 当enabled为false或条件函数返回false时，不阻止页面离开
 *
 * @warning 此Hook无法阻止所有离开行为，特别是用户直接关闭浏览器窗口或标签页的情况
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
 * @see https://html.spec.whatwg.org/multipage/webappapis.html#the-beforeunload-event
 */

export function useConfirmExit(
    enabled: boolean | (() => boolean),
    message = 'Are you sure you want to exit?',
) {
    const handler = useCallback(
        (e: Event) => {
            const finalEnabled = typeof enabled === 'function' ? enabled() : true;

            if (!finalEnabled) {
                return;
            }

            e.preventDefault();

            // NOTE: modern browsers no longer support custom messages with .returnValue
            if (message) {
                // @ts-ignore
                e.returnValue = message;
            }

            return message;
        },
        [enabled, message],
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;
        on(window, 'beforeunload', handler);

        return () => {
            off(window, 'beforeunload', handler);
        };
    }, [handler]);
}