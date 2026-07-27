import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { fetchTransactionHistoryAndActivityRecords } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // SCEN-457
  test('顧客IDが指定されていない場合、エラーが発生する', () => {
    const customerId = null;

    const result = () => fetchTransactionHistoryAndActivityRecords(customerId);

    expect(result).toThrow(/顧客ID/);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Customer ID is required to load transaction history and activity records')
    );
  });
});