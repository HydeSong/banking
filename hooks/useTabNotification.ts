import { useEffect, useState } from 'react';

/**
 * 管理浏览器标签页通知的React Hook，支持标题闪烁、favicon徽章和自定义通知内容
 * 当用户离开当前标签页时显示视觉提示，提高用户对新消息的感知
 * 
 * @param {number} [flashDelayInSeconds=2] - 标题闪烁切换间隔时间(秒)
 * @returns {{show: (options?: {title?: string, prefix?: string, flashMessage?: string}) => void, hide: () => void, updateFlashMessage: (message: string) => void, setShowFaviconDot: (show: boolean) => void, setFaviconDotColor: (color: string) => void}} 控制函数集合:
 *   - show: 显示通知，可自定义标题、前缀和闪烁消息
 *   - hide: 隐藏通知，恢复原始标题和favicon
 *   - updateFlashMessage: 更新闪烁消息内容
 *   - setShowFaviconDot: 控制是否在favicon上显示通知点
 *   - setFaviconDotColor: 设置favicon通知点颜色
 * 
 * @example
 * // 基础用法 - 新消息通知
 * function ChatApp() {
 *   const { show, hide } = useTabNotification();
 *   
 *   return (
 *     <div>
 *       <button onClick={() => show({ title: '新消息', flashMessage: '你有一条未读消息' })}>
 *         发送通知
 *       </button>
 *       <button onClick={hide}>清除通知</button>
 *     </div>
 *   );
 * }
 * 
 * @example
 * // 自定义favicon通知点
 * function NotificationSettings() {
 *   const { setShowFaviconDot, setFaviconDotColor } = useTabNotification();
 *   
 *   return (
 *     <div>
 *       <label>
 *         <input
 *           type="checkbox"
 *           onChange={(e) => setShowFaviconDot(e.target.checked)}
 *           defaultChecked
 *         />
 *         显示通知点
 *       </label>
 *       <input
 *         type="color"
 *         onChange={(e) => setFaviconDotColor(e.target.value)}
 *         defaultValue="#f00000"
 *       />
 *     </div>
 *   );
 * }
 * 
 * @note 实现细节:
 *   - 使用canvas动态修改favicon，添加彩色通知点
 *   - 标题闪烁通过定时切换document.title实现
 *   - 自动保存原始标题和favicon，隐藏时恢复
 *   - 支持部分更新：单独修改闪烁消息或favicon样式
 * 
 * @warning 浏览器兼容性:
 *   - Favicon修改需要浏览器支持canvas和data URL
 *   - 某些浏览器可能限制频繁的title修改
 *   - 依赖页面中已存在的favicon元素(link[rel$=icon])
 */
export function useTabNotification(flashDelayInSeconds = 2) {
    const [originalTitle, setOriginalTitle] = useState('');
    const [favicon, setFavicon] = useState<string | null>(null);
    const [notificationFavicon, setNotificationFavicon] = useState<string | null>(null);
    const [titlePrefix, setTitlePrefix] = useState<string | null>(null);
    const [customTitle, setCustomTitle] = useState<string | null>(null);
    const [modifiedTitle, setModifiedTitle] = useState<string>('');
    const [flashMessage, setFlashMessage] = useState<string | null>(null);
    const [isShown, setIsShown] = useState(false);
    const [showFaviconDot, setShowFaviconDot] = useState(true);
    const [faviconDotColor, setFaviconDotColor] = useState('#f00000');

    useEffect(() => {
        if (typeof window === 'undefined') return;
        setOriginalTitle(document.title);
        const defaultFavicon = document.querySelector('link[rel$=icon]')?.getAttribute('href');
        setFavicon(defaultFavicon ?? null);
        setNotificationFavicon(defaultFavicon);
    }, []);

    useEffect(() => {
        if (showFaviconDot && isShown && favicon) {
            const img = document.createElement('img');
            img.src = favicon;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d')!;
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0, img.width, img.height);
                context.beginPath();
                context.arc(
                    img.width - img.width / 5,
                    img.height / 5,
                    img.width / 5,
                    0,
                    2 * Math.PI,
                );
                context.fillStyle = faviconDotColor;
                context.fill();
                setNotificationFavicon(canvas.toDataURL('image/png'));
            };
        } else {
            setNotificationFavicon(favicon);
        }
    }, [showFaviconDot, favicon, faviconDotColor, isShown]);

    useEffect(() => {
        if (notificationFavicon) {
            document
                .querySelector('link[rel$=icon]')
                ?.setAttribute('href', notificationFavicon);
        }
    }, [notificationFavicon]);

    useEffect(() => {
        if (!isShown) {
            setModifiedTitle(originalTitle);
        } else {
            let title = customTitle ? customTitle : originalTitle;
            if (titlePrefix) {
                title = titlePrefix + ' ' + title;
            }

            setModifiedTitle(title);
        }
    }, [titlePrefix, originalTitle, customTitle, isShown]);

    useEffect(() => {
        document.title = modifiedTitle;
    }, [modifiedTitle]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;

        if (flashMessage && isShown) {
            interval = setInterval(() => {
                document.title =
                    document.title === flashMessage ? modifiedTitle : flashMessage;
            }, flashDelayInSeconds * 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval as unknown as number);
            }
        };
    }, [flashMessage, modifiedTitle, isShown, flashDelayInSeconds]);

    return {
        setTitlePrefix,
        setFlashMessage,
        isShown,
        setIsShown,
        setCustomTitle,
        setShowFaviconDot,
        setFaviconDotColor,
    };
}