import { recordDocumentIssuanceHistory } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向け専用ポータルでの商談情報参照機能", () => {
  // SCEN-070
  test("帳票発行時に現在日時が自動付与され、発行履歴がシステムに記録される", () => {
    const issued_at = new Date("2024-01-15T14:30:45Z");
    const issuer_user_id = "user_12345";
    const issuer_name = "営業太郎";
    const document_type = "invoice";
    const document_filename = "INV-2024-001.pdf";
    const customer_id = "cust_67890";
    const transaction_id = "trans_11111";

    const result = recordDocumentIssuanceHistory({
      issued_at,
      issuer_user_id,
      issuer_name,
      document_type,
      document_filename,
      customer_id,
      transaction_id,
    });

    expect(result.record_id).toBeDefined();
    expect(result.issued_at).toEqual(issued_at);
    expect(result.issuer_user_id).toBe("user_12345");
    expect(result.issuer_name).toBe("営業太郎");
    expect(result.document_type).toBe("invoice");
    expect(result.document_filename).toBe("INV-2024-001.pdf");
    expect(result.customer_id).toBe("cust_67890");
    expect(result.transaction_id).toBe("trans_11111");
    expect(result.is_recorded).toBe(true);
    expect(typeof result.record_id).toBe("string");
    expect(result.issued_at.getFullYear()).toBe(2024);
    expect(result.issued_at.getMonth()).toBe(0);
    expect(result.issued_at.getDate()).toBe(15);
    expect(result.issued_at.getHours()).toBe(14);
    expect(result.issued_at.getMinutes()).toBe(30);
    expect(result.issued_at.getSeconds()).toBe(45);
  });
});