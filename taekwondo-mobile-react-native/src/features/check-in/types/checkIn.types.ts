export * from './faceScanner.types';

// Legacy compatibility aliases
export type ScanState =
  | 'SCANNING'
  | 'ANALYZING'
  | 'SUCCESS'
  | 'ERROR'
  | 'initializing'
  | 'scanning'
  | 'face-ready'
  | 'capturing'
  | 'submitting'
  | 'result'
  | 'error';
