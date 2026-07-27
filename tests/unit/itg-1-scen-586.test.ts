import { generateInvoiceFromDeal } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  test('SCEN-586: 請求書自動生成機能 - 商談レコードから顧客情報・金額・明細を正しく抽出して請求書を生成する', () => {
    // 商談レコードの明細行1
    const line_item_1 = {
      line_item_id: 'line-001',
      item_name: 'コンサルティング',
      quantity: 10,
      unit: '日',
      unit_price: 30000,
      subtotal: 300000,
    };

    // 商談レコードの明細行2
    const line_item_2 = {
      line_item_id: 'line-002',
      item_name: 'システム導入支援',
      quantity: 10,
      unit: '日',
      unit_price: 25000,
      subtotal: 250000,
    };

    // テスト用の商談レコード
    const deal_record = {
      deal_id: 'deal-586-001',
      customer_name: '株式会社ABC',
      customer_email: 'contact@abc.co.jp',
      customer_address: '東京都渋谷区1-1-1',
      deal_amount: 550000,
      tax_rate: 0.1,
      line_items: [line_item_1, line_item_2],
    };

    // DocumentStorageAdapterのスタブ設定
    const mock_document_storage_adapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: 'doc-12345',
        status: 'success',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    // 請求書自動生成機能を実行
    const generated_invoice = generateInvoiceFromDeal(
      deal_record,
      mock_document_storage_adapter
    );

    // 顧客情報セクションの検証
    expect(generated_invoice.customer_section.customer_name).toBe('株式会社ABC');
    expect(generated_invoice.customer_section.customer_email).toBe('contact@abc.co.jp');
    expect(generated_invoice.customer_section.customer_address).toBe('東京都渋谷区1-1-1');

    // 金額セクションの検証
    // 小計: 550,000円（100万のうちの55万）
    expect(generated_invoice.amount_section.subtotal).toBe(550000);
    // 消費税: 55,000円（550,000 × 0.1）
    expect(generated_invoice.amount_section.tax_amount).toBe(55000);
    // 合計: 605,000円（550,000 + 55,000）
    expect(generated_invoice.amount_section.total_amount).toBe(605000);

    // 明細セクションの検証
    expect(generated_invoice.line_items_section).toHaveLength(2);
    expect(generated_invoice.line_items_section[0]).toEqual({
      line_item_id: 'line-001',
      item_name: 'コンサルティング',
      quantity: 10,
      unit: '日',
      unit_price: 30000,
      subtotal: 300000,
    });
    expect(generated_invoice.line_items_section[1]).toEqual({
      line_item_id: 'line-002',
      item_name: 'システム導入支援',
      quantity: 10,
      unit: '日',
      unit_price: 25000,
      subtotal: 250000,
    });

    // DocumentStorageAdapter.uploadDocumentが正確に1回呼び出されたことを検証
    expect(mock_document_storage_adapter.uploadDocument).toHaveBeenCalledTimes(1);
    // uploadDocumentが商談IDと生成されたPDFバイナリを含む引数で呼び出されたことを検証
    const upload_call_args = mock_document_storage_adapter.uploadDocument.mock.calls[0];
    expect(upload_call_args[0]).toEqual({
      deal_id: 'deal-586-001',
      pdf_binary: expect.any(Buffer),
      file_name: expect.stringMatching(/請求書/),
    });
  });
});