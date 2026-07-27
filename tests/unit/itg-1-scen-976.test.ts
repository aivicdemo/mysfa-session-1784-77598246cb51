import { describe, test, expect, beforeEach } from '@jest/globals';
import { detectStatusMismatchInSalesAndInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-976
  test('[error] 売上実績・請求状況照合機能 - 売上実績のステータスが確定済みで請求書が未発行の場合、ステータス不整合として検出される', () => {
    const salesRecordId = 'SR-20240415-001';
    const invoiceId = 'INV-20240415-001';
    const detectionTimestamp = new Date('2024-04-15T10:30:00Z');

    const salesRecord = {
      id: salesRecordId,
      status: '確定済み',
      amount: 500000,
    };

    const invoiceRecord = {
      id: invoiceId,
      status: '未発行',
      salesRecordId: salesRecordId,
    };

    const result = detectStatusMismatchInSalesAndInvoice(
      salesRecord,
      invoiceRecord,
      detectionTimestamp
    );

    expect(result).toEqual({
      mismatchDetected: true,
      mismatchType: 'ステータス不整合',
      salesRecordId: salesRecordId,
      salesStatus: '確定済み',
      invoiceStatus: '未発行',
      invoiceId: invoiceId,
      detectionDateTime: detectionTimestamp,
    });
  });
});