/**
 * 动态管理网站图标的React Hook
 * 提供简洁API实现网站图标的即时切换，支持默认图标设置和动态更新
 * 适用于主题切换、通知状态指示、环境切换等需要视觉反馈的场景
 *
 * @param {string|null} [defaultHref=null] - 默认图标URL路径
 *   - 初始渲染时自动应用此图标
 *   - 支持相对路径(相对于应用根目录)或绝对URL
 *   - 设置为null时不加载默认图标
 *
 * @returns {Object} 图标控制对象
 * @returns {Function} setFavicon - 动态设置图标的方法
 *   @param {string} href - 目标图标URL路径
 *     为空字符串或null时将使用defaultHref(如果提供)
 *   @param {string} [type='image/x-icon'] - 图标MIME类型
 *     常用类型: 'image/x-icon'(ICO), 'image/png'(PNG), 'image/svg+xml'(SVG)
 *
 * @example
 * // 基础用法 - 设置默认图标并动态切换
 * function ThemeSwitcher() {
 *   const { setFavicon } = useFavicon('/icons/default.ico');
 *   const [darkMode, setDarkMode] = useState(false);
 *
 *   useEffect(() => {
 *     // 根据主题切换图标
 *     setFavicon(darkMode ? '/icons/dark.ico' : '/icons/light.ico');
 *   }, [darkMode, setFavicon]);
 *
 *   return (
 *     <button onClick={() => setDarkMode(!darkMode)}>
 *       {darkMode ? '切换亮色' : '切换暗色'}
 *     </button>
 *   );
 * }
 *
 * @example
 * // 高级用法 - 通知状态指示
 * function NotificationSystem() {
 *   const { setFavicon } = useFavicon('/icons/normal.ico');
 *   const [unreadCount, setUnreadCount] = useState(0);
 *
 *   useEffect(() => {
 *     if (unreadCount > 0) {
 *       // 显示带通知标记的图标
 *       setFavicon(`/icons/notification-${unreadCount}.png`, 'image/png');
 *     } else {
 *       // 恢复默认图标
 *       setFavicon('/icons/normal.ico');
 *     }
 *   }, [unreadCount, setFavicon]);
 *
 *   return <div>未读通知: {unreadCount}</div>;
 * }
 *
 * @example
 * // SVG图标支持
 * function DynamicSvgFavicon() {
 *   const { setFavicon } = useFavicon();
 *
 *   const generateSvgIcon = (color) => {
 *     return `data:image/svg+xml;base64,${btoa(
 *       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="7" fill="${color}"/></svg>`
 *     )}`;
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={() => setFavicon(generateSvgIcon('red'), 'image/svg+xml')}>
 *         红色图标
 *       </button>
 *       <button onClick={() => setFavicon(generateSvgIcon('blue'), 'image/svg+xml')}>
 *         蓝色图标
 *       </button>
 *     </div>
 *   );
 * }
 *
 * @note 实现机制:
 * - 初始检测: 查找页面中已存在的<link rel*='icon'>元素
 * - 元素复用: 优先使用现有图标元素，不存在则动态创建
 * - 属性管理: 自动设置rel='shortcut icon'确保跨浏览器兼容性
 * - 头部插入: 将图标元素添加到<head>标签确保正确加载
 *
 * @note 图标格式建议:
 * | 格式 | MIME类型 | 优势 | 兼容性 |
 * |------|----------|------|--------|
 * | ICO  | image/x-icon | 支持多尺寸，传统标准 | 所有浏览器 |
 * | PNG  | image/png | 高压缩比，透明背景 | IE11+，现代浏览器 |
 * | SVG  | image/svg+xml | 矢量缩放，动态生成 | Chrome 41+，Firefox 41+，Edge 12+ |
 *
 * @note 最佳实践:
 * - 提供多种尺寸: 推荐16×16, 32×32, 48×48像素版本
 * - 使用相对路径: 避免跨域问题和部署环境限制
 * - 预加载关键图标: 对频繁切换的图标考虑预加载
 * - 处理加载失败: 可配合useEffect监听图片加载错误
 *
 * @warning 浏览器限制:
 * - Safari对SVG图标支持有限，可能需要降级为PNG
 * - 部分浏览器会缓存favicon，可能需要添加版本参数(如?ver=2)
 * - 某些移动浏览器可能忽略非标准尺寸的favicon
 *
 * @see <mcurl name="MDN favicon文档" url="https://developer.mozilla.org/zh-CN/docs/Web/HTML/Link_types/icon"></mcurl>
 * @see <mcurl name="favicon最佳实践" url="https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs"></mcurl>
 */
export function useFavicon(defaultHref: string | null = null) {
    const set = (hrefToSet: string, type: string) => {
        if (typeof window === 'undefined') return;
        const link: HTMLLinkElement | null =
            document.querySelector("link[rel*='icon']") ||
            document.createElement('link');

        link.type = type ?? 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = hrefToSet;

        document.getElementsByTagName('head')[0]?.appendChild(link);
    };

    const setFavicon = (href: string, type: string) =>
        defaultHref && !href ? set(defaultHref, type) : set(href, type);

    return { setFavicon };
}