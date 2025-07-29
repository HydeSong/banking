import { useState } from 'react';

/**
 * 创建输入框变化处理函数的辅助函数
 * @template T - 输入值的类型，可以是string、boolean或其他基本类型
 * @param {React.Dispatch<React.SetStateAction<T>>} setValue - 状态更新函数
 * @returns {(val: T | React.ChangeEvent<HTMLInputElement>) => void} 处理输入变化的函数
 *   自动识别输入类型：
 *   - 若为ChangeEvent对象，提取currentTarget.value或currentTarget.checked
 *   - 若为原始值，直接使用该值
 * @example
 * // 文本输入处理
 * const setText = useState('')[1];
 * const handleTextChange = handleChange<string>(setText);
 * // 复选框处理
 * const setChecked = useState(false)[1];
 * const handleCheckChange = handleChange<boolean>(setChecked);
 */
export function handleChange<T>(setValue: React.Dispatch<any>) {
    return (val: T) => {
        if (!val) {
            setValue(val);
        } else if (typeof val === 'object' && 'nativeEvent' in val) {
            // @ts-ignore
            const { currentTarget } = val;

            if (currentTarget.type === 'checkbox') {
                setValue(currentTarget.checked);
            } else {
                setValue(currentTarget.value);
            }
        } else {
            setValue(val);
        }
    };
}

/**
 * 管理输入框状态的Hook，简化表单输入处理
 * @template T - 输入值的类型，可以是string、boolean或其他基本类型
 * @param {T} initialState - 初始值，如空字符串、布尔值等
 * @returns {[T, (val: T | React.ChangeEvent<HTMLInputElement>) => void]} 元组，包含：
 *   - 当前值
 *   - 变化处理函数，支持直接传入值或ChangeEvent对象
 * @example
 * // 文本输入
 * const [username, setUsername] = useInputValue('');
 * // 渲染: <input value={username} onChange={setUsername} />
 * 
 * // 复选框
 * const [agree, setAgree] = useInputValue(false);
 * // 渲染: <input type="checkbox" checked={agree} onChange={setAgree} />
 * 
 * // 直接设置值
 * setUsername('new-value'); // 支持直接传入值
 * @see 内部使用{@link handleChange}函数处理输入值
 */
export function useInputValue<T>(initialState: T) {
    const [value, setValue] = useState<T>(initialState);

    return [value, handleChange<T>(setValue)] as const;
}