import { issueOrderAndRecordHistory } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 商談情報参照機能", () => {
  // SCEN-046: [normal] 帳票発行時の発行日時自動付与と発行履歴記録 - 同じ注文書を複数回発行したとき、発行履歴に複数件記録される
  test("should record multiple issue histories with auto-assigned timestamps when same order is issued multiple times", async () => {
    const orderId = "ORDER-001";
    const customerId = "CUST-A";
    const orderAmount = 100000;

    const firstIssuanceTime = new Date("2024-01-15T10:30:45Z");
    const secondIssuanceTime = new Date("2024-01-15T11:45:20Z");
    const thirdIssuanceTime = new Date("2024-01-15T13:15:10Z");

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn()
        .mockResolvedValueOnce({
          documentId: "DOC-001",
          storageUrl: "https://storage.example.com/order-001-v1.pdf",
        })
        .mockResolvedValueOnce({
          documentId: "DOC-002",
          storageUrl: "https://storage.example.com/order-001-v2.pdf",
        })
        .mockResolvedValueOnce({
          documentId: "DOC-003",
          storageUrl: "https://storage.example.com/order-001-v3.pdf",
        }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const orderData = {
      orderId,
      customerId,
      amount: orderAmount,
      status: "pending",
    };

    const result = await issueOrderAndRecordHistory(
      orderData,
      mockDocumentStorageAdapter,
      [firstIssuanceTime, secondIssuanceTime, thirdIssuanceTime]
    );

    expect(result.issuanceHistories).toHaveLength(3);

    expect(result.issuanceHistories[0]).toEqual({
      orderId: "ORDER-001",
      issuanceTimestamp: "2024-01-15T10:30:45Z",
      status: "issued",
      documentId: "DOC-001",
    });

    expect(result.issuanceHistories[1]).toEqual({
      orderId: "ORDER-001",
      issuanceTimestamp: "2024-01-15T11:45:20Z",
      status: "issued",
      documentId: "DOC-002",
    });

    expect(result.issuanceHistories[2]).toEqual({
      orderId: "ORDER-001",
      issuanceTimestamp: "2024-01-15T13:15:10Z",
      status: "issued",
      documentId: "DOC-003",
    });

    expect(result.issuanceHistories.every((h) => h.orderId === "ORDER-001")).toBe(true);
    expect(result.issuanceHistories.every((h) => h.status === "issued")).toBe(true);

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(3);

    const timestamps = result.issuanceHistories.map((h) => new Date(h.issuanceTimestamp).getTime());
    expect(timestamps[0]).toBeLessThan(timestamps[1]);
    expect(timestamps[1]).toBeLessThan(timestamps[2]);
  });
});