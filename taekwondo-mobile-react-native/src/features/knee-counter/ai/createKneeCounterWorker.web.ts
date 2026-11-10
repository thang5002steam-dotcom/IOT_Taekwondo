import type { KneeWorkerResponse } from "./kneeWorkerProtocol";
export function createKneeCounterWorker(onMessage: (message: KneeWorkerResponse) => void, onError: (error: ErrorEvent) => void): Worker {
  const worker = new Worker(new URL("./kneeCounterWorker.web", window.location.href));
  worker.onmessage = (event: MessageEvent<KneeWorkerResponse>) => onMessage(event.data); worker.onerror = onError; return worker;
}
