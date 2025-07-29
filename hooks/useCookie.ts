import { useState } from 'react';
import { useCookieListener } from './useCookieListener';
import { useSingleEffect } from './useSingleEffect';

import {
    getCookie,
    setCookie,
    deleteCookie,
} from '@/helpers/cookie';

/**
 * 类型安全的Cookie管理React Hook，提供Cookie的读取、设置和删除功能
 * 支持自动类型转换，当Cookie值变化时自动更新组件状态
 * 结合useCookieListener实现跨组件Cookie变更同步
 * 适用于需要在客户端存储少量持久化数据的场景
 *
 * @template T - Cookie值的类型，可以是string、number、boolean或JSON可序列化对象
 *   注意：复杂类型会通过JSON.stringify/parse进行序列化/反序列化
 *   ⚠️ 不支持循环引用对象或函数等不可序列化值
 *
 * @param {string} key - Cookie的唯一标识名称，用于读取和写入Cookie
 *   命名建议：使用有意义的名称，避免与其他Cookie冲突
 * @param {T} initialValue - Cookie不存在时使用的初始值
 *   当Cookie不存在时，会自动将此初始值写入Cookie
 * @param {number} [expireDays=365] - Cookie的过期时间(天，默认值: 365)
 *   - 正数: 从当前时间开始的过期天数
 *   - 0: 会话Cookie，浏览器关闭后失效
 *   - 负数: 立即过期(不推荐，应使用delete函数)
 *
 * @returns {[T, (value: T) => void, () => void]} 包含三个元素的元组
 * @returns {T} 0 - 当前Cookie值，自动与Cookie同步
 * @returns {(value: T) => void} 1 - 设置Cookie值的函数
 *   @param {T} value - 要存储的新值，会自动序列化并写入Cookie
 * @returns {() => void} 2 - 删除Cookie的函数
 *   调用后会清除Cookie并将状态重置为初始值
 *
 * @example
 * // 基础用法 - 存储字符串
 * function UserPreferences() {
 *   const [theme, setTheme, deleteTheme] = useCookie('theme', 'light', 30);
 *
 *   return (
 *     <div>
 *       <p>当前主题: {theme}</p>
 *       <button onClick={() => setTheme('dark')}>切换深色模式</button>
 *       <button onClick={deleteTheme}>重置主题</button>
 *     </div>
 *   );
 * }
 *
 * @example
 * // 存储对象类型
 * interface UserSettings {
 *   notifications: boolean;
 *   volume: number;
 * }
 *
 * function SettingsPanel() {
 *   const [settings, setSettings] = useCookie<UserSettings>(
 *     'userSettings',
 *     { notifications: true, volume: 80 },
 *     90
 *   );
 *
 *   return (
 *     <div>
 *       <label>
 *         通知: <input
 *           type="checkbox"
 *           checked={settings.notifications}
 *           onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
 *         />
 *       </label>
 *       <input
 *         type="range"
 *         value={settings.volume}
 *         onChange={(e) => setSettings({...settings, volume: Number(e.target.value)})}
 *       />
 *     </div>
 *   );
 * }
 *
 * @note 实现细节:
 * - 初始加载时: 从Cookie读取值，不存在则使用initialValue并写入Cookie
 * - 状态同步: 通过useCookieListener监听Cookie变化，实现跨组件同步
 * - SSR支持: 在服务端渲染时安全处理，避免window对象不存在的错误
 * - 依赖: 使用@/helpers/cookie中的getCookie、setCookie和deleteCookie函数
 *   这些函数处理了值的序列化/反序列化和浏览器兼容性问题
 *
 * @note 安全考虑:
 * - 不要存储敏感信息，Cookie在客户端可见且可修改
 * - 对于复杂状态管理，考虑使用useLocalStorage或其他存储方案
 *
 * @see 相关工具: <mcsymbol name="useCookieListener" filename="useCookieListener.ts" path="/Users/hyde/Documents/Workspace/banking/hooks/useCookieListener.ts" startline="1"></mcsymbol>
 * @see Cookie操作工具: <mcfile name="cookie.ts" path="/Users/hyde/Documents/Workspace/banking/helpers/cookie.ts"></mcfile>
 */
export const useCookie = <T>(
    key: string,
    initialValue: T,
    expireDays = 365,
): [T, (value: T) => void, () => void] => {
    const [cookieValue, setCookieValue] = useState<T>(
        getCookie<T>(key) ?? initialValue,
    );

    useSingleEffect(() => {
        if (typeof getCookie(key) === "undefined") {
            setCookie(key, initialValue, expireDays);
        }
    });

    useCookieListener(
        (value: T) => {
            setCookieValue(value);
        },
        [key],
    );

    const setValue = (value: T) => {
        setCookieValue(value);
        setCookie(key, value, expireDays);
    };

    const deleteValue = () => {
        deleteCookie(key);
    };

    return [cookieValue, setValue, deleteValue];
};