import { describe, test, expect, beforeEach } from "@jest/globals";
import {
  validateAndGenerateDocuments,
} from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-163
  test("顧客情報が不完全な場合、生成処理がエラーになる", () => {
    const incompleteCustomerData = {
      customerId: "CUST-001",
      customerName: "", // 必須項目が未入力
      address: "東京都渋谷区",
      phoneNumber: "", // 必須項目が未入力
      email: "contact@example.com",
      dealAmount: 500000,
      dealId: "DEAL-001",
      dealStatus: "受注",
      items: [
        {
          itemId: "ITEM-001",
          itemName: "商品A",
          quantity: 10,
          unitPrice: 50000,
        },
      ],
    };

    expect(() => validateAndGenerateDocuments(incompleteCustomerData)).toThrow(
      /顧客情報/
    );
  });

  test("顧客住所が不完全な場合、生成処理がエラーになる", () => {
    const missingAddressData = {
      customerId: "CUST-002",
      customerName: "株式会社テスト",
      address: "", // 住所が未入力
      phoneNumber: "09012345678",
      email: "test@example.com",
      dealAmount: 300000,
      dealId: "DEAL-002",
      dealStatus: "受注",
      items: [
        {
          itemId: "ITEM-002",
          itemName: "商品B",
          quantity: 5,
          unitPrice: 60000,
        },
      ],
    };

    expect(() => validateAndGenerateDocuments(missingAddressData)).toThrow(
      /住所/
    );
  });

  test("顧客電話番号が不完全な場合、生成処理がエラーになる", () => {
    const missingPhoneData = {
      customerId: "CUST-003",
      customerName: "テスト会社",
      address: "大阪府大阪市",
      phoneNumber: "", // 電話番号が未入力
      email: "info@test.com",
      dealAmount: 250000,
      dealId: "DEAL-003",
      dealStatus: "受注",
      items: [
        {
          itemId: "ITEM-003",
          itemName: "商品C",
          quantity: 3,
          unitPrice: 80000,
        },
      ],
    };

    expect(() => validateAndGenerateDocuments(missingPhoneData)).toThrow(
      /電話番号/
    );
  });

  test("複数の必須項目が不完全な場合、最初に検出された項目についてエラーになる", () => {
    const multipleIncompleteData = {
      customerId: "CUST-004",
      customerName: "", // 不完全
      address: "", // 不完全
      phoneNumber: "", // 不完全
      email: "multi@example.com",
      dealAmount: 400000,
      dealId: "DEAL-004",
      dealStatus: "受注",
      items: [
        {
          itemId: "ITEM-004",
          itemName: "商品D",
          quantity: 2,
          unitPrice: 200000,
        },
      ],
    };

    expect(() => validateAndGenerateDocuments(multipleIncompleteData)).toThrow(
      /顧客情報/
    );
  });

  test("全ての必須項目が完全に入力されている場合、生成処理は成功する", () => {
    const completeCustomerData = {
      customerId: "CUST-005",
      customerName: "完全データ会社",
      address: "京都府京都市",
      phoneNumber: "08012345678",
      email: "complete@example.com",
      dealAmount: 600000,
      dealId: "DEAL-005",
      dealStatus: "受注",
      items: [
        {
          itemId: "ITEM-005",
          itemName: "商品E",
          quantity: 4,
          unitPrice: 150000,
        },
      ],
    };

    const result = validateAndGenerateDocuments(completeCustomerData);

    expect(result).toEqual({
      success: true,
      estimateId: expect.any(String),
      orderId: expect.any(String),
      invoiceId: expect.any(String),
      generatedAt: expect.any(String),
      documentFormat: "統一フォーマット",
    });
  });

  test("顧客IDが空の場合、生成処理がエラーになる", () => {
    const noCustomerIdData = {
      customerId: "", // 顧客ID不完全
      customerName: "テスト太郎",
      address: "福岡県福岡市",
      phoneNumber: "09098765432",
      email: "no-id@example.com",
      dealAmount: 350000,
      dealId: "DEAL-006",
      dealStatus: "受注",
      items: [
        {
          itemId: "ITEM-006",
          itemName: "商品F",
          quantity: 6,
          unitPrice: 58000,
        },
      ],
    };

    expect(() => validateAndGenerateDocuments(noCustomerIdData)).toThrow(
      /顧客情報/
    );
  });

  test("金額が0または負数の場合、生成処理がエラーになる", () => {
    const invalidAmountData = {
      customerId: "CUST-007",
      customerName: "無効金額会社",
      address: "名古屋市中区",
      phoneNumber: "09055555555",
      email: "invalid-amount@example.com",
      dealAmount: 0, // 無効な金額
      dealId: "DEAL-007",
      dealStatus: "受注",
      items: [
        {
          itemId: "ITEM-007",
          itemName: "商品G",
          quantity: 1,
          unitPrice: 0,
        },
      ],
    };

    expect(() => validateAndGenerateDocuments(invalidAmountData)).toThrow(
      /金額/
    );
  });

  test("商談明細が空配列の場合、生成処理がエラーになる", () => {
    const emptyItemsData = {
      customerId: "CUST-008",
      customerName: "明細なし会社",
      address: "広島市中区",
      phoneNumber: "09077777777",
      email: "no-items@example.com",
      dealAmount: 500000,
      dealId: "DEAL-008",
      dealStatus: "受注",
      items: [], // 明細が空
    };

    expect(() => validateAndGenerateDocuments(emptyItemsData)).toThrow(
      /明細/
    );
  });

  test("生成に成功した場合、ドキュメントIDが適切に返される", () => {
    const validData = {
      customerId: "CUST-009",
      customerName: "成功会社",
      address: "仙台市青葉区",
      phoneNumber: "09099999999",
      email: "success@example.com",
      dealAmount: 750000,
      dealId: "DEAL-009",
      dealStatus: "受注",
      items: [
        {
          itemId: "ITEM-009",
          itemName: "商品H",
          quantity: 5,
          unitPrice: 150000,
        },
      ],
    };

    const result = validateAndGenerateDocuments(validData);

    expect(result.success).toBe(true);
    expect(result.estimateId).toMatch(/^EST-/);
    expect(result.orderId).toMatch(/^ORD-/);
    expect(result.invoiceId).toMatch(/^INV-/);
    expect(result.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.documentFormat).toBe("統一フォーマット");
  });
});