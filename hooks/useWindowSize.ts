import { useState, useEffect } from "react";

type WindowSizeProps = {
    width: number;
    height: number;
};

/**
 * 跟踪浏览器窗口尺寸变化的React Hook
 * 提供当前窗口的宽度和高度，并在窗口大小改变时自动更新
 * 
 * @returns {WindowSizeProps} 包含窗口尺寸的对象:
 *   - width: 窗口当前宽度(像素)
 *   - height: 窗口当前高度(像素)
 * 
 * @example
 * // 基础用法
 * function ResponsiveComponent() {
 *   const { width, height } = useWindowSize();
 *   
 *   return (
 *     <div>
 *       <p>窗口宽度: {width}px</p>
 *       <p>窗口高度: {height}px</p>
 *     </div>
 *   );
 * }
 * 
 * @example
 * // 响应式布局示例
 * function AdaptiveLayout() {
 *   const { width } = useWindowSize();
 *   const isMobile = width < 768;
 *   
 *   return (
 *     <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
 *       {isMobile ? <MobileContent /> : <DesktopContent />}
 *     </div>
 *   );
 * }
 * 
 * @note 实现细节:
 *   - 初始值使用window.innerWidth/window.innerHeight，SSR环境下默认为0
 *   - 使用resize事件监听窗口尺寸变化，自动更新状态
 *   - 组件卸载时自动移除事件监听，避免内存泄漏
 *   - 尺寸更新频率取决于浏览器的resize事件触发频率
 */
export const useWindowSize = (): WindowSizeProps => {
    const [windowSize, setWindowSize] = useState<WindowSizeProps>({
        width: window?.innerWidth || 0,
        height: window?.innerHeight || 0
    });

    useEffect(() => {
        const handleResize = () => {
            if (typeof window !== "undefined") {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight
                })
            }
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [])

    return windowSize;
}
