import { useEffect, useState } from "react";

/**
 * 实现值防抖的React Hook，延迟值的更新直到指定时间内没有新变化
 * 防抖技术通过忽略快速连续的变化，只在稳定期后更新值，有效减少不必要的计算和渲染
 *
 * @template T - 防抖值的类型，支持任何可比较的数据类型
 *   - 基本类型：string、number、boolean、null、undefined
 *   - 引用类型：object、array、function（通过引用比较，不深比较内容）
 *
 * @param {T} value - 需要进行防抖处理的值
 *   每次值变化都会重置防抖定时器
 *   对于引用类型，只有引用变化时才会触发防抖
 *
 * @param {number} [delay=500] - 防抖延迟时间(毫秒)
 *   - 取值范围：≥ 0
 *   - 特殊值：0表示无防抖，立即更新
 *   - 推荐值：搜索输入300-500ms，窗口调整50-100ms，表单验证200-300ms
 *
 * @returns {T} 防抖处理后的值
 *   - 初始渲染：立即返回原始value
 *   - 稳定期后：返回最新的value
 *   - 防抖期间：返回上一次稳定的值
 *
 * @example
 * // 基础用法 - 搜索输入防抖
 * function SearchComponent() {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // 执行搜索API调用
 *       searchProducts(debouncedSearchTerm);
 *     }
 *   }, [debouncedSearchTerm]);
 *
 *   return <input onChange={(e) => setSearchTerm(e.target.value)} />
 * }
 *
 * @example
 * // 高级用法 - 动态调整防抖延迟
 * function DataFilter() {
 *   const [filters, setFilters] = useState({});
 *   const [debounceDelay, setDebounceDelay] = useState(500);
 *
 *   // 根据筛选复杂度动态调整防抖延迟
 *   const debouncedFilters = useDebounce(filters, debounceDelay);
 *
 *   return (
 *     <div>
 *       <FilterControls onChange={setFilters} />
 *       <DelaySelector value={debounceDelay} onChange={setDebounceDelay} />
 *     </div>
 *   );
 * }
 *
 * @example
 * // 特殊用法 - 零延迟防抖（立即更新）
 * function LiveUpdater() {
 *   const [value, setValue] = useState('');
 *   // delay=0时表现为直接传递，可用于统一API或未来可能需要调整延迟的场景
 *   const debouncedValue = useDebounce(value, 0);
 *
 *   return <input value={value} onChange={(e) => setValue(e.target.value)} />
 * }
 *
 * @example
 * // 处理对象类型 - 需要配合useMemo进行深比较
 * function ObjectDebounceExample() {
 *   const [user, setUser] = useState({ name: '', age: 0 });
 *   // 仅当name或age变化时才触发防抖
 *   const debouncedUser = useDebounce(
 *     useMemo(() => ({ ...user }), [user.name, user.age]),
 *     500
 *   );
 *
 *   return (
 *     <div>
 *       <input
 *         value={user.name}
 *         onChange={(e) => setUser({ ...user, name: e.target.value })}
 *       />
 *     </div>
 *   );
 * }
 *
 * @note 实现原理:
 * - 使用useState存储防抖后的值
 * - 使用useEffect监听value和delay变化
 * - 定时器管理：每次值变化时清除旧定时器并创建新定时器
 * - 清理机制：组件卸载或值变化时自动清除定时器，防止内存泄漏
 *
 * @note 性能优化建议:
 * - 避免对频繁变化的大型对象使用防抖
 * - 对于复杂计算结果，考虑先使用useMemo缓存再防抖
 * - 合理设置delay值：过短可能导致频繁更新，过长影响用户体验
 *
 * @note 边缘情况处理:
 * - delay=0：完全禁用防抖，立即更新值
 * - 快速连续变化：只有最后一次变化后经过完整delay时间才会更新
 * - 频繁切换delay：会使用最新的delay值重新计算
 * - 相同值连续传入：不会触发防抖更新
 *
 * @warning 对于引用类型数据（对象、数组），防抖仅比较引用是否变化
 *   若需要深比较，请先使用useMemo或其他方法处理值
 *   例如: useDebounce(useMemo(() => ({...obj}), [obj.prop]), 500)
 */
export function useDebounce<T>(value: T, delay: number = 500) {
    const [debounced, setDebounced] = useState<T>(value);

    useEffect(() => {
        if (delay <= 0) {
            setDebounced(value);
            return;
        }
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}
