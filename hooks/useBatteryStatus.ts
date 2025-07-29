import { useEffect, useState } from 'react';

// Define BatteryManager type manually
interface BatteryManager extends EventTarget {
    charging: boolean;
    level: number;
    addEventListener(
        type: 'chargingchange' | 'levelchange',
        listener: (this: BatteryManager, ev: Event) => any
    ): void;
    removeEventListener(
        type: 'chargingchange' | 'levelchange',
        listener: (this: BatteryManager, ev: Event) => any
    ): void;
}

type NavigatorWithBattery = Navigator & {
    getBattery?: () => Promise<BatteryManager>;
};

/**
 * 监听设备电池状态的React Hook，通过Battery Status API提供实时电池信息
 * 自动跟踪电池电量变化和充电状态，支持浏览器环境下的设备电量监控
 * 在不支持Battery API的环境中会优雅降级并提供警告信息
 *
 * @returns {Object} 电池状态信息对象
 * @returns {number} level - 电池电量百分比，范围0-100的整数
 *   通过battery.level * 100计算并使用Math.round()取整
 * @returns {boolean} isCharging - 电池充电状态
 *   true表示正在充电，false表示未充电或已充满
 * @returns {boolean} isSupported - 指示浏览器是否支持Battery API
 *   在API不支持时返回false
 *
 * @example
 * // 基础用法
 * function BatteryIndicator() {
 *   const { level, isCharging, isSupported } = useBatteryStatus();
 *
 *   if (!isSupported) return null;
 *
 *   return (
 *     <div className="battery-indicator">
 *       <span>电量: {level}%</span>
 *       {isCharging && <span>🔌 充电中</span>}
 *     </div>
 *   );
 * }
 *
 * @example
 * // 低电量警告
 * function BatteryWarning() {
 *   const { level, isCharging, isSupported } = useBatteryStatus();
 *
 *   useEffect(() => {
 *     if (isSupported && level < 20 && !isCharging) {
 *       alert('电池电量低于20%，请及时充电');
 *     }
 *   }, [level, isCharging, isSupported]);
 *
 *   return null;
 * }
 *
 * @note API兼容性表格:
 * | 浏览器 | 支持情况 | 备注 |
 * |--------|----------|------|
 * | Chrome | ✅ 支持 | 38+版本 |
 * | Edge | ✅ 支持 | 79+版本 |
 * | Firefox | ❌ 不支持 | 已移除支持 |
 * | Safari | ❌ 不支持 | 完全不支持 |
 * | iOS浏览器 | ❌ 不支持 | 包括Safari和Chrome for iOS |
 *
 * @warning API已废弃: Battery Status API已从Web标准中移除，仅部分浏览器仍保留支持
 *   未来可能会被完全移除，建议仅用于非关键功能
 *   <mcurl name="MDN废弃说明" url="https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API#browser_compatibility"></mcurl>
 *
 * @see 相关API文档: <mcurl name="MDN Battery Status API" url="https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API"></mcurl>
 */
export function useBatteryStatus() {
    const [batteryStatus, setBatteryStatus] = useState({
        level: 0,
        isCharging: false,
    });

    useEffect(() => {
        const navigatorWithBattery = navigator as NavigatorWithBattery;

        if (!navigatorWithBattery.getBattery) {
            console.warn("Battery Status API is not supported in this browser.");
            return;
        }

        let battery: BatteryManager | null = null;

        const updateBatteryStatus = () => {
            if (battery) {
                setBatteryStatus({
                    level: Math.round(battery.level * 100),
                    isCharging: battery.charging,
                });
            }
        };

        navigatorWithBattery.getBattery().then((bat) => {
            battery = bat;
            updateBatteryStatus();

            battery.addEventListener('chargingchange', updateBatteryStatus);
            battery.addEventListener('levelchange', updateBatteryStatus);
        });

        return () => {
            if (battery) {
                battery.removeEventListener('chargingchange', updateBatteryStatus);
                battery.removeEventListener('levelchange', updateBatteryStatus);
            }
        };
    }, []);

    return batteryStatus;
}