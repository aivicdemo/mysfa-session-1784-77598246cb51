import { validateDocumentContent } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け - 帳票内容検証機能', () => {
  test('SCEN-261: 顧客情報と商談金額は入力済みだが明細行すべてが欠落している場合、明細欠落警告を表示する', () => {
    const customerInfo = {
      customerId: 'CUST-001',
      customerName: '株式会社テスト',
      address: '東京都渋谷区道玄坂1-2-3',
      phoneNumber: '03-1234-5678',
      email: 'contact@test-company.jp',
    };

    const dealAmount = 500000;

    const documentItems: never[] = [];

    const result = validateDocumentContent({
      customerInfo,
      dealAmount,
      documentItems,
    });

    expect(result.isValid).toBe(false);
    expect(result.warnings).toContain(/明細行が欠落/);
    expect(result.shouldBlockGeneration).toBe(true);
  });
});