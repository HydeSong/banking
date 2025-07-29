import { useEffect, useState } from 'react';

enum ScrollState {
    SCROLL = '',
    LOCK = 'hidden',
}

type PreventBodyScrollResult = {
    isScrollLocked: boolean;
    setIsScrollLocked: React.Dispatch<React.SetStateAction<boolean>>;
    toggleScrollLock: () => void;
};

/**
 * 管理页面body滚动锁定状态的Hook
 * @returns {PreventBodyScrollResult} 包含滚动锁定状态和控制方法的对象
 * @property {boolean} isScrollLocked - 当前滚动是否被锁定
 * @property {React.Dispatch<React.SetStateAction<boolean>>} setIsScrollLocked - 设置滚动锁定状态的函数
 * @property {() => void} toggleScrollLock - 切换滚动锁定状态的函数
 * @note 通过修改document.body.style.overflow实现滚动锁定，组件卸载时自动恢复滚动
 */
export function usePreventBodyScroll(): PreventBodyScrollResult {
    const [isScrollLocked, setIsScrollLocked] = useState<boolean>(false);

    useEffect(() => {
        if (isScrollLocked) {
            document.body.style.overflow = ScrollState.LOCK;
        } else {
            document.body.style.overflow = ScrollState.SCROLL;
        }

        return () => {
            document.body.style.overflow = ScrollState.SCROLL;
        };
    }, [isScrollLocked]);

    const toggleScrollLock = () => setIsScrollLocked((prevState) => !prevState);

    return {
        isScrollLocked,
        setIsScrollLocked,
        toggleScrollLock,
    };
}