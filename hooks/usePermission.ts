import { useCallback, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/**
 * Name of the API whose permissions you want to query
 * @link [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Permissions/query#name)
 */
type Permission =
    PermissionName |
    'accelerometer' |
    'accessibility-events' |
    'ambient-light-sensor' |
    'background-sync' |
    'camera' |
    'clipboard-read' |
    'clipboard-write' |
    'gyroscope' |
    'local-fonts' |
    'magnetometer' |
    'microphone' |
    'payment-handler' |
    'top-level-storage-access' |
    'window-management'

/**
 * Represents the state of a requested permission, combining the standard `PermissionState` with additional internal states.
 *
 * - `checking`: The permission state is being verified.
 * - `not-supported`: The permission check is not supported or an error occurred during verification.
 *
 * @link [`PermissionState`](https://developer.mozilla.org/en-US/docs/Web/API/PermissionStatus/state)
 */
export type UsePermissionState = PermissionState | 'checking' | 'not-supported';

/**
 * 检查浏览器API权限状态的Hook
 * @param {Permission} permission - 要查询的权限名称（如'camera'、'microphone'等）
 * @returns {UsePermissionState} 权限状态，可能的值：
 *   - 'checking': 正在检查权限
 *   - 'granted': 权限已授予
 *   - 'denied': 权限已拒绝
 *   - 'prompt': 需要用户确认
 *   - 'not-supported': 权限检查不受支持或发生错误
 * @note 依赖浏览器的Permissions API，部分浏览器可能不支持
 */
export const usePermission = (permission: Permission): UsePermissionState => {
    const [state, setState] = useState<UsePermissionState>('checking');
    const status = useRef<PermissionStatus | null>(null)

    const handleStatusChange = useCallback((event: Event) => {
        const target = event.target as PermissionStatus
        setState(target.state)
    }, [])

    const checkPermission = useCallback(async () => {
        if (typeof navigator === 'undefined' || !navigator.permissions) {
            setState('not-supported')
            return
        }

        try {
            const result = await navigator.permissions.query({
                name: permission as PermissionName
            })

            setState(result.state)
            result.addEventListener('change', handleStatusChange)
            status.current = result
        } catch {
            setState('not-supported')
            status.current = null
        }
    }, [permission, handleStatusChange])

    useIsomorphicLayoutEffect(() => {
        checkPermission()

        return () => {
            status.current?.removeEventListener('change', handleStatusChange)
        }
    }, [checkPermission, handleStatusChange])

    return state
}