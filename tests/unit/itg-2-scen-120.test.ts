import { validateInvoiceLineItems } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-120
  test('[normal] 請求書承認検証機能 - 請求書明細に商談に無い品目が含まれるとき、明細整合性の警告を生成する', () => {
    // Arrange: テスト用の商談データを準備
    const deal = {
      dealId: 'DEAL-001',
      lineItems: [
        {
          sku: 'SKU-A01',
          productName: '品目A',
          quantity: 2,
          unitPrice: 1000,
        },
        {
          sku: 'SKU-B01',
          productName: '品目B',
          quantity: 1,
          unitPrice: 2000,
        },
      ],
    };

    // テスト用の請求書明細データを準備
    const invoice = {
      invoiceId: 'INV-001',
      dealId: 'DEAL-001',
      lineItems: [
        {
          sku: 'SKU-A01',
          productName: '品目A',
          quantity: 2,
          unitPrice: 1000,
          lineTotal: 2000,
        },
        {
          sku: 'SKU-B01',
          productName: '品目B',
          quantity: 1,
          unitPrice: 2000,
          lineTotal: 2000,
        },
        {
          sku: 'SKU-C01',
          productName: '品目C',
          quantity: 1,
          unitPrice: 1500,
          lineTotal: 1500,
        },
      ],
    };

    // Act: validateInvoiceLineItems メソッドを実行
    const validationResult = validateInvoiceLineItems(deal, invoice);

    // Assert: 警告タイプ「LINE_ITEM_MISMATCH」を含む検証結果を確認
    expect(validationResult.warnings).toBeDefined();
    expect(validationResult.warnings.length).toBeGreaterThan(0);

    const mismatchWarning = validationResult.warnings.find(
      (w: any) => w.type === 'LINE_ITEM_MISMATCH'
    );
    expect(mismatchWarning).toBeDefined();
    expect(mismatchWarning.message).toContain('品目C');
    expect(mismatchWarning.message).toContain('SKU-C01');
    expect(mismatchWarning.message).toContain('商談に含まれていません');
    expect(mismatchWarning.severity).toBe('WARNING');
    expect(mismatchWarning.targetSku).toBe('SKU-C01');
  });
});