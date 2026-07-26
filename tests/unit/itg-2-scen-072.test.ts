import { recordMultipleDocumentIssuances } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 帳票発行履歴記録機能", () => {
  // SCEN-072
  test("複数の帳票を同時発行する場合、それぞれに異なる発行日時が付与される", () => {
    const document_1 = {
      document_id: "DOC-001",
      document_type: "invoice",
      customer_id: "CUST-123",
      amount: 100000,
    };

    const document_2 = {
      document_id: "DOC-002",
      document_type: "receipt",
      customer_id: "CUST-123",
      amount: 100000,
    };

    const document_3 = {
      document_id: "DOC-003",
      document_type: "delivery_note",
      customer_id: "CUST-123",
      amount: 100000,
    };

    const documents_to_issue = [document_1, document_2, document_3];

    const issuance_results = recordMultipleDocumentIssuances(
      documents_to_issue
    );

    expect(issuance_results).toHaveLength(3);

    expect(issuance_results[0]).toHaveProperty("document_id", "DOC-001");
    expect(issuance_results[0]).toHaveProperty("document_type", "invoice");
    expect(issuance_results[0]).toHaveProperty("issued_at");
    expect(typeof issuance_results[0].issued_at).toBe("string");

    expect(issuance_results[1]).toHaveProperty("document_id", "DOC-002");
    expect(issuance_results[1]).toHaveProperty("document_type", "receipt");
    expect(issuance_results[1]).toHaveProperty("issued_at");
    expect(typeof issuance_results[1].issued_at).toBe("string");

    expect(issuance_results[2]).toHaveProperty("document_id", "DOC-003");
    expect(issuance_results[2]).toHaveProperty("document_type", "delivery_note");
    expect(issuance_results[2]).toHaveProperty("issued_at");
    expect(typeof issuance_results[2].issued_at).toBe("string");

    const issued_at_1 = new Date(issuance_results[0].issued_at).getTime();
    const issued_at_2 = new Date(issuance_results[1].issued_at).getTime();
    const issued_at_3 = new Date(issuance_results[2].issued_at).getTime();

    expect(issued_at_1).not.toBe(issued_at_2);
    expect(issued_at_2).not.toBe(issued_at_3);
    expect(issued_at_1).not.toBe(issued_at_3);

    const all_timestamps_different = new Set([
      issued_at_1,
      issued_at_2,
      issued_at_3,
    ]).size === 3;
    expect(all_timestamps_different).toBe(true);

    expect(issued_at_1 <= issued_at_2).toBe(true);
    expect(issued_at_2 <= issued_at_3).toBe(true);

    expect(issuance_results[0].issued_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z?$/);
    expect(issuance_results[1].issued_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z?$/);
    expect(issuance_results[2].issued_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z?$/);
  });
});