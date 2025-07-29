import { useState, useEffect } from "react";

type ScrollDevice = "mouse" | "trackpad" | null;

/**
 * 检测用户滚动设备类型的React Hook（鼠标滚轮或触控板）
 * 通过分析滚动事件特征（delta值大小和时间间隔）区分设备类型
 * 
 * @returns {'mouse' | 'trackpad' | null} 检测到的滚动设备类型:
 *   - 'mouse': 鼠标滚轮设备
 *   - 'trackpad': 触控板设备
 *   - null: 初始状态或无法确定设备类型
 * 
 * @example
 * function ScrollBehavior() {
 *   const scrollDevice = useScrollDevice();
 *   
 *   return (
 *     <div>
 *       {scrollDevice === 'mouse' && <MouseOptimizedUI />}
 *       {scrollDevice === 'trackpad' && <TrackpadOptimizedUI />}
 *       {!scrollDevice && <InitialLoadingUI />}
 *     </div>
 *   );
 * }
 * 
 * @example
 * // 调整滚动敏感度
 * function ScrollSensitiveComponent() {
 *   const scrollDevice = useScrollDevice();
 *   const sensitivity = scrollDevice === 'mouse' ? 2 : 1;
 *   
 *   return <div style={{ scrollSensitivity: sensitivity }}>Content</div>;
 * }
 * 
 * @note 检测原理:
 *   - 触控板: 小delta值(<50)或同时存在deltaX和deltaY
 *   - 鼠标滚轮: 大delta值(≥50)或稳定时间间隔的一致滚动
 *   - 使用200ms防抖确保设备类型稳定后才更新状态
 * 
 * @warning 局限性:
 *   - 初始状态为null，需等待首次滚动事件后才有值
 *   - 部分设备可能无法准确分类（如带滚轮的触控板）
 *   - 依赖wheel事件，不支持触摸屏幕滚动检测
 */
export function useScrollDevice(): ScrollDevice {
    const [deviceType, setDeviceType] = useState<ScrollDevice>(null);
    let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

    useEffect(() => {
        if (typeof window === 'undefined') return;
        let lastEventTimestamp = 0;
        let lastDeltaY = 0;

        const detectScrollDevice = (event: WheelEvent) => {
            const now = performance.now();
            const timeDiff = now - lastEventTimestamp;

            const isTrackpad = (
                Math.abs(event.deltaY) < 50 || // Small delta values indicate trackpad
                (Math.abs(event.deltaX) > 0 && Math.abs(event.deltaY) < 50) // Trackpads scroll in both directions
            );

            const isMouseWheel = (
                Math.abs(event.deltaY) >= 50 || // Large jumps indicate mouse wheel
                (timeDiff > 50 && Math.abs(event.deltaY - lastDeltaY) < 10) // Consistent jumps suggest a wheel
            );

            const detectedDevice = isTrackpad ? "trackpad" : isMouseWheel ? "mouse" : null;

            lastEventTimestamp = now;
            lastDeltaY = event.deltaY;

            // Debounce: Ensure only the last detected value is stored
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }

            debounceTimeout = setTimeout(() => {
                setDeviceType(detectedDevice);
            }, 200); // Adjust debounce time if needed
        };

        window.addEventListener("wheel", detectScrollDevice);

        return () => {
            window.removeEventListener("wheel", detectScrollDevice);
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
        };
    }, []);

    return deviceType;
}
