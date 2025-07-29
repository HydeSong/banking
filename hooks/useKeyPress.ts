import { useEffect, useMemo, useRef } from "react";

const normalizeKey = (key: string) => {
  return key.toLowerCase();
};

/**
 * 监听特定按键组合的Hook，支持多键组合检测
 * @param {string[]} keys - 需要监听的按键数组（不区分大小写），如['Control', 's']表示Ctrl+S组合键
 *   常用键名参考：'Control'|'Shift'|'Alt'|'Meta'(Win键)|字母|数字|'ArrowUp'等方向键
 * @param {(e: KeyboardEvent) => void} callback - 按键组合触发时的回调函数
 *   @param {KeyboardEvent} e - 键盘事件对象，可通过e.preventDefault()阻止默认行为
 * @example
 * // 监听Ctrl+S组合键（保存功能）
 * useKeyPress(['Control', 's'], (e) => {
 *   e.preventDefault(); // 阻止浏览器默认保存行为
 *   console.log('执行自定义保存逻辑');
 * });
 * @example
 * // 监听Shift+Alt+A组合键
 * useKeyPress(['Shift', 'Alt', 'a'], () => {
 *   console.log('Shift+Alt+A组合键被按下');
 * });
 * @note
 *   - 按键按下顺序不影响组合键检测结果
 *   - 重复按键（如按住某键不放）不会重复触发回调
 *   - 失去焦点时会自动清除按键状态，避免组合键状态残留
 *   - 内部使用Set管理按键状态，确保组合键所有按键同时按下才触发
 */
export function useKeyPress(
  keys: string[],
  callback: (e: KeyboardEvent) => void,
) {
  const lastKeyPressed = useRef<Set<string>>(new Set([]));
  const keysSet = useMemo(() => {
    return new Set(keys.map((key) => normalizeKey(key)));
  }, [keys]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return; // To prevent this function from triggering on key hold e.g. Ctrl hold

    lastKeyPressed.current?.add(normalizeKey(e.key));

    // To bypass TypeScript check for the new ECMAScript method `isSubset`
    if ((keysSet as any).isSubsetOf(lastKeyPressed.current)) {
      e.preventDefault();
      callback(e);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    lastKeyPressed.current?.delete(normalizeKey(e.key));
  };

  const handleBlur = () => {
    lastKeyPressed.current?.clear();
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [keysSet, callback]);
}