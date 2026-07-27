import { validateInvoiceForApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-904
  test('請求書に紐付く注文レコードが存在しないとき検証が不合格になる', async () => {
    const mockInvoice = {
      invoiceId: 'INV-001',
      customerId: 'CUST-123',
      amount: 100000,
      status: '承認待ち',
      createdAt: new Date('2024-01-15T11:00:00Z'),
    };

    const mockOrderQueryStub = jest.fn().mockResolvedValue([]);

    const result = await validateInvoiceForApproval(mockInvoice, mockOrderQueryStub);

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toMatch(/INV-001/);
    expect(result.errorMessage).toMatch(/注文レコード/);
    expect(mockInvoice.status).toBe('承認待ち');
  });
});