import { useState, useEffect } from 'react';

/**
 * 检测用户设备操作系统的React Hook
 * 通过分析浏览器提供的用户代理信息，返回标准化的操作系统名称
 * 适用于根据不同操作系统提供差异化功能或UI体验
 *
 * @returns {string} 标准化的操作系统名称，可能的值：
 *   - 'iOS': iPhone、iPad、iPod等苹果移动设备
 *   - 'MacOS': Macintosh电脑
 *   - 'Windows': Windows操作系统（包括桌面和移动设备）
 *   - 'Android': Android操作系统设备
 *   - 'Linux': Linux发行版（不包括Android）
 *   - 'Unknown': 无法识别的操作系统
 *
 * @example
 * // 基础用法 - 检测操作系统并显示对应提示
 * function OSInfo() {
 *   const os = useDeviceOS();
 *   return (
 *     <div>
 *       <h1>系统信息</h1>
 *       <p>当前设备操作系统: {os}</p>
 *     </div>
 *   );
 * }
 *
 * @example
 * // 高级用法 - 根据操作系统提供差异化功能
 * function DownloadButton() {
 *   const os = useDeviceOS();
 *   const downloadLinks = {
 *     Windows: '/download/windows-setup.exe',
 *     MacOS: '/download/macos-dmg.dmg',
 *     Linux: '/download/linux-appimage.AppImage',
 *     iOS: '/download/ios-appstore',
 *     Android: '/download/android-apk.apk'
 *   };
 *
 *   const link = downloadLinks[os] || '/download/generic';
 *   const label = os !== 'Unknown' ? `下载${os}版本` : '下载应用';
 *
 *   return <a href={link} className="download-btn">{label}</a>;
 * }
 *
 * @example
 * // 条件渲染示例 - 根据操作系统显示特定功能
 * function PlatformFeatures() {
 *   const os = useDeviceOS();
 *
 *   return (
 *     <div>
 *       <CommonFeatures />
 *       {os === 'iOS' && <iOSExclusiveFeatures />}
 *       {os === 'Android' && <AndroidSpecificFeatures />}
 *       {os === 'Unknown' && <CompatibilityWarning />}
 *     </div>
 *   );
 * }
 *
 * @note 实现机制:
 * - 优先使用现代API: navigator.userAgentData.platform (Chrome 93+, Edge 93+, Opera 79+)
 * - 回退方案: 解析navigator.userAgent字符串 (所有浏览器)
 * - 检测逻辑: 通过特征字符串匹配识别操作系统，按特定顺序检查以确保准确性
 * - 初始检测: 组件挂载时立即执行检测，结果不会动态更新
 *
 * @note 浏览器兼容性:
 * | 浏览器 | 支持userAgentData | 最低版本 |
 * |--------|-------------------|----------|
 * | Chrome | ✅ 支持           | 93       |
 * | Edge   | ✅ 支持           | 93       |
 * | Safari | ❌ 不支持         | -        |
 * | Firefox| ❌ 不支持         | -        |
 * | Opera  | ✅ 支持           | 79       |
 *
 * @warning 不建议用于关键业务逻辑，如权限控制或安全相关功能
 *   操作系统检测主要用于UI适配和功能优化
 */
export const useDeviceOS = () => {
    const [os, setOs] = useState('Unknown');

    useEffect(() => {
        const checkOS = () => {
            // 检查浏览器是否支持 navigator.userAgentData
            if (typeof navigator !== 'undefined' && navigator.userAgentData) {
                const platform = navigator.userAgentData.platform;
                switch (platform) {
                    case 'Windows':
                        return 'Windows';
                    case 'macOS':
                        return 'MacOS';
                    case 'iOS':
                        return 'iOS';
                    case 'Android':
                        return 'Android';
                    case 'Linux':
                        return 'Linux';
                    default:
                        return checkOSBasedOnAgentInfo(navigator.userAgent);
                }
            } else if (typeof navigator !== 'undefined') {
                // 回退方案：使用userAgent字符串检测
                return checkOSBasedOnAgentInfo(navigator.userAgent);
            }
            return 'Unknown';
        };

        setOs(checkOS());
    }, []);

    return os;
};

/**
 * 根据userAgent字符串检测操作系统
 * @param {string} info - navigator.userAgent字符串
 * @returns {string} 操作系统名称
 */
const checkOSBasedOnAgentInfo = (info: string) => {
    switch (true) {
        case /iPhone|iPad|iPod/i.test(info):
            return 'iOS';
        case /Macintosh/i.test(info) && /AppleWebKit/i.test(info) && !/Mobile/i.test(info):
            return 'MacOS';
        case /Windows/i.test(info):
            return 'Windows';
        case /Android/i.test(info):
            return 'Android';
        case /Linux/i.test(info) && !/Android/i.test(info):
            return 'Linux';
        default:
            return 'Unknown';
    }
};