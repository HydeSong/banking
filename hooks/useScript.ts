import { useEffect, useState } from 'react';

/**
 * 动态加载外部脚本并跟踪其加载状态的React Hook
 * 自动处理重复脚本注入，支持异步加载和加载状态管理
 * 
 * @param {string} src - 外部脚本的URL地址，为空字符串时返回'idle'状态
 * @returns {'idle' | 'loading' | 'ready' | 'error'} 脚本加载状态:
 *   - 'idle': 未指定脚本URL或未开始加载
 *   - 'loading': 脚本正在加载中
 *   - 'ready': 脚本加载成功并已准备就绪
 *   - 'error': 脚本加载失败
 * 
 * @example
 * // 基础用法 - 加载Google Analytics脚本
 * function AnalyticsComponent() {
 *   const status = useScript('https://www.google-analytics.com/analytics.js');
 *   
 *   useEffect(() => {
 *     if (status === 'ready') {
 *       // 脚本加载完成后初始化
 *       window.ga('create', 'UA-XXXXX-Y', 'auto');
 *     }
 *   }, [status]);
 *   
 *   return null; // 此组件不渲染任何内容
 * }
 * 
 * @example
 * // 状态处理示例
 * function ScriptLoader() {
 *   const scriptStatus = useScript('https://third-party-library.js');
 *   
 *   if (scriptStatus === 'loading') return <Spinner>Loading...</Spinner>;
 *   if (scriptStatus === 'error') return <ErrorMessage>Failed to load script</ErrorMessage>;
 *   if (scriptStatus === 'ready') return <LibraryComponent />;
 *   return null;
 * }
 * 
 * @note 实现细节:
 *   - 自动避免重复加载相同URL的脚本
 *   - 使用data-status属性跟踪脚本加载状态
 *   - 组件卸载时自动清理事件监听器
 *   - 脚本添加到document.body末尾，使用async模式加载
 */
export function useScript(src: string) {
    const [status, setStatus] = useState<string | null>(src ? 'loading' : 'idle');

    useEffect(() => {
        if (!src) {
            setStatus('idle');

            return;
        }

        let script: HTMLScriptElement | null = document.querySelector(
            `script[src="${src}"]`,
        );

        if (!script) {
            script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.setAttribute('data-status', 'loading');

            document.body.appendChild(script);

            const setAttributeFromEvent = (event: Event) => {
                script?.setAttribute(
                    'data-status',
                    event.type === 'load' ? 'ready' : 'error',
                );
            };

            script.addEventListener('load', setAttributeFromEvent);
            script.addEventListener('error', setAttributeFromEvent);
        } else {
            setStatus(script.getAttribute('data-status'));
        }

        const setStateFromEvent = (event: Event) =>
            setStatus(event.type === 'load' ? 'ready' : 'error');

        script.addEventListener('load', setStateFromEvent);
        script.addEventListener('error', setStateFromEvent);

        return () => {
            if (script) {
                script.removeEventListener('load', setStateFromEvent);
                script.removeEventListener('error', setStateFromEvent);
            }
        };
    }, [src]);

    return status;
}