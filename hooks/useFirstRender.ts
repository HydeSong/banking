import { useRef } from 'react';

/**
 * 检测组件是否处于首次渲染的React Hook
 * 提供简洁的方式区分组件的初始化渲染和后续更新，避免在依赖数组中添加额外状态
 * 适用于需要隔离初始化逻辑与更新逻辑的场景
 *
 * @returns {boolean} 渲染状态标识
 *   - true: 当前为组件首次渲染（挂载阶段）
 *   - false: 当前为组件更新渲染（更新阶段）
 *
 * @example
 * // 基础用法 - 区分首次渲染和更新
 * function DataFetcher() {
 *   const isFirstRender = useFirstRender();
 *   const [data, setData] = useState(null);
 *
 *   useEffect(() => {
 *     if (isFirstRender) {
 *       console.log('执行初始化数据加载...');
 *       fetchInitialData().then(setData);
 *     } else {
 *       console.log('数据已更新，执行后续操作...');
 *       // 仅在更新时执行的逻辑
 *     }
 *   }, [data]);
 *
 *   return <div>{data ? data.content : '加载中...'}</div>;
 * }
 *
 * @example
 * // 高级用法 - 跳过首次渲染的副作用
 * function AnalyticsTracker() {
 *   const isFirstRender = useFirstRender();
 *   const [userAction, setUserAction] = useState('');
 *
 *   useEffect(() => {
 *     // 跳过首次渲染，仅在用户操作后发送分析数据
 *     if (!isFirstRender) {
 *       trackUserAction(userAction);
 *     }
 *   }, [userAction]);
 *
 *   return (
 *     <button onClick={() => setUserAction('button_click')}>
 *       点击触发分析
 *     </button>
 *   );
 * }
 *
 * @example
 * // SSR/SSG兼容示例
 * function ServerRenderedComponent() {
 *   const isFirstRender = useFirstRender();
 *   const [clientData, setClientData] = useState(null);
 *
 *   useEffect(() => {
 *     // 在客户端首次渲染时加载仅客户端可用的数据
 *     if (isFirstRender) {
 *       setClientData(window.clientOnlyData);
 *     }
 *   }, []);
 *
 *   return (
 *     <div>
 *       {clientData ? clientData : '服务器渲染内容'}
 *     </div>
 *   );
 * }
 *
 * @note 实现机制:
 * - 使用<mcsymbol name="useRef" filename="react.d.ts" path="node_modules/@types/react/index.d.ts" startline="1368"></mcsymbol>存储渲染状态，避免触发重渲染
 * - 工作流程: 初始值为true → 首次渲染时设置为false并返回true → 后续渲染直接返回false
 * - 执行时机: 在组件函数体中同步执行，比useEffect回调更早
 *
 * @note 与useEffect的区别:
 * | 特性 | useFirstRender | useEffect(..., []) |
 * |------|----------------|---------------------|
 * | 执行时机 | 组件函数执行阶段 | 浏览器绘制后(异步) |
 * | 触发次数 | 仅首次渲染 | 仅首次渲染(客户端) |
 * | 适用场景 | 同步区分渲染阶段 | 异步初始化操作 |
 * | 性能影响 | 无重渲染 | 可能触发一次重渲染 |
 *
 * @warning 使用限制:
 * - 不要在条件渲染块中使用，可能导致状态判断不准确
 * - 避免用于依赖于DOM的操作，此时应使用useEffect
 * - 在React 18+并发模式下，仍能正确识别首次渲染
 *
 * @see <mcurl name="React官方文档 - useRef" url="https://react.dev/reference/react/useRef"></mcurl>
 * @see <mcurl name="何时使用useFirstRender" url="https://www.robinwieruch.de/react-usefirstrender-hook/"></mcurl>
 */
export function useFirstRender() {
    const isFirst = useRef(true);

    if (isFirst.current) {
        isFirst.current = false;
        return true;
    }

    return isFirst.current;
}