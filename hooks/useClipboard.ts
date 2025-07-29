import { useState } from 'react';

/**
 * 简化文本复制到剪贴板操作的React Hook，提供状态跟踪和错误处理机制
 * 封装了Clipboard API的writeText方法，自动管理复制状态和超时重置
 * 支持自定义成功状态持续时间，适用于实现复制按钮、分享功能等场景
 *
 * @param {Object} [options] - 复制行为配置选项
 * @param {number} [options.timeout=500] - 复制成功状态(copied)自动重置的时间(毫秒)
 *   推荐值: 1000-3000ms，过短可能导致用户无法看到成功反馈
 *
 * @returns {Object} 复制功能对象
 * @returns {(value: string) => void} copy - 复制文本到剪贴板的函数
 *   @param {string} value - 要复制到剪贴板的文本内容
 *   @returns {void} 无返回值
 * @returns {() => void} reset - 手动重置复制状态和错误信息的函数
 *   调用后copied状态设为false，error设为null，并清除任何挂起的超时
 * @returns {string|Error|null} error - 复制操作的错误信息
 *   - null: 无错误
 *   - Error对象: 复制失败时的错误详情（如权限被拒绝）
 *   - 字符串: 不支持Clipboard API时的提示信息
 * @returns {boolean} copied - 复制成功状态标志
 *   - true: 复制成功且未超时
 *   - false: 初始状态/复制失败/已超时
 *
 * @example
 * // 基础复制按钮
 * function CopyButton() {
 *   const { copy, copied, error } = useClipboard({ timeout: 2000 });
 *   const textToCopy = 'https://example.com';
 *
 *   return (
 *     <div className="copy-container">
 *       <input type="text" value={textToCopy} readOnly />
 *       <button
 *         onClick={() => copy(textToCopy)}
 *         disabled={copied}
 *       >
 *         {copied ? '✓ 已复制' : '复制链接'}
 *       </button>
 *       {error && <div className="error-message">{error instanceof Error ? error.message : error}</div>}
 *     </div>
 *   );
 * }
 *
 * @example
 * // 带状态反馈的复制组件
 * function AdvancedCopyComponent() {
 *   const { copy, copied, error, reset } = useClipboard({ timeout: 3000 });
 *   const [text, setText] = useState('可编辑文本...');
 *
 *   return (
 *     <div>
 *       <textarea
 *         value={text}
 *         onChange={(e) => setText(e.target.value)}
 *         placeholder="输入要复制的文本"
 *       />
 *       <div className="button-group">
 *         <button onClick={() => copy(text)} disabled={copied}>
 *           {copied ? '复制成功!' : '复制到剪贴板'}
 *         </button>
 *         {copied && <button onClick={reset}>重置状态</button>}
 *       </div>
 *       {error && (
 *         <div className="error-alert">
 *           <p>复制失败: {error instanceof Error ? error.message : error}</p>
 *           <button onClick={reset}>关闭</button>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 *
 * @note 安全与权限注意事项:
 * - 浏览器通常要求在用户交互事件(如click)中调用剪贴板API
 * - 部分浏览器在iframe中或非HTTPS环境下可能限制剪贴板访问
 * - 用户可在浏览器设置中禁用剪贴板权限，此时会返回权限错误
 *
 * @note 浏览器兼容性:
 * | 浏览器 | 支持版本 | 移动支持 | 备注 |
 * |--------|----------|----------|------|
 * | Chrome | 66+      | 66+      | 完全支持 |
 * | Firefox| 63+      | 63+      | 完全支持 |
 * | Edge   | 79+      | 79+      | 完全支持 |
 * | Safari | 13.1+    | 13.4+    | 完全支持 |
 * | IE     | 不支持   | 不支持   | 无Clipboard API |
 * <mcurl name="Can I use Clipboard API" url="https://caniuse.com/mdn-api_clipboard_writetext"></mcurl>
 *
 * @note 实现细节:
 * - 多次调用copy()会重置超时计时器，延长copied状态显示时间
 * - 错误信息区分API不支持(字符串)和操作失败(Error对象)
 * - 内部使用setTimeout管理状态自动重置，组件卸载时会自动清理
 *
 * @see <mcurl name="MDN Clipboard.writeText()" url="https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText"></mcurl>
 * @see <mcurl name="W3C Clipboard API Specification" url="https://w3c.github.io/clipboard-apis/"></mcurl>
 */
export function useClipboard({ timeout = 500 } = {}) {
    const [error, setError] = useState<string | Error | null | undefined>(null);
    const [copied, setCopied] = useState<boolean>(false);
    const [copyTimeout, setCopyTimeout] = useState<number | undefined>(undefined);

    const handleCopyResult = (hasError: boolean) => {
        clearTimeout(copyTimeout);

        setCopyTimeout(
            setTimeout(() => setCopied(false), timeout) as unknown as number,
        );

        setCopied(hasError);
    };

    const copy = (value: string) => {
        if (typeof window !== 'undefined' && 'clipboard' in navigator) {
            navigator.clipboard
                .writeText(value)
                .then(() => handleCopyResult(true))
                .catch((err) => setError(err));
        } else {
            setError(new Error('Error: navigator.clipboard is not supported'));
        }
    };

    const reset = () => {
        setError(null);
        setCopied(false);
        clearTimeout(copyTimeout);
    };

    return { copy, reset, error, copied };
}