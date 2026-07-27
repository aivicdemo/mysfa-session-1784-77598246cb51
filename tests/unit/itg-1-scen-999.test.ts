import { uploadDocument } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-999
  test('Google Drive API連携 - uploadDocumentが失敗した場合、指数バックオフで最大3回の再試行が実行される', async () => {
    // モック設定: DocumentStorageAdapter.uploadDocument の呼び出し履歴とタイミング
    const mockCallTimes: number[] = [];
    let callCount = 0;

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(async (pdfBinary: Uint8Array, metadata: { fileName: string }) => {
        callCount += 1;
        mockCallTimes.push(Date.now());

        // 初回（1回目）と2回目の呼び出しで NetworkError を発生
        if (callCount === 1 || callCount === 2) {
          throw new Error('NetworkError: Connection timeout');
        }

        // 3回目の呼び出しで成功、fileId を返す
        if (callCount === 3) {
          return { fileId: 'doc-12345', url: 'https://drive.google.com/file/d/doc-12345' };
        }
      }),
    };

    const pdfBinary = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // PDF ファイルシグネチャ
    const metadata = { fileName: 'invoice-2024-001.pdf' };

    // uploadDocument 関数を呼び出し
    const result = await uploadDocument(pdfBinary, metadata, mockDocumentStorageAdapter);

    // DocumentStorageAdapter.uploadDocument が合計3回呼び出されたことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(3);

    // 各呼び出しのタイミングが指数バックオフのスケジュールに従うか検証
    // 初回失敗 → 1秒待機 → 2回目失敗 → 2秒待機 → 3回目成功
    expect(mockCallTimes.length).toBe(3);

    // 1回目と2回目の呼び出しの間隔が約1秒（許容範囲: 800ms～1200ms）
    const interval_1st_to_2nd = mockCallTimes[1] - mockCallTimes[0];
    expect(interval_1st_to_2nd).toBeGreaterThanOrEqual(800);
    expect(interval_1st_to_2nd).toBeLessThanOrEqual(1200);

    // 2回目と3回目の呼び出しの間隔が約2秒（許容範囲: 1800ms～2200ms）
    const interval_2nd_to_3rd = mockCallTimes[2] - mockCallTimes[1];
    expect(interval_2nd_to_3rd).toBeGreaterThanOrEqual(1800);
    expect(interval_2nd_to_3rd).toBeLessThanOrEqual(2200);

    // 最終的に関数が fileId: 'doc-12345' を返すことを確認
    expect(result).toEqual({
      fileId: 'doc-12345',
      url: 'https://drive.google.com/file/d/doc-12345',
    });

    // 各呼び出しの引数を検証
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenNthCalledWith(
      1,
      pdfBinary,
      metadata
    );
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenNthCalledWith(
      2,
      pdfBinary,
      metadata
    );
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenNthCalledWith(
      3,
      pdfBinary,
      metadata
    );
  });
});