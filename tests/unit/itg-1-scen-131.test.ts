import { validateGeneratedDocumentDetails } from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-131
  test('帳票生成検証機能 - 生成された帳票の明細が1行も存在しない場合に警告が表示される', () => {
    const documentData = {
      documentType: '売上レポート',
      customerId: 'CUST-001',
      dealId: 'DEAL-001',
      generatedDate: '2024-01-15T11:00:00Z',
      details: [],
    };

    expect(() => {
      validateGeneratedDocumentDetails(documentData);
    }).toThrow(/明細/);
  });
});