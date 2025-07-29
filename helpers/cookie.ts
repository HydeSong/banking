/**
 * 获取指定键的 Cookie 值
 * @param key Cookie 键名
 * @returns 解析后的类型值，若不存在则返回 undefined
 */
export function getCookie<T>(key: string): T | undefined {
    // 检查是否在浏览器环境中
    if (typeof window === 'undefined') return undefined;
    // 构建完整的键名（包含等号）
    const name = `${key}=`;
    // 解码并分割所有 Cookie 键值对
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    // 遍历查找目标键
    for (const cookie of cookieArray) {
        let trimmedCookie = cookie.trim();
        if (trimmedCookie.indexOf(name) === 0) {
            // 提取原始值（去除键名部分）
            const value = trimmedCookie.substring(name.length);
            try {
                // 尝试解析为 JSON 类型（支持对象/数组等复杂类型）
                return JSON.parse(value) as T;
            } catch (error) {
                // 若解析失败，返回原始字符串（适用于字符串类型）
                return (value as unknown) as T;
            }
        }
    }
    // 未找到对应键时返回 undefined
    return undefined;
}

/**
 * 设置 Cookie 值
 * @param key Cookie 键名
 * @param value 要存储的值（支持任意类型，自动序列化为 JSON 字符串）
 * @param expireDays 过期天数（默认 365 天）
 */
export function setCookie<T>(
    key: string,
    value: T,
    expireDays: number = 365
): void {
    // 检查是否在浏览器环境中
    if (typeof window === 'undefined') return;
    // 构建过期时间字符串
    let expires = '';
    if (expireDays) {
        const date = new Date();
        date.setTime(date.getTime() + expireDays * 24 * 60 * 60 * 1000);
        expires = `; expires=${date.toUTCString()}`;
    }

    // 序列化值为 JSON 字符串（支持复杂类型）
    const encodedValue = JSON.stringify(value);
    // 设置 Cookie（路径设为 '/' 确保全局访问）
    document.cookie = `${key}=${encodedValue}; path=/${expires}`;
}

/**
 * 删除指定键的 Cookie
 * @param key Cookie 键名
 */
export function deleteCookie(key: string): void {
    // 检查是否在浏览器环境中
    if (typeof window === 'undefined') return;
    // 通过设置过期时间为过去时间来删除 Cookie
    setCookie(key, '', -1); // 使用 setCookie 的过期逻辑
}

// cookie.ts
/**
 * 解析 Cookie 值的原始类型
 */
export type CookieValueType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'undefined';

/**
 * 将值解析为 Cookie 存储的原始类型
 * @param value 要解析的值
 * @returns 解析后的 Cookie 类型
 */
export function parseToCookieType(value: any): CookieValueType {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';

    const type = typeof value;
    switch (type) {
        case 'string': return 'string';
        case 'number': return 'number';
        case 'boolean': return 'boolean';
        case 'object': return 'object';
        default: return 'undefined';
    }
}

/**
 * 获取指定名称的一组 Cookie 值
 * @param keys 要获取的 Cookie 名称数组
 * @returns 包含 Cookie 值的对象
 */
export function getCookies(keys: string[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    // 检查是否在浏览器环境中
    if (typeof window === 'undefined') return result;

    try {
        const cookies = document.cookie.split('; ');

        keys.forEach(key => {
            const cookie = cookies.find(c => c.startsWith(`${key}=`));

            if (cookie) {
                const encodedValue = cookie.substring(key.length + 1);
                const decodedValue = decodeURIComponent(encodedValue);

                try {
                    // 尝试解析为 JSON
                    result[key] = JSON.parse(decodedValue);
                } catch {
                    // 如果解析失败，返回原始字符串
                    result[key] = decodedValue;
                }
            } else {
                result[key] = undefined;
            }
        });
    } catch (error) {
        console.error('Failed to get cookies:', error);
    }

    return result;
}

/**
 * 将 Cookie 类型的值转换为目标数据类型
 * @param value 要转换的值
 * @returns 转换后的目标数据类型
 */
export function parseToDataType<T>(value: any): T | undefined {
    try {
        // 如果是字符串形式的 JSON，尝试解析
        if (typeof value === 'string') {
            try {
                return JSON.parse(value) as T;
            } catch {
                // 如果解析失败，直接返回字符串
                return value as unknown as T;
            }
        }

        // 对于非字符串值，直接返回
        return value as T;
    } catch (error) {
        console.error('Failed to parse data type:', error);
        return undefined;
    }
}