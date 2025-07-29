import { useCallback, useEffect, useState } from 'react';
import { useEventListener } from './useEventListener';

/**
 * 用于在sessionStorage中存储和获取值的Hook，支持SSR环境但不支持跨标签页同步
 * sessionStorage与localStorage的主要区别：
 * - 数据仅在当前会话有效，关闭标签页/浏览器后自动清除
 * - 不支持跨标签页/窗口数据同步
 * - 存储容量限制通常为5MB（与localStorage相同）
 * 
 * @template T - 存储值的类型，必须是可JSON序列化的类型
 * @param {string} key - sessionStorage的键名，用于标识存储项
 * @param {T} initialValue - 初始值，当sessionStorage中不存在该键、解析失败或在非浏览器环境时使用
 * @returns {[T, (value: T | ((val: T) => T), onError?: (error: Error) => void) => void]} 元组，包含：
 *   - 存储的当前值，自动与sessionStorage同步
 *   - 更新值的函数，支持两种更新方式：
 *     1. 直接传入新值：(value: T) => void
 *     2. 函数式更新：((prevValue: T) => T) => void
 *     可传入可选的onError回调处理JSON序列化或存储错误
 * 
 * @example
 * // 基础用法
 * const [token, setToken] = useSessionStorage('auth_token', '');
 * 
 * @example
 * // 存储对象类型
 * const [user, setUser] = useSessionStorage('current_user', { id: null, name: '' });
 * setUser(prev => ({ ...prev, name: 'New Name' }));
 * 
 * @example
 * // 带错误处理
 * setUser(null, (error) => {
 *   console.error('Failed to clear user data:', error);
 * });
 * 
 * @note 实现细节：
 * - 依赖sessionStorage API，不支持的环境将始终返回初始值
 * - 存储值必须支持JSON序列化，否则会抛出错误
 * - 不支持跨标签页同步，因为sessionStorage是选项卡隔离的
 * - 内部使用{@link useEventListener}处理存储事件（尽管跨标签页同步不可用）
 * 
 * @warning 安全注意事项：
 * - 不要存储敏感信息，sessionStorage是明文存储且可通过JavaScript访问
 * - 存储内容可能被用户篡改，读取时应进行数据验证
 * - 不同浏览器对存储大小限制不同，超出限制会抛出QuotaExceededError
 * 
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Window/sessionStorage sessionStorage文档
 */
export function useSessionStorage<T>(key: string, initialValue: T) {
  // 读取sessionStorage值的函数
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      if (typeof window === 'undefined') return initialValue;
      const item = window.sessionStorage.getItem(key);
      return item ? parseJSON(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // 存储当前值的状态
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 更新sessionStorage和状态的函数
  const setValue = useCallback((value: T | ((val: T) => T), onError?: (error: Error) => void) => {
    try {
      // 允许函数式更新
      const newValue = value instanceof Function ? value(storedValue) : value;

      // 更新状态
      setStoredValue(newValue);

      // 更新sessionStorage
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error);
      } else {
        console.warn(`Error setting sessionStorage key “${key}”:`, error);
      }
    }
  }, [key, storedValue]);

  // 初始加载时读取值
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  // 监听sessionStorage变化（同标签页内）
  const handleStorageChange = useCallback(
    (event: Event) => {
      if (event instanceof StorageEvent && event.key === key) {
        setStoredValue(readValue());
      }
    },
    [key, readValue],
  );

  // 添加存储事件监听器
  useEventListener('storage', handleStorageChange);

  return [storedValue, setValue];
}

/**
 * 安全解析JSON字符串的辅助函数
 * @param {string} value - 要解析的JSON字符串
 * @returns {any} 解析后的对象，或undefined（解析失败时）
 * @note 特殊处理'undefined'字符串，返回undefined
 */
function parseJSON(value: string): any {
  try {
    return value === 'undefined' ? undefined : JSON.parse(value);
  } catch {
    console.error('Failed to parse JSON value:', value);
    return undefined;
  }
}