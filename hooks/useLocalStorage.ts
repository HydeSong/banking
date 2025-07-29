import { useCallback, useEffect, useRef, useState } from 'react';
import { useEventListener } from './useEventListener';

/**
 * 用于在localStorage中存储和获取值的Hook，支持SSR环境和跨标签页同步
 * @template T - 存储值的类型，必须是可JSON序列化的类型（不支持函数、Symbol等）
 * @param {string} key - localStorage的键名，用于标识存储项
 * @param {T} initialValue - 初始值，当localStorage中不存在该键、解析失败或在非浏览器环境时使用
 * @returns {[T, (value: T | ((val: T) => T), onError?: (error: Error) => void) => void]} 元组，包含：
 *   - 存储的当前值，自动与localStorage同步
 *   - 更新值的函数，支持两种更新方式：
 *     1. 直接传入新值：(value: T) => void
 *     2. 函数式更新：((prevValue: T) => T) => void
 *     可传入可选的onError回调处理JSON序列化或存储错误
 * @example
 * // 基础用法
 * const [theme, setTheme] = useLocalStorage<'light'|'dark'>('theme', 'light');
 * setTheme('dark'); // 直接更新
 * 
 * // 函数式更新
 * setTheme(prev => prev === 'light' ? 'dark' : 'light');
 * 
 * // 带错误处理
 * setTheme(undefined, (error) => {
 *   console.error('主题保存失败:', error);
 * });
 * 
 * // 存储对象类型
 * const [user, setUser] = useLocalStorage<{name: string; age: number}>('user', {name: '', age: 0});
 * setUser(prev => ({...prev, age: prev.age + 1}));
 * 
 * // 跨标签页同步示例
 * // Tab A:
 * const [count, setCount] = useLocalStorage('count', 0);
 * // Tab B:
 * setCount(1); // Tab A的count会自动更新为1
 * @note
 *   - 依赖localStorage API，不支持的环境（如服务器端）将始终返回初始值
 *   - 存储值必须支持JSON序列化，否则会抛出错误（如函数、Symbol、循环引用对象等）
 *   - 通过监听'storage'和'local-storage'事件实现跨标签页/窗口数据同步
 *   - 内部使用{@link useEventListener}管理存储事件监听
 *   - 存储容量限制：通常浏览器对localStorage的单个域名限制为5MB
 *   - 页面关闭后数据仍保留，需手动清除或调用setter设置undefined
 * @note 解析逻辑：
 *   - 使用内部{@link parseJSON}函数处理JSON解析
 *   - 特殊处理'undefined'字符串：解析为undefined
 *   - 解析失败时返回初始值
 * @warning 安全注意事项：
 *   - 不要存储敏感信息（如密码、令牌），localStorage是明文存储且可通过JavaScript访问
 *   - 存储内容可能被用户篡改，读取时应进行数据验证
 *   - 不同浏览器对存储大小限制不同，超出限制会抛出QuotaExceededError
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage localStorage文档
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
    const readValue = useCallback(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);

            return item ? parseJSON(item) : initialValue;
        } catch (error) {
            console.error(`Error getting storage key “${key}”:`, error);

            return initialValue;
        }
    }, [initialValue, key]);

    const [storedValue, setStoredValue] = useState(readValue);
    const setValue = useCallback((value: T | ((val: T) => T), onError?: (error: Error) => void) => {
        if (typeof window === 'undefined') return;
        try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        window.localStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
        window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
        if (onError && error instanceof Error) onError(error);
        else console.warn(`Error setting localStorage key “${key}”:`, error);
    }
}, [key, storedValue]);

    useEffect(() => {
        setStoredValue(readValue());
    }, []);

    const handleStorageChange = useCallback(
    (_event: Event) => setStoredValue(readValue()),
    [readValue],
);
    useEventListener('storage', handleStorageChange);
    useEventListener('local-storage', handleStorageChange);
    return [storedValue, setValue];
}

/**
 * 安全解析JSON字符串的辅助函数
 * @param {any} value - 要解析的原始值
 * @returns {any} 解析后的JSON值，或undefined（解析失败时）
 * @note 特殊处理'undefined'字符串，返回undefined
 */
function parseJSON(value: any) {
    try {
        return value === 'undefined' ? undefined : JSON.parse(value ?? '');
    } catch {
        return undefined;
    }
}