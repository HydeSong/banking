import { useEffect, useState, useRef } from "react";

type IntersectionObserverOptions = {
    threshold?: number | number[];
    rootMargin?: string;
};

type UseIntersectionObserverProps = {
    animateOnce?: boolean;
    options?: IntersectionObserverOptions;
};

type IntersectionObserverResult = {
    observeRef: React.MutableRefObject<Element | null>;
    isVisible: boolean;
}

/**
 * 使用Intersection Observer API检测元素可见性的Hook
 * 用于实现懒加载、滚动动画触发等场景
 * @param {Object} [props] - 配置参数
 * @param {boolean} [props.animateOnce=false] - 是否仅在首次可见后停止观察，
 *   设置为true可优化性能（观察一次后自动断开）
 * @param {IntersectionObserverOptions} [props.options={}] - Intersection Observer配置选项
 *   @param {number|number[]} [options.threshold=0] - 可见比例阈值，0~1或数组，
 *     例如[0, 0.5, 1]表示在元素0%、50%、100%可见时触发
 *   @param {string} [options.rootMargin='0px'] - 根元素边距，格式同CSS margin，
 *     用于扩展或缩小交叉区域，如'100px 0px'使元素提前/延迟100px触发
 * @returns {Object} 包含观察引用和可见性状态的对象
 * @returns {React.MutableRefObject<Element|null>} observeRef - 需要观察的元素引用，
 *   必须绑定到DOM元素
 * @returns {boolean} isVisible - 元素是否可见（满足阈值条件）
 * @example
 * // 基础用法：检测元素是否可见
 * const { observeRef, isVisible } = useIntersectionObserver();
 * 
 * // 高级用法：懒加载图片
 * const { observeRef, isVisible } = useIntersectionObserver({
 *   animateOnce: true,
 *   options: { threshold: 0.1, rootMargin: '200px' }
 * });
 * return (
 *   <div ref={observeRef}>
 *     {isVisible ? <img src={imageUrl} /> : <Placeholder />}
 *   </div>
 * );
 * @note 浏览器兼容性：
 *   - 支持Chrome 51+、Firefox 55+、Edge 15+等现代浏览器
 *   - IE完全不支持，需引入polyfill（如intersection-observer）
 *   - 不支持时会在控制台警告并默认返回isVisible=true
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver Intersection Observer API文档
 */
export const useIntersectionObserver = ({
    animateOnce = false,
    options = {}
}: UseIntersectionObserverProps = {}): IntersectionObserverResult => {
    const observeRef = useRef<Element | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const currentRef = observeRef.current;
        if (!currentRef) return;

        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;

            setIsVisible(entry.isIntersecting);

            if (entry.isIntersecting && animateOnce) {
                observer.disconnect();
            }
        }, options);

        observer.observe(currentRef);

        return () => {
            observer.disconnect();
        };
    }, [observeRef, animateOnce, options]);

    if (typeof IntersectionObserver === "undefined") {
        console.warn("IntersectionObserver is not supported in this browser.");
        return { observeRef, isVisible: true };
    }

    return { observeRef, isVisible };
};