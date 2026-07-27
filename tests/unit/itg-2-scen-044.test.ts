import { describe, test, expect, beforeEach } from "@jest/globals";
import { issueDocument } from "../../src/logic/it-1784969823049-2-1-2";

describe("帳票発行・履歴管理機能", () => {
  // SCEN-044
  test("発行日時がNULLの状態で帳票発行処理を実行する場合、エラーが発生する", () => {
    const documentRequest = {
      documentId: "DOC-001",
      customerId: "CUST-12345",
      documentType: "estimate",
      amount: 500000,
      issuedAt: null,
      status: "pending",
    };

    expect(() => issueDocument(documentRequest)).toThrow(/発行日時/);
  });
});