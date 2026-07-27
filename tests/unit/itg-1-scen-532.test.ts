import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  reconcileDealStatusAndInvoice,
} from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-532
  test('商談金額が負の値のとき、金額ズレの判定がエラーで終了する', () => {
    const mockLogMessages: string[] = [];
    const mockLogger = {
      error: (msg: string) => {
        mockLogMessages.push(msg);
      },
    };

    const mockNotificationAdapter = {
      sendInvoiceNotification: jest.fn(),
    };

    const dealRecord = {
      dealId: 'DEAL-NEG001',
      dealAmount: -50000,
      dealStatus: 'クローズ予定',
    };

    const invoiceRecord = {
      invoiceId: 'INV-001',
      relatedDealId: 'DEAL-NEG001',
      invoiceAmount: 50000,
      issueStatus: '発行済み',
    };

    const params = {
      deal: dealRecord,
      invoice: invoiceRecord,
      logger: mockLogger,
      notificationAdapter: mockNotificationAdapter,
    };

    expect(() => {
      reconcileDealStatusAndInvoice(params);
    }).toThrow(/負の金額/);

    expect(mockLogMessages.some((msg) => msg.includes('負の金額'))).toBe(true);
    expect(mockNotificationAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
  });
});