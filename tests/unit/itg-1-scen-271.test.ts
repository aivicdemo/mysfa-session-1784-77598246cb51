import { validateQuoteDocumentContent } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-271: [normal] 帳票内容検証機能 - 見積書に紐付く請求明細が複数行の場合、すべての行が検証される
  test('should validate all invoice detail lines when quote document has multiple line items', async () => {
    // テストデータ: 見積書ID「QT-2024-001」
    const quoteId = 'QT-2024-001';

    // 見積書に紐付く請求明細を3行で登録
    // 明細行1: 商品A 数量10 単価1000円 = 10000円
    // 明細行2: 商品B 数量5 単価2000円 = 10000円
    // 明細行3: 商品C 数量20 単価500円 = 10000円
    const invoiceDetails = [
      {
        line_number: 1,
        product_name: '商品A',
        quantity: 10,
        unit_price: 1000,
        expected_amount: 10000,
      },
      {
        line_number: 2,
        product_name: '商品B',
        quantity: 5,
        unit_price: 2000,
        expected_amount: 10000,
      },
      {
        line_number: 3,
        product_name: '商品C',
        quantity: 20,
        unit_price: 500,
        expected_amount: 10000,
      },
    ];

    // 見積書合計金額: 30000円
    const expected_total_amount = 30000;
    // 各行の消費税: 8% 適用
    const tax_rate = 0.08;
    const expected_line_1_tax = 10000 * tax_rate; // 800円
    const expected_line_2_tax = 10000 * tax_rate; // 800円
    const expected_line_3_tax = 10000 * tax_rate; // 800円
    const expected_total_tax = 2400; // 800 + 800 + 800

    // DocumentStorageAdapterをスタブ化
    // uploadDocument呼び出しが成功する状態に設定
    const mockDocumentStorage = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: 'DOC-2024-001',
        file_path: '/documents/QT-2024-001.pdf',
        uploaded_at: new Date('2024-01-15T11:00:00Z').toISOString(),
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    // 帳票内容検証機能を実行
    const validationResult = await validateQuoteDocumentContent(
      {
        quote_id: quoteId,
        invoice_details: invoiceDetails,
        total_amount: expected_total_amount,
        tax_rate: tax_rate,
      },
      mockDocumentStorage
    );

    // 検証結果の詳細ログを確認
    // 各請求明細行に対する検証実行状況を調査

    // 明細行1の検証確認
    expect(validationResult.validation_details[0]).toMatchObject({
      line_number: 1,
      product_name: '商品A',
      amount_calculation_result: 10000,
      tax_calculation_result: 800,
      is_valid: true,
    });

    // 明細行2の検証確認
    expect(validationResult.validation_details[1]).toMatchObject({
      line_number: 2,
      product_name: '商品B',
      amount_calculation_result: 10000,
      tax_calculation_result: 800,
      is_valid: true,
    });

    // 明細行3の検証確認
    expect(validationResult.validation_details[2]).toMatchObject({
      line_number: 3,
      product_name: '商品C',
      amount_calculation_result: 10000,
      tax_calculation_result: 800,
      is_valid: true,
    });

    // 合計金額整合性確認: 見積書合計30000円と各明細行合計が一致
    expect(validationResult.total_amount_validation).toMatchObject({
      expected_total: 30000,
      calculated_total: 30000,
      is_matched: true,
    });

    // 全体の消費税計算確認: 8%適用で正しく計算
    expect(validationResult.total_tax_validation).toMatchObject({
      total_tax: expected_total_tax,
      tax_rate: 0.08,
      is_valid: true,
    });

    // 3行すべての請求明細に対して個別の検証結果が記録されていることを確認
    expect(validationResult.validation_details).toHaveLength(3);
    expect(validationResult.validation_details.every((detail) => detail.is_valid === true)).toBe(
      true
    );

    // 未検証または検証スキップされた行が存在しないこと
    expect(validationResult.validation_details.every((detail) => detail.is_valid !== null)).toBe(
      true
    );

    // uploadDocumentの呼び出しが成功したことを確認
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalled();

    // 全体的な検証ステータスが成功であること
    expect(validationResult.overall_validation_status).toBe('SUCCESS');
  });
});