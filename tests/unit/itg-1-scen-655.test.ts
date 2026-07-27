import { describe, test, expect } from '@jest/globals';
import { resolveSalesAndInvoiceDiscrepancy } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-655
  test('売上計上予定日が空のとき、バリデーションエラーが発生する', () => {
    const salesPerformanceRecord = {
      salesPerformanceId: 'SP-20240415-001',
      customerId: 'CUST-12345',
      amount: 500000,
      salesCategory: '製品販売',
      salesDatePlanned: null,
      invoiceNumber: null,
      invoiceDate: null,
      invoiceAmount: null,
      status: 'pending_reconciliation'
    };

    const discrepancyData = {
      recordId: 'SP-20240415-001',
      salesDatePlanned: null
    };

    expect(() => {
      resolveSalesAndInvoiceDiscrepancy(discrepancyData);
    }).toThrow(/売上計上予定日/);
  });
});