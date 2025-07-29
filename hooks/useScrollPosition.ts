import { useState } from 'react';
import { useEventListener } from './useEventListener';

const getPosition = () =>
    typeof window !== 'undefined'
        ? { x: window.scrollX, y: window.scrollY }
        : { x: 0, y: 0 };

const setPosition = ({ x, y }: { x?: number; y?: number }) => {
    if (typeof window !== 'undefined') {
        const scrollOptions: ScrollToOptions = { behavior: 'smooth' };

        if (typeof x === 'number') scrollOptions.left = x;
        if (typeof y === 'number') scrollOptions.top = y;

        window.scrollTo(scrollOptions);
    }
};

/**
 * 跟踪窗口滚动位置并提供平滑滚动控制的React Hook
 * 自动监听scroll和resize事件更新位置，支持平滑滚动到指定坐标
 * 
 * @returns {[{x: number, y: number}, (options: {x?: number, y?: number}) => void]} 包含两个元素的元组:
 *   - 第一个元素: 当前滚动位置对象，包含x(水平滚动像素)和y(垂直滚动像素)
 *   - 第二个元素: 滚动控制函数，接受包含x和y可选属性的配置对象
 * 
 * @example
 * // 基础用法 - 显示滚动位置
 * function ScrollIndicator() {
 *   const [scrollPosition] = useScrollPosition();
 *   
 *   return (
 *     <div>
 *       Scroll Position: X: {scrollPosition.x}, Y: {scrollPosition.y}
 *     </div>
 *   );
 * }
 * 
 * @example
 * // 平滑滚动控制
 * function ScrollNavigation() {
 *   const [, setScrollPosition] = useScrollPosition();
 *   
 *   return (
 *     <div>
 *       <button onClick={() => setScrollPosition({ y: 0 })}>回到顶部</button>
 *       <button onClick={() => setScrollPosition({ y: 1000 })}>滚动到底部</button>
 *       <button onClick={() => setScrollPosition({ x: 500, y: 500 })}>滚动到中间</button>
 *     </div>
 *   );
 * }
 * 
 * @note 实现细节:
 *   - 使用{@link useEventListener}监听'scroll'和'resize'事件
 *   - 初始位置在非浏览器环境(SSR)下返回{x: 0, y: 0}
 *   - 滚动控制函数默认使用平滑滚动行为(behavior: 'smooth')
 *   - 支持单独控制水平(x)或垂直(y)滚动位置
 */
export function useScrollPosition() {
    const [currentPosition, setCurrentPosition] = useState(getPosition());

    useEventListener('scroll', () => setCurrentPosition(getPosition()));
    useEventListener('resize', () => setCurrentPosition(getPosition()));

    return [currentPosition, setPosition];
}