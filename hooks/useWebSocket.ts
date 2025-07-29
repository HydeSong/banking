import { useState, useEffect, useRef } from 'react';

export enum WebSocketStatus {
    CONNECTING = 'CONNECTING',
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
    RECONNECTING = 'RECONNECTING',
}

export interface WebSocketHook {
    lastMessage: string | null;
    status: WebSocketStatus;
    sendMessage: (message: string) => void;
}
export interface WebSocketOptions {
    maxReconnectAttempts?: number; // Max attempts for reconnection
    reconnectDelay?: (attempt: number) => number; // Function to calculate delay
    onOpen?: () => void; // Callback for WebSocket open event
    onMessage?: (message: string) => void; // Callback for incoming messages
    onError?: (error: Event) => void; // Callback for WebSocket errors
    onClose?: (event: CloseEvent) => void; // Callback for WebSocket close event
}

/**
 * 管理WebSocket连接的React Hook，支持自动重连和状态管理
 * @enum {string} WebSocketStatus - WebSocket连接状态枚举
 * @property {string} CONNECTING - 连接中
 * @property {string} OPEN - 已连接
 * @property {string} CLOSED - 已关闭
 * @property {string} RECONNECTING - 重连中
 * @interface WebSocketHook - Hook返回值接口
 * @property {string|null} lastMessage - 最后一条收到的消息
 * @property {WebSocketStatus} status - 当前连接状态
 * @property {(message: string) => void} sendMessage - 发送消息的函数
 * @interface WebSocketOptions - WebSocket配置选项
 * @property {number} [maxReconnectAttempts=5] - 最大重连尝试次数
 * @property {(attempt: number) => number} [reconnectDelay] - 计算重连延迟的函数
 * @property {() => void} [onOpen] - 连接打开时的回调
 * @property {(message: string) => void} [onMessage] - 收到消息时的回调
 * @property {(error: Event) => void} [onError] - 发生错误时的回调
 * @property {(event: CloseEvent) => void} [onClose] - 连接关闭时的回调
 * @param {string} url - WebSocket连接URL
 * @param {WebSocketOptions} [options] - WebSocket配置选项
 * @returns {WebSocketHook} 包含连接状态和操作函数的对象
 * @example
 * // 基础用法
 * const { lastMessage, status, sendMessage } = useWebSocket('wss://example.com/ws');
 * 
 * // 带重连配置的高级用法
 * const { lastMessage, status, sendMessage } = useWebSocket('wss://example.com/ws', {
 *   maxReconnectAttempts: 3,
 *   reconnectDelay: (attempt) => attempt * 1000,
 *   onOpen: () => console.log('连接成功'),
 *   onMessage: (msg) => console.log('收到消息:', msg)
 * });
 */
export const useWebSocket = (
    url: string,
    {
        maxReconnectAttempts = 5,
        reconnectDelay = (attempt) => Math.min(5000, Math.pow(2, attempt) * 1000), // Default: exponential backoff
        onOpen,
        onMessage,
        onError,
        onClose,
    }: WebSocketOptions = {},
): WebSocketHook => {
    const [lastMessage, setLastMessage] = useState<string | null>(null);
    const [status, setStatus] = useState<WebSocketStatus>(
        WebSocketStatus.CONNECTING,
    );
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttempts = useRef<number>(0); // Tracks reconnection attempts

    const connectWebSocket = () => {
        setStatus(WebSocketStatus.CONNECTING);
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            setStatus(WebSocketStatus.OPEN);
            reconnectAttempts.current = 0; // Reset reconnection attempts
            onOpen?.(); // Trigger custom callback
        };

        ws.onmessage = (event) => {
            setLastMessage(event.data);
            onMessage?.(event.data); // Trigger custom callback
        };

        ws.onerror = (error) => {
            onError?.(error); // Trigger custom callback
        };

        ws.onclose = (event) => {
            setStatus(WebSocketStatus.CLOSED);
            onClose?.(event); // Trigger custom callback

            // Attempt to reconnect if below the max attempts
            if (reconnectAttempts.current < maxReconnectAttempts) {
                reconnectAttempts.current += 1;
                setStatus(WebSocketStatus.RECONNECTING);
                setTimeout(connectWebSocket, reconnectDelay(reconnectAttempts.current));
            }
        };
    };

    const sendMessage = (message: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(message);
        } else {
            console.warn('WebSocket is not open.');
        }
    };

    useEffect(() => {
        connectWebSocket();

        return () => {
            wsRef.current?.close();
        };
    }, [url]);

    return { lastMessage, status, sendMessage };
};