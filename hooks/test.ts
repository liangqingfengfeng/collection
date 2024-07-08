import { useSequentialRequest } from './useSequentialRequest';
​
export function App() {
  const run = useSequentialRequest(async (signal: AbortSignal) => {
    const ret = await fetch('http://localhost:5000', { signal }).then(
      res => res.text(),
    );
    console.log(ret);
  });
​
  return (
    <button onClick={run}>Run</button>
  );
}