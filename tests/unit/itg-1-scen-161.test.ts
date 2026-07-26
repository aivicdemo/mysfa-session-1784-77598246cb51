import { generateUnifiedFormatDocuments } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  // SCEN-161: [normal] 見積・注文・請求書統一フォーマット自動生成機能 - 商談ステータスが『成約』に更新され、必須情報が完全に入力されている場合、統一フォーマットの帳票が自動生成される
  test("商談ステータスが成約に更新され必須情報が完全入力の場合、統一フォーマットの見積書・注文書・請求書が自動生成される", () => {
    const deal_record = {
      deal_id: "DL-20240415-001",
      customer_name: "株式会社サンプル",
      customer_id: "CUST-12345",
      product_name: "営業管理システム導入サービス",
      quantity: 1,
      unit_price: 5000000,
      total_amount: 5000000,
      tax_rate: 0.1,
      tax_amount: 500000,
      grand_total: 5500000,
      billing_address: "東京都渋谷区道玄坂1-2-3",
      shipping_address: "東京都渋谷区道玄坂1-2-3",
      responsible_person_name: "山田太郎",
      responsible_person_email: "yamada.taro@example.com",
      responsible_person_phone: "03-XXXX-XXXX",
      delivery_date: "2024-05-31",
      status: "成約",
      line_items: [
        {
          item_id: "ITEM-001",
          item_name: "営業管理システム導入サービス",
          item_quantity: 1,
          item_unit_price: 5000000,
          item_subtotal: 5000000,
          item_description: "システム導入、初期設定、ユーザー研修を含む"
        }
      ],
      created_at: "2024-04-15T10:00:00Z",
      updated_at: "2024-04-15T14:30:00Z",
      sales_person_id: "EMP-9876",
      sales_person_name: "鈴木花子",
      deal_amount: 5000000,
      currency: "JPY"
    };

    const result = generateUnifiedFormatDocuments(deal_record);

    // 戻り値の型と構造を検証
    expect(result).toBeDefined();
    expect(result).toHaveProperty("quotation");
    expect(result).toHaveProperty("order");
    expect(result).toHaveProperty("invoice");
    expect(result).toHaveProperty("status");

    // 生成ステータスを検証
    expect(result.status).toBe("success");

    // 見積書の自動生成を検証
    expect(result.quotation).toBeDefined();
    expect(result.quotation.document_type).toBe("QUOTATION");
    expect(result.quotation.document_number).toBeDefined();
    expect(result.quotation.customer_name).toBe("株式会社サンプル");
    expect(result.quotation.customer_address).toBe("東京都渋谷区道玄坂1-2-3");
    expect(result.quotation.total_amount).toBe(5500000);
    expect(result.quotation.tax_amount).toBe(500000);
    expect(result.quotation.subtotal_amount).toBe(5000000);
    expect(result.quotation.line_items).toBeDefined();
    expect(result.quotation.line_items.length).toBe(1);
    expect(result.quotation.line_items[0].item_name).toBe(
      "営業管理システム導入サービス"
    );
    expect(result.quotation.line_items[0].quantity).toBe(1);
    expect(result.quotation.line_items[0].unit_price).toBe(5000000);
    expect(result.quotation.line_items[0].subtotal).toBe(5000000);
    expect(result.quotation.generated_at).toBeDefined();
    expect(result.quotation.valid_until_date).toBeDefined();
    expect(result.quotation.responsible_person_name).toBe("山田太郎");
    expect(result.quotation.responsible_person_contact).toBe(
      "03-XXXX-XXXX"
    );

    // 注文書の自動生成を検証
    expect(result.order).toBeDefined();
    expect(result.order.document_type).toBe("ORDER");
    expect(result.order.document_number).toBeDefined();
    expect(result.order.customer_name).toBe("株式会社サンプル");
    expect(result.order.billing_address).toBe("東京都渋谷区道玄坂1-2-3");
    expect(result.order.shipping_address).toBe("東京都渋谷区道玄坂1-2-3");
    expect(result.order.total_amount).toBe(5500000);
    expect(result.order.tax_amount).toBe(500000);
    expect(result.order.subtotal_amount).toBe(5000000);
    expect(result.order.delivery_date).toBe("2024-05-31");
    expect(result.order.line_items).toBeDefined();
    expect(result.order.line_items.length).toBe(1);
    expect(result.order.line_items[0].item_name).toBe(
      "営業管理システム導入サービス"
    );
    expect(result.order.line_items[0].quantity).toBe(1);
    expect(result.order.line_items[0].unit_price).toBe(5000000);
    expect(result.order.line_items[0].subtotal).toBe(5000000);
    expect(result.order.generated_at).toBeDefined();
    expect(result.order.responsible_person_name).toBe("山田太郎");
    expect(result.order.responsible_person_email).toBe(
      "yamada.taro@example.com"
    );

    // 請求書の自動生成を検証
    expect(result.invoice).toBeDefined();
    expect(result.invoice.document_type).toBe("INVOICE");
    expect(result.invoice.document_number).toBeDefined();
    expect(result.invoice.customer_name).toBe("株式会社サンプル");
    expect(result.invoice.billing_address).toBe("東京都渋谷区道玄坂1-2-3");
    expect(result.invoice.total_amount).toBe(5500000);
    expect(result.invoice.tax_amount).toBe(500000);
    expect(result.invoice.subtotal_amount).toBe(5000000);
    expect(result.invoice.line_items).toBeDefined();
    expect(result.invoice.line_items.length).toBe(1);
    expect(result.invoice.line_items[0].item_name).toBe(
      "営業管理システム導入サービス"
    );
    expect(result.invoice.line_items[0].quantity).toBe(1);
    expect(result.invoice.line_items[0].unit_price).toBe(5000000);
    expect(result.invoice.line_items[0].subtotal).toBe(5000000);
    expect(result.invoice.generated_at).toBeDefined();
    expect(result.invoice.due_date).toBeDefined();
    expect(result.invoice.payment_terms).toBeDefined();

    // すべての帳票が統一フォーマットで生成されていることを検証
    expect(result.quotation.currency).toBe("JPY");
    expect(result.order.currency).toBe("JPY");
    expect(result.invoice.currency).toBe("JPY");

    // ダウンロード/表示機能の URL が存在することを検証
    expect(result.quotation.document_url).toBeDefined();
    expect(result.order.document_url).toBeDefined();
    expect(result.invoice.document_url).toBeDefined();

    // ドキュメント ID が一意に生成されていることを検証
    expect(result.quotation.document_number).not.toBe(
      result.order.document_number
    );
    expect(result.order.document_number).not.toBe(
      result.invoice.document_number
    );
    expect(result.quotation.document_number).not.toBe(
      result.invoice.document_number
    );

    // すべてのドキュメント番号が空文字列でないこと
    expect(result.quotation.document_number.length).toBeGreaterThan(0);
    expect(result.order.document_number.length).toBeGreaterThan(0);
    expect(result.invoice.document_number.length).toBeGreaterThan(0);

    // 商談情報が各帳票に反映されていることを検証
    expect(result.quotation.deal_id).toBe("DL-20240415-001");
    expect(result.order.deal_id).toBe("DL-20240415-001");
    expect(result.invoice.deal_id).toBe("DL-20240415-001");

    // 営業担当者情報が反映されていることを検証
    expect(result.quotation.sales_person_name).toBe("鈴木花子");
    expect(result.order.sales_person_name).toBe("鈴木花子");
    expect(result.invoice.sales_person_name).toBe("鈴木花子");

    // 明細行の正確性を検証
    expect(result.quotation.line_items[0].description).toBe(
      "システム導入、初期設定、ユーザー研修を含む"
    );
    expect(result.order.line_items[0].description).toBe(
      "システム導入、初期設定、ユーザー研修を含む"
    );
    expect(result.invoice.line_items[0].description).toBe(
      "システム導入、初期設定、ユーザー研修を含む"
    );

    // 税計算の正確性を検証（消費税率10%）
    const expected_tax = Math.floor(5000000 * 0.1);
    const expected_total = 5000000 + expected_tax;
    expect(result.quotation.tax_amount).toBe(expected_tax);
    expect(result.quotation.grand_total).toBe(expected_total);
    expect(result.order.tax_amount).toBe(expected_tax);
    expect(result.order.grand_total).toBe(expected_total);
    expect(result.invoice.tax_amount).toBe(expected_tax);
    expect(result.invoice.grand_total).toBe(expected_total);
  });

  test("必須情報が不完全な場合、エラーが発生する", () => {
    const incomplete_deal = {
      deal_id: "DL-20240415-002",
      customer_name: "株式会社テスト",
      customer_id: "CUST-54321",
      product_name: "テスト商品",
      quantity: 1,
      unit_price: 1000000,
      total_amount: 1000000,
      tax_rate: 0.1,
      tax_amount: 100000,
      grand_total: 1100000,
      billing_address: "",
      shipping_address: "東京都渋谷区",
      responsible_person_name: "",
      responsible_person_email: "",
      responsible_person_phone: "",
      delivery_date: "",
      status: "成約",
      line_items: [],
      created_at: "2024-04-15T10:00:00Z",
      updated_at: "2024-04-15T14:30:00Z",
      sales_person_id: "EMP-9876",
      sales_person_name: "鈴木花子",
      deal_amount: 1000000,
      currency: "JPY"
    };

    expect(() => generateUnifiedFormatDocuments(incomplete_deal)).toThrow(
      /必須情報/
    );
  });

  test("ステータスが成約でない場合、エラーが発生する", () => {
    const non_closed_deal = {
      deal_id: "DL-20240415-003",
      customer_name: "株式会社サンプル",
      customer_id: "CUST-12345",
      product_name: "営業管理システム導入サービス",
      quantity: 1,
      unit_price: 5000000,
      total_amount: 5000000,
      tax_rate: 0.1,
      tax_amount: 500000,
      grand_total: 5500000,
      billing_address: "東京都渋谷区道玄坂1-2-3",
      shipping_address: "東京都渋谷区道玄坂1-2-3",
      responsible_person_name: "山田太郎",
      responsible_person_email: "yamada.taro@example.com",
      responsible_person_phone: "03-XXXX-XXXX",
      delivery_date: "2024-05-31",
      status: "提案中",
      line_items: [
        {
          item_id: "ITEM-001",
          item_name: "営業管理システム導入サービス",
          item_quantity: 1,
          item_unit_price: 5000000,
          item_subtotal: 5000000,
          item_description: "システム導入、初期設定、ユーザー研修を含む"
        }
      ],
      created_at: "2024-04-15T10:00:00Z",
      updated_at: "2024-04-15T14:30:00Z",
      sales_person_id: "EMP-9876",
      sales_person_name: "鈴木花子",
      deal_amount: 5000000,
      currency: "JPY"
    };

    expect(() => generateUnifiedFormatDocuments(non_closed_deal)).toThrow(
      /ステータス/
    );
  });

  test("複数明細行を持つ商談の場合、すべての明細が帳票に反映される", () => {
    const multi_line_deal = {
      deal_id: "DL-20240415-004",
      customer_name: "株式会社マルチライン",
      customer_id: "CUST-99999",
      product_name: "複合システム導入パッケージ",
      quantity: 3,
      unit_price: 2000000,
      total_amount: 6000000,
      tax_rate: 0.1,
      tax_amount: 600000,
      grand_total: 6600000,
      billing_address: "東京都千代田区丸の内1-1-1",
      shipping_address: "東京都千代田区丸の内1-1-1",
      responsible_person_name: "佐藤次郎",
      responsible_person_email: "satoh.jiro@example.com",
      responsible_person_phone: "03-YYYY-YYYY",
      delivery_date: "2024-06-15",
      status: "成約",
      line_items: [
        {
          item_id: "ITEM-A01",
          item_name: "営業管理システムライセンス（10ユーザー）",
          item_quantity: 1,
          item_unit_price: 3000000,
          item_subtotal: 3000000,
          item_description: "年間ライセンス"
        },
        {
          item_id: "ITEM-A02",
          item_name: "初期設定・導入支援",
          item_quantity: 1,
          item_unit_price: 1500000,
          item_subtotal: 1500000,
          item_description: "システム導入、設定、ユーザー研修"
        },
        {
          item_id: "ITEM-A03",
          item_name: "保守運用サポート（年間）",
          item_quantity: 1,
          item_unit_price: 1500000,
          item_subtotal: 1500000,
          item_description: "年間保守、テクニカルサポート"
        }
      ],
      created_at: "2024-04-15T10:00:00Z",
      updated_at: "2024-04-15T14:30:00Z",
      sales_person_id: "EMP-5555",
      sales_person_name: "鈴木花子",
      deal_amount: 6000000,
      currency: "JPY"
    };

    const result = generateUnifiedFormatDocuments(multi_line_deal);

    expect(result.status).toBe("success");
    expect(result.quotation.line_items.length).toBe(3);
    expect(result.order.line_items.length).toBe(3);
    expect(result.invoice.line_items.length).toBe(3);

    // 各明細が正確に反映されていることを検証
    expect(result.quotation.line_items[0].item_name).toBe(
      "営業管理システムライセンス（10ユーザー）"
    );
    expect(result.quotation.line_items[0].subtotal).toBe(3000000);
    expect(result.quotation.line_items[1].item_name).toBe(
      "初期設定・導入支援"
    );
    expect(result.quotation.line_items[1].subtotal).toBe(1500000);
    expect(result.quotation.line_items[2].item_name).toBe(
      "保守運用サポート（年間）"
    );
    expect(result.quotation.line_items[2].subtotal).toBe(1500000);

    // 合計が正確に計算されていることを検証
    const expected_subtotal = 3000000 + 1500000 + 1500000;
    const expected_tax = Math.floor(expected_subtotal * 0.1);
    const expected_total = expected_subtotal + expected_tax;

    expect(result.quotation.subtotal_amount).toBe(expected_subtotal);
    expect(result.quotation.tax_amount).toBe(expected_tax);
    expect(result.quotation.grand_total).toBe(expected_total);
    expect(result.order.subtotal_amount).toBe(expected_subtotal);
    expect(result.order.tax_amount).toBe(expected_tax);
    expect(result.order.grand_total).toBe(expected_total);
    expect(result.invoice.subtotal_amount).toBe(expected_subtotal);
    expect(result.invoice.tax_amount).toBe(expected_tax);
    expect(result.invoice.grand_total).toBe(expected_total);
  });
});