import { validateQuotationContent } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-267
  test('帳票内容検証機能 - 顧客情報の電話番号形式が不正な場合、警告を表示する', () => {
    const invalidPhoneNumbers = [
      'abc-1234',
      '12345',
      '090-1234-',
      '123-456-789',
      '090123456789',
      '090--1234-5678',
      '',
      '   ',
    ];

    invalidPhoneNumbers.forEach((phoneNumber) => {
      const quotationData = {
        quotationId: 'QT-2024-001',
        customerId: 'CUST-001',
        customerName: 'テスト顧客株式会社',
        customerPhone: phoneNumber,
        customerEmail: 'test@example.com',
        quotationAmount: 100000,
        quotationDate: new Date('2024-01-15T11:00:00Z'),
        items: [
          {
            itemId: 'ITEM-001',
            itemName: 'サービスA',
            quantity: 1,
            unitPrice: 100000,
            lineAmount: 100000,
          },
        ],
      };

      const validationResult = validateQuotationContent(quotationData);

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'customerPhone',
            message: expect.stringMatching(/電話番号.*形式/),
          }),
        ])
      );
      expect(validationResult.canFinalize).toBe(false);
    });
  });
});