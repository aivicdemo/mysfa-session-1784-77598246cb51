import { reconcileDealStatusAndInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-550
  test('商談レコードが空オブジェクトのときは処理をスキップできる', () => {
    // Arrange
    const emptyDealRecord = {};
    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    // Act
    const result = reconcileDealStatusAndInvoice(emptyDealRecord, mockLogger);

    // Assert
    // 処理がスキップされたことを確認
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringMatching(/商談レコードが空のためスキップ/)
    );

    // エラーログが出力されていないことを確認
    expect(mockLogger.error).not.toHaveBeenCalled();

    // 戻り値がスキップを示す状態であることを確認
    expect(result).toEqual({
      status: 'skipped',
      dealStatus: undefined,
      invoiceStatus: undefined,
      discrepancy: null,
      recordModified: false,
    });

    // 商談ステータスが未変更であることを確認
    expect(emptyDealRecord).toEqual({});

    // 処理後のシステム状態が変更されていないことを確認
    expect(Object.keys(emptyDealRecord).length).toBe(0);
  });
});