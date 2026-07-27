import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import * as logic from '../../src/logic/it-1784969823049-2-1-2';

describe('DocumentStorageAdapter uploadDocument retry behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-153
  test('should retry uploadDocument up to 3 times with exponential backoff (1s→2s→4s) when API fails', async () => {
    const callTimestamps: number[] = [];
    let callCount = 0;

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(async () => {
        callCount++;
        callTimestamps.push(Date.now());
        throw new Error('Upload failed: Google Drive API unavailable');
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const pdfBuffer = Buffer.from('mock pdf content');
    const uploadPath = '/documents/invoice-2024-01-15.pdf';

    let caughtError: Error | null = null;
    try {
      await logic.uploadDocumentWithRetry(
        mockDocumentStorageAdapter,
        pdfBuffer,
        uploadPath
      );
    } catch (error) {
      caughtError = error as Error;
    }

    expect(callCount).toBe(3);
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(3);
    expect(callTimestamps).toHaveLength(3);

    const interval1To2 = callTimestamps[1] - callTimestamps[0];
    const interval2To3 = callTimestamps[2] - callTimestamps[1];

    expect(interval1To2).toBeGreaterThanOrEqual(900);
    expect(interval1To2).toBeLessThanOrEqual(1100);

    expect(interval2To3).toBeGreaterThanOrEqual(1900);
    expect(interval2To3).toBeLessThanOrEqual(2100);

    expect(caughtError).not.toBeNull();
    expect(caughtError?.message).toMatch(/Upload failed/);
  });
});