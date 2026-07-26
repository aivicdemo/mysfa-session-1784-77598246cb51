import { recordDocumentIssuanceHistory } from "../../src/logic/it-1784969823049-2-1-2";

const fetchMock = require("jest-fetch-mock");

describe("顧客向け専用ポータルでの商談情報参照機能", () => {
  // SCEN-071
  test("[error] 帳票発行履歴記録機能 - 帳票発行時に発行履歴が記録されない場合、エラーが発生する", async () => {
    fetchMock.resetMocks();

    const documentId = "DOC-20240115-001";
    const customerId = "CUST-98765";
    const documentType = "invoice";
    const issuanceTimestamp = new Date("2024-01-15T14:30:00Z");

    const documentPayload = {
      documentId,
      customerId,
      documentType,
      issuanceTimestamp,
    };

    // エラーシナリオ: 帳票発行履歴記録 API がデータベース書き込み失敗を返す
    fetchMock.mockResponseOnce(
      JSON.stringify({
        success: false,
        error: "履歴記録失敗",
        errorCode: "DB_WRITE_FAILED",
      }),
      { status: 500 }
    );

    // エラーが発生することを検証
    await expect(() =>
      recordDocumentIssuanceHistory(documentPayload)
    ).rejects.toThrow(/履歴記録失敗/);

    // API が正しく呼ばれたことを検証
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/document-issuance-history"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: expect.stringContaining(documentId),
      })
    );

    // レスポンスステータスが 500 であることを検証
    const lastCall = fetchMock.mock.calls[0];
    const response = await fetch(lastCall[0], lastCall[1]);
    expect(response.status).toBe(500);
  });
});