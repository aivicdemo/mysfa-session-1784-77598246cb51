import { validateInvoiceApproval } from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-872
  test('請求書に紐付く商談が存在しないとき検証が不合格になる', () => {
    const invoiceData = {
      invoiceId: 'INV-999',
      customerId: 'CUST-001',
      amount: 100000,
      dealId: null,
      issueDate: '2024-01-15',
      requiredFields: {
        customerName: 'テスト顧客',
        invoiceAmount: 100000,
        lineItems: [
          {
            itemName: '商品A',
            quantity: 1,
            unitPrice: 100000,
          },
        ],
      },
    };

    const dealRepositoryStub = {
      findById: jest.fn().mockResolvedValue(null),
    };

    expect(async () => {
      await validateInvoiceApproval(invoiceData, dealRepositoryStub);
    }).rejects.toThrow(/商談/);
  });
});