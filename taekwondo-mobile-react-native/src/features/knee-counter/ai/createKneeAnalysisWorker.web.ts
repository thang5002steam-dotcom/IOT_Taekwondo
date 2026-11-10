import type { KneeAnalysisWorkerResponse } from "./kneeAnalysisWorkerProtocol";

export function createKneeAnalysisWorker(
  onMessage: (message: KneeAnalysisWorkerResponse) => void,
  onError: (error: ErrorEvent) => void,
): Worker {
  const worker = new Worker(new URL("./kneeAnalysisWorker.web", window.location.href));
  worker.onmessage = (event: MessageEvent<KneeAnalysisWorkerResponse>) => onMessage(event.data);
  worker.onerror = onError;
  return worker;
}
