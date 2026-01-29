/**
 * ASR IPC handlers.
 * Stub implementation - actual logic will be implemented in asr-integration task.
 */

import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/channels';

/**
 * Setup ASR IPC handlers.
 * These are stub implementations that will be completed in the asr-integration task.
 */
export function setupASRHandlers(): void {
  // Handle ASR start request
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.handle(IPC_CHANNELS.ASR.START, async (_event, _config) => {
    // TODO: Implement in asr-integration task
    // - Initialize ASR service with config
    // - Start audio capture
    // - Connect to Volcengine WebSocket
    return { success: true };
  });

  // Handle ASR stop request
  ipcMain.handle(IPC_CHANNELS.ASR.STOP, async () => {
    // TODO: Implement in asr-integration task
    // - Stop audio capture
    // - Close WebSocket connection
    // - Clean up resources
    return { success: true };
  });

  // Handle incoming audio data from renderer
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.on(IPC_CHANNELS.ASR.SEND_AUDIO, (_event, _chunk) => {
    // TODO: Implement in asr-integration task
    // - Forward audio chunk to Volcengine WebSocket
    // - Handle backpressure if needed
  });
}
