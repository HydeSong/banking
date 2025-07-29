import { useEffect, useRef } from 'react';

/**
 * 确保effect只执行一次的React Hook，类似componentDidMount但带有改进的清理机制
 * 无论组件是否重新渲染或effect函数是否变化，都只执行一次传入的effect
 * 
 * @param {() => void | (() => void)} effect - 要执行的effect函数，可选返回清理函数
 * 
 * @example
 * // 基础用法 - 初始数据加载
 * function DataFetcher() {
 *   const [data, setData] = useState(null);
 *   
 *   useSingleEffect(() => {
 *     console.log('Effect只执行一次');
 *     fetchData().then(result => setData(result));
 *   });
 *   
 *   return <div>{data ? data : 'Loading...'}</div>;
 * }
 * 
 * @example
 * // 带清理机制的用法
 * function SubscriptionComponent() {
 *   useSingleEffect(() => {
 *     const subscription = eventSource.subscribe('updates', handleUpdate);
 *     
 *     // 组件卸载时执行清理
 *     return () => {
 *       subscription.unsubscribe();
 *     };
 *   });
 *   
 *   return <div>Listening for updates...</div>;
 * }
 * 
 * @note 实现原理:
 *   - 使用useRef跟踪effect是否已执行(calledOnce)和组件是否在effect后渲染(renderAfterCalled)
 *   - 即使effect函数引用变化，也只会执行最初传入的effect
 *   - 清理函数仅在effect执行后且组件已重新渲染时调用
 * 
 * @note 与标准useEffect的区别:
 *   - useEffect(() => {}, []): 依赖为空数组，但effect函数变化会导致重新执行
 *   - useSingleEffect: 无论effect函数是否变化，始终只执行一次
 * 
 * @warning 使用场景限制:
 *   - 适用于只需要执行一次的初始化操作
 *   - 不适合依赖变化需要重新执行的effect
 *   - 避免在effect中使用闭包捕获可能变化的变量
 */
export function useSingleEffect(effect: () => void | (() => void)) {
    const destroy = useRef<void | (() => void)>(undefined);
    const calledOnce = useRef(false);
    const renderAfterCalled = useRef(false);

    if (calledOnce.current) renderAfterCalled.current = true;

    useEffect(() => {
        if (calledOnce.current) {
            return;
        }

        calledOnce.current = true;
        destroy.current = effect();

        return () => {
            if (!renderAfterCalled.current) {
                return;
            }
            if (destroy.current) destroy.current();
        };
    }, [effect]);
}