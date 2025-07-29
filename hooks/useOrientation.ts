import { useState, useEffect } from "react";

type Orientation = "portrait" | "landscape";

/**
 * 检测屏幕方向的Hook
 * @returns {'portrait'|'landscape'} 当前屏幕方向
 * @note 依赖window.matchMedia API检测方向变化
 */
export const useOrientation = (): Orientation => {
    const [orientation, setOrientation] = useState<Orientation>("portrait");

    useEffect(() => {
        // 客户端检测初始方向
        const checkOrientation = () => {
            if (typeof window !== 'undefined') {
                return window.matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape";
            }
            return "portrait";
        };

        // 设置初始方向
        setOrientation(checkOrientation());

        // 监听方向变化
        const handleOrientationChange = (e: MediaQueryListEvent) => {
            setOrientation(e.matches ? "portrait" : "landscape");
        };

        const portraitMediaQuery = window.matchMedia("(orientation: portrait)");
        portraitMediaQuery.addEventListener("change", handleOrientationChange);

        return () =>
            portraitMediaQuery.removeEventListener("change", handleOrientationChange);
    }, []);

    return orientation;
};