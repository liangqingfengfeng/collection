const buildCancelableTask = <T>(asyncFn: () => Promise<T>) => {
    const abortController = new AbortController();

    return {
        run: () => new Promise<T>((resolve, reject) => {
            const cancelTask = () => reject(new Error('CanceledError'));
            if (abortController.signal.aborted) {
                cancelTask();
                return;
            }
            asyncFn().then(resolve, reject);
            abortController.signal.addEventListener('abort', cancelTask);
        }),
        cancel: () => {
            abortController.abort();
        }
    }
}

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

const ret = buildCancelableFetch(async signal => {
    return fetch('http://localhost:5000', { signal }).then(res =>
      res.text(),
    );
  });
  ​
  (async () => {
    try {
      const val = await ret.run();
      console.log('val: ', val);
    } catch (err) {
      console.log('err: ', err);
    }
  })();
  ​
  setTimeout(() => {
    ret.cancel();
  }, 500);