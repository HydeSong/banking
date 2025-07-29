import { useEffect, useRef, useCallback } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

type ValidEventTarget = HTMLElement | Document | Window | EventTarget | null;

export function useEventListener(
    eventName: string,
    handler: (event: Event) => void,
    element?: React.RefObject<ValidEventTarget>,
) {
    const savedHandler = useRef(handler);
    const eventListener = useCallback((event: Event) => savedHandler.current(event), [savedHandler]);

    useIsomorphicLayoutEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const targetElement = element?.current || window;

        if (!(targetElement && targetElement.addEventListener)) {
            return;
        }

        targetElement.addEventListener(eventName, eventListener);
        return () => {
            targetElement.removeEventListener(eventName, eventListener);
        };
    }, [eventName, element, eventListener]);
}