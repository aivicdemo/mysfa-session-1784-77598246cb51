import { describe, test, expect } from '@jest/globals';
import { validateInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け - 請求書承認検証', () => {
  // SCEN-912
  test('should reject invoice validation when approver information is missing', () => {
    const invoiceWithMissingApprover = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-001',
      customerName: 'テスト株式会社',
      amount: 100000,
      invoiceDate: '2024-01-15',
      dueDate: '2024-02-15',
      lineItems: [
        {
          itemId: 'ITEM-001',
          description: '商品A',
          quantity: 1,
          unitPrice: 100000,
          totalPrice: 100000,
        },
      ],
      approverName: '',
      approverId: null,
      approvalDate: null,
    };

    expect(() => validateInvoiceApproval(invoiceWithMissingApprover)).toThrow(
      /承認者情報/,
    );
  });
});