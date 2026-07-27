import { describe, test, expect, beforeEach } from '@jest/globals';
import { reconcileOrderStatusAndInvoiceIssuance } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  let documentStorageAdapterStub: any;
  let notificationServiceAdapterStub: any;

  beforeEach(() => {
    documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'file-stub-001',
        url: 'https://example.com/files/file-stub-001'
      })
    };

    notificationServiceAdapterStub = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-stub-001',
        deliveryStatus: 'sent'
      })
    };
  });

  // SCEN-559
  test('ステータスが「受注」と完全一致する場合のみ条件に該当する', async () => {
    const dealRecord = {
      dealId: 'DEAL-001',
      status: '受注',
      amount: 100000,
      customerId: 'CUST-001',
      invoiceIssuedDate: null,
      invoiceAmount: null
    };

    const result = await reconcileOrderStatusAndInvoiceIssuance(
      dealRecord,
      documentStorageAdapterStub,
      notificationServiceAdapterStub
    );

    expect(result.dealId).toBe('DEAL-001');
    expect(result.statusMatchResult).toBe('合致');
    expect(result.conditionMatched).toBe(true);
    expect(result.reconciliationLog).toContain('商談ID=DEAL-001');
    expect(result.reconciliationLog).toContain('ステータス照合結果=合致');
    expect(result.invoiceIssuanceProcessed).toBe(false);
    expect(documentStorageAdapterStub.uploadDocument).not.toHaveBeenCalled();
    expect(notificationServiceAdapterStub.sendInvoiceNotification).not.toHaveBeenCalled();
  });
});