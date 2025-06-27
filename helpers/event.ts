// event.ts
export interface EventListenerOptions {
    capture?: boolean;
    once?: boolean;
    passive?: boolean;
}

export function on<T extends EventTarget>(
    target: T,
    event: string,
    handler: (event: Event & { target: T }) => void,
    options?: EventListenerOptions
) {
    target.addEventListener(event, handler as EventListener, options);
}

export function off<T extends EventTarget>(
    target: T,
    event: string,
    handler: (event: Event & { target: T }) => void,
    options?: EventListenerOptions
) {
    target.removeEventListener(event, handler as EventListener, options);
}