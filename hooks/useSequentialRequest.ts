import { useRef, useCallback } from 'react';

type RequestFn<T> = (signal: AbortSignal) => Promise<T>;

const buildCancelableFetch = <T>(requestFn: (signal: AbortSignal) => Promise<T>) => {
    const abortController = new AbortController();

    return {
        run: () => new Promise<T>((resolve, reject) => {
            const cancelTask = () => reject(new Error('CanceledError'));
            if (abortController.signal.aborted) {
                cancelTask();
                return;
            }
            requestFn(abortController.signal).then(resolve, reject);
            abortController.signal.addEventListener('abort', cancelTask);
        }),
        cancel: () => {
            abortController.abort();
        }
    }
}

function useLatest<T>(value: T) {
    const ref = useRef(value);
    ref.current = value;
    
    return ref;
}

export function useSequentialRequest<T>(requestFn: RequestFn<T>) {
    const requestFnRef = useLatest(requestFn);
    const currentRequest = useRef<{ cancel: () => void } | null>(null);
    return useCallback(() => {
        if (currentRequest.current) {
            currentRequest.current.cancel();
        }
        const { run, cancel } = buildCancelableFetch(requestFnRef.current);
        currentRequest.current = { cancel };
        const promise = run().then(res => {
            currentRequest.current = null;
            return res;
        });
        return promise;
    }, [requestFnRef])
}