import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  validateAndReconcileSalesAndBilling,
} from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-941
  test('売上計上予定日が無効な日付形式の場合、エラーが返される', () => {
    const invalidDateFormats = [
      '2024-13-45',
      '2024/2/30',
      'abc',
      '',
      '2024-02-30',
      '2024-13-01',
      'invalid-date',
      '2024/02/30',
      '99999-99-99',
    ];

    invalidDateFormats.forEach((invalidDate) => {
      const reconciliationInput = {
        salesRecordId: 'SALES_001',
        expectedInvoiceDate: '2024-04-15',
        actualInvoiceDate: '2024-04-20',
        salesAmountExpected: 50000,
        invoiceAmountActual: 50000,
        projectedSalesDate: invalidDate,
      };

      expect(() =>
        validateAndReconcileSalesAndBilling(reconciliationInput)
      ).toThrow(/売上計上予定日/);
    });
  });
});