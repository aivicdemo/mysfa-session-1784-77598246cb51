import { updateDealStatusAndLinkInvoice } from "../../src/logic/it-1-2";

describe("商談ステータスと請求データの紐付け", () => {
  test("SCEN-230: 商談ステータスを成約に変更した場合、GoogleDriveAPIで請求書PDFの生成が成功すると請求データ紐付けが完了する", async () => {
    // テストデータの準備
    const customer_id = "CUST-001";
    const customer_name = "テスト顧客";
    const customer_email = "test@example.com";

    const deal_id = "DEAL-001";
    const deal_status_before = "交渉中";
    const deal_amount = 100000;
    const deal_name = "テスト商談";

    const invoice_amount = 100000;
    const invoice_currency = "JPY";

    // DocumentStorageAdapterのモック化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: "DOC-2024-001",
        upload_status: "completed",
        uploaded_at: "2024-01-15T11:00:00Z",
        file_size_bytes: 125000,
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    // 商談更新リクエストのペイロード
    const deal_update_request = {
      deal_id: deal_id,
      new_status: "成約",
      customer_id: customer_id,
      customer_name: customer_name,
      customer_email: customer_email,
      deal_amount: deal_amount,
      deal_name: deal_name,
      invoice_line_items: [
        {
          item_description: "商品A",
          quantity: 1,
          unit_price: 100000,
          line_total: 100000,
        },
      ],
    };

    // テスト実行: 商談ステータス更新と請求データ紐付け処理
    const result = await updateDealStatusAndLinkInvoice(
      deal_update_request,
      mockDocumentStorageAdapter
    );

    // 検証1: 商談ステータスが「成約」に更新されたことを確認
    expect(result.deal_status_updated).toBe(true);
    expect(result.new_status).toBe("成約");

    // 検証2: 請求書PDF生成処理が実行されたことを確認
    expect(result.invoice_generation_triggered).toBe(true);

    // 検証3: DocumentStorageAdapterのuploadDocumentメソッドが呼び出されたことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    const upload_call_args = mockDocumentStorageAdapter.uploadDocument.mock
      .calls[0][0];
    expect(upload_call_args).toHaveProperty("document_type", "invoice");
    expect(upload_call_args).toHaveProperty("customer_id", customer_id);
    expect(upload_call_args).toHaveProperty("deal_id", deal_id);

    // 検証4: DocumentStorageAdapterからの成功レスポンス（DOC-2024-001）を確認
    expect(result.document_id).toBe("DOC-2024-001");
    expect(result.upload_status).toBe("completed");

    // 検証5: 請求データレコードが作成され、請求IDが付与されたことを確認
    expect(result.invoice_id).toBeDefined();
    expect(result.invoice_id).toMatch(/^INV-2024-\d+$/);

    // 検証6: 請求データが商談情報とドキュメントIDで完全に紐付けられていることを確認
    expect(result.invoice_record).toEqual({
      invoice_id: result.invoice_id,
      deal_id: deal_id,
      document_id: "DOC-2024-001",
      status: "請求待ち",
      invoice_amount: invoice_amount,
      invoice_currency: invoice_currency,
      customer_id: customer_id,
      customer_name: customer_name,
      customer_email: customer_email,
      created_at: expect.stringMatching(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
      ),
    });

    // 検証7: 請求データテーブルへの保存成功を確認
    expect(result.invoice_persisted).toBe(true);
    expect(result.invoice_link_status).toBe("linked");
  });
});