import { useState, useEffect } from 'react';

const useMutation = <T = any, P = any>(
    apiUrl: string,
    payload: P,
    headers: Record<string, string> = {},
    options: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; timeout?: number } = {},
    onSuccess?: (data: T) => void,
    onError?: (error: { message: string; status?: number }) => void
) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [response, setResponse] = useState<any | null>(null);
    const [error, setError] = useState<{ message: string; status?: number } | null>(null);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();
        const { signal } = controller;
        const timeoutId = options.timeout ? setTimeout(() => {
            if (isMounted) {
                setLoading(false);
                setError({ message: 'Request timed out' });
                controller.abort();
            }
        }, options.timeout) : undefined;

        setLoading(true);
        setError(null);

        fetch(apiUrl, {
            method: options.method || 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify(payload),
            signal,
        })
            .then((response) => {
                clearTimeout(timeoutId);
                if (!response.ok) {
                    const error = new Error(`Request failed with status ${response.status}`);
                    (error as any).status = response.status;
                    throw error;
                }
                return response.json() as Promise<T>;
            })
            .then((data) => {
                if (isMounted) {
                    setLoading(false);
                    setResponse(data);
                    if (onSuccess) {
                        onSuccess(data);
                    }
                }
            })
            .catch((error) => {
                if (isMounted) {
                    setLoading(false);
                    setError(error.message || 'Something went wrong');
                    if (onError) {
                        onError(error.message || 'Something went wrong');
                    }
                }
            });

        return () => {
            isMounted = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [apiUrl, payload, headers, options.timeout, onSuccess, onError]);

    return { loading, response, error };
};

export default useMutation;