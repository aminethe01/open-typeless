/**
 * Global type declarations for the Electron application.
 * Extends the Window interface with the exposed API.
 */

import type { ASRConfig, ASRResult, ASRStatus } from '../shared/types/asr';

/**
 * ASR API interface exposed via contextBridge.
 */
interface ASRApi {
  /**
   * Start ASR session.
   * @param config - Optional partial ASR configuration
   */
  start: (config?: Partial<ASRConfig>) => Promise<{ success: boolean }>;

  /**
   * Stop ASR session.
   */
  stop: () => Promise<{ success: boolean }>;

  /**
   * Send audio chunk to main process.
   * @param chunk - Audio data as ArrayBuffer
   */
  sendAudio: (chunk: ArrayBuffer) => void;

  /**
   * Subscribe to ASR results.
   * @param callback - Called when ASR result is received
   * @returns Unsubscribe function
   */
  onResult: (callback: (result: ASRResult) => void) => () => void;

  /**
   * Subscribe to ASR status changes.
   * @param callback - Called when ASR status changes
   * @returns Unsubscribe function
   */
  onStatus: (callback: (status: ASRStatus) => void) => () => void;

  /**
   * Subscribe to ASR errors.
   * @param callback - Called when ASR error occurs
   * @returns Unsubscribe function
   */
  onError: (callback: (error: string) => void) => () => void;
}

/**
 * Application API exposed to the renderer process.
 */
interface AppApi {
  asr: ASRApi;
}

declare global {
  interface Window {
    api: AppApi;
  }
}

export {};
