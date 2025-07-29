import { useEffect, useState } from 'react';

/**
 * 跟踪DOM元素尺寸变化的React Hook，使用ResizeObserver API实现精确尺寸监测
 * 自动响应元素大小变化（包括内容变化、样式修改等引起的尺寸改变）
 * 
 * @template T - DOM元素类型，默认为HTMLElement
 * @param {React.RefObject<T>} ref - 指向要监测尺寸的DOM元素的React ref对象
 * @returns {{width: number, height: number}} 元素当前尺寸对象:
 *   - width: 元素宽度(像素)
 *   - height: 元素高度(像素)
 *   - 初始状态(未挂载或ref未指向元素)返回{width: 0, height: 0}
 * 
 * @example
 * // 基础用法 - 跟踪div尺寸
 * function ResizableComponent() {
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   const { width, height } = useSize(containerRef);
 *   
 *   return (
 *     <div ref={containerRef}>
 *       <p>Container Size: {width}x{height}px</p>
 *     </div>
 *   );
 * }
 * 
 * @example
 * // 响应式组件示例
 * function ResponsiveImage() {
 *   const imageRef = useRef<HTMLImageElement>(null);
 *   const { width } = useSize(imageRef);
 *   
 *   return (
 *     <div>
 *       <img
 *         ref={imageRef}
 *         src="responsive-image.jpg"
 *         style={{ width: '100%', height: 'auto' }}
 *       />
 *       {width > 800 && <p>Large image mode</p>}
 *       {width <= 800 && width > 400 && <p>Medium image mode</p>}
 *       {width <= 400 && <p>Small image mode</p>}
 *     </div>
 *   );
 * }
 * 
 * @note 实现细节:
 *   - 使用ResizeObserver API监测元素尺寸变化，性能优于window.resize事件
 *   - 组件卸载时自动断开观察，避免内存泄漏
 *   - 初始渲染时若ref未就绪，返回{width: 0, height: 0}
 *   - 支持任意DOM元素类型(div, img, canvas等)
 * 
 * @warning 浏览器兼容性:
 *   - ResizeObserver API在IE中不支持，需要考虑polyfill
 *   - ref必须指向实际DOM元素，非DOM元素(如React组件)将无法正常工作
 * 
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/ResizeObserver ResizeObserver文档
 */
export const useSize = (ref: any) => {
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        const updateDimensions = () => {
            const { clientWidth, clientHeight } = ref.current;
            setDimensions({ width: clientWidth, height: clientHeight });
        };

        const resizeObserver = new ResizeObserver(updateDimensions);

        updateDimensions();

        resizeObserver.observe(ref.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [ref.current]);

    return dimensions;
};