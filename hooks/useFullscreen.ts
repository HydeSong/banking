import React, { useState, useEffect, useCallback } from 'react';

type DocumentWith<T> = Document & T;

/**
 * 管理DOM元素全屏模式的React Hook
 * 封装浏览器全屏API，提供简洁的全屏状态管理和控制方法
 * 自动处理浏览器前缀差异，支持状态同步和事件监听
 * 适用于视频播放器、演示文稿、图片查看器等需要全屏体验的场景
 *
 * @param {React.MutableRefObject<HTMLElement | null>} targetRef - 目标元素的Ref对象
 *   - 必须指向有效的DOM元素（如<div>, <video>, <canvas>等）
 *   - 为null时无法进入全屏
 *   - 注意：iframe需要设置allowfullscreen属性才能使用全屏
 *
 * @returns {Object} 全屏控制对象
 * @returns {boolean} isFullscreen - 当前全屏状态
 *   true: 目标元素处于全屏模式
 *   false: 未处于全屏模式
 * @returns {Function} toggleFullscreen - 切换全屏状态的方法
 *   @returns {Promise<void>} 无返回值的Promise
 *   @throws {Error} 当浏览器不支持全屏API或目标元素无效时抛出
 *
 * @example
 * // 基础用法 - 全屏切换按钮
 * function FullscreenContainer() {
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
 *
 *   return (
 *     <div ref={containerRef} className="fullscreen-container">
 *       <h1>全屏演示</h1>
 *       <p>当前状态: {isFullscreen ? '全屏' : '窗口'}</p>
 *       <button
 *         onClick={toggleFullscreen}
 *         disabled={!containerRef.current}
 *       >
 *         {isFullscreen ? '退出全屏' : '进入全屏'}
 *       </button>
 *     </div>
 *   );
 * }
 *
 * @example
 * // 高级用法 - 视频播放器全屏控制
 * function VideoPlayer() {
 *   const videoRef = useRef<HTMLVideoElement>(null);
 *   const { isFullscreen, toggleFullscreen } = useFullscreen(videoRef);
 *   const [error, setError] = useState<string | null>(null);
 *
 *   const handleToggle = async () => {
 *     try {
 *       await toggleFullscreen();
 *       setError(null);
 *     } catch (err) {
 *       setError('全屏切换失败: ' + (err as Error).message);
 *     }
 *   };
 *
 *   return (
 *     <div className="video-player">
 *       <video
 *         ref={videoRef}
 *         src="demo.mp4"
 *         controls
 *         width="100%"
 *       />
 *       <button onClick={handleToggle}>
 *         {isFullscreen ? '退出全屏' : '进入全屏'}
 *       </button>
 *       {error && <div className="error">{error}</div>}
 *     </div>
 *   );
 * }
 *
 * @example
 * // 监听外部全屏变化
 * function FullscreenAwareComponent() {
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   const { isFullscreen } = useFullscreen(containerRef);
 *
 *   useEffect(() => {
 *     // 响应全屏状态变化
 *     if (isFullscreen) {
 *       console.log('进入全屏模式，隐藏导航栏');
 *       document.body.classList.add('fullscreen-mode');
 *     } else {
 *       console.log('退出全屏模式，显示导航栏');
 *       document.body.classList.remove('fullscreen-mode');
 *     }
 *   }, [isFullscreen]);
 *
 *   return <div ref={containerRef}>内容区域</div>;
 * }
 *
 * @note 实现机制:
 * - 浏览器前缀处理: 自动检测并使用浏览器特定前缀(moz, webkit, ms)
 * - 状态同步: 通过监听document的fullscreenchange事件更新状态
 * - 方法封装: 使用useCallback记忆toggle方法，避免不必要的重渲染
 * - 错误处理: 捕获全屏API调用可能抛出的异常(如权限不足、元素无效)
 *
 * @note 浏览器兼容性:
 * | 浏览器 | 基本支持 | 前缀 | 最低版本 |
 * |--------|----------|------|----------|
 * | Chrome | ✅ | webkit | 15+ |
 * | Firefox | ✅ | moz | 10+ |
 * | Safari | ✅ | webkit | 5.1+ |
 * | Edge | ✅ | webkit/无 | 12+ |
 * | IE | ❌ | ms | 不支持 |
 * | Opera | ✅ | webkit | 11.5+ |
 *
 * @note 全屏API限制:
 * - 必须由用户交互触发(如click, keydown事件处理程序中)
 * - 部分浏览器限制iframe中的全屏使用
 * - 全屏状态下可能无法访问某些键盘快捷键
 * - 不同浏览器对全屏样式的处理可能不同
 *
 * @warning 使用注意事项:
 * - 确保targetRef指向的元素已挂载，否则toggleFullscreen将失败
 * - 始终使用try/catch包裹toggleFullscreen调用，处理不支持全屏的情况
 * - 全屏状态可能被用户或其他脚本改变，本Hook会自动同步状态
 * - 视频元素全屏时，某些浏览器会显示内置控件覆盖自定义控件
 *
 * @see <mcurl name="MDN全屏API文档" url="https://developer.mozilla.org/zh-CN/docs/Web/API/Fullscreen_API"></mcurl>
 * @see <mcurl name="全屏API浏览器兼容性" url="https://caniuse.com/fullscreen"></mcurl>
 */
export function useFullscreen(
    targetRef: React.MutableRefObject<(Document & {}) | any>,
) {
    const [isFullscreen, setFullscreen] = useState(false);

    const toggleFullscreen = useCallback(() => {
        if (isFullscreen) {
            switch (true) {
                case 'exitFullscreen' in document:
                    document.exitFullscreen();
                    break;
                case 'mozCancelFullScreen' in document:
                    (
                        document as DocumentWith<{
                            mozCancelFullScreen: () => void;
                        }>
                    ).mozCancelFullScreen();
                    break;
                case 'webkitExitFullscreen' in document:
                    (
                        document as DocumentWith<{
                            webkitExitFullscreen: () => void;
                        }>
                    ).webkitExitFullscreen();
                    break;
                case 'msExitFullscreen' in document:
                    (
                        document as DocumentWith<{
                            msExitFullscreen: () => void;
                        }>
                    ).msExitFullscreen();
                    break;
                default:
                    console.log('Fullscreen API is not supported.');
                    break;
            }
        } else {
            if (targetRef.current) {
                switch (true) {
                    case 'requestFullscreen' in targetRef.current:
                        targetRef.current.requestFullscreen();
                        break;
                    case 'mozRequestFullScreen' in targetRef.current:
                        targetRef.current.mozRequestFullScreen();
                        break;
                    case 'webkitRequestFullscreen' in targetRef.current:
                        targetRef.current.webkitRequestFullscreen();
                        break;
                    case 'msRequestFullscreen' in targetRef.current:
                        targetRef.current.msRequestFullscreen();
                        break;
                    default:
                        console.log('Fullscreen API is not supported.');
                        break;
                }
            }
        }

        setFullscreen((prevState) => !prevState);
    }, [isFullscreen, targetRef]);

    const handleFullscreenChange = useCallback(() => {
        setFullscreen(!!document.fullscreenElement);
    }, []);

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [handleFullscreenChange]);

    return { isFullscreen, toggleFullscreen };
}