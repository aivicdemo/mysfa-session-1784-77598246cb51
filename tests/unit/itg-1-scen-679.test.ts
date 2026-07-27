import { markUnbilledCaseAsCompleted } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-679
  test("未請求案件の対応完了ステータスを『完了』に更新するとき、ステータスが『完了』に更新される", () => {
    const unbilledCaseId = "CASE-001";
    const initialStatus = "未請求";
    const expectedStatus = "完了";
    const updateTimestamp = new Date("2024-01-15T10:30:00Z");

    const mockUnbilledCase = {
      id: unbilledCaseId,
      dealId: "DEAL-12345",
      customerId: "CUST-789",
      amount: 500000,
      status: initialStatus,
      createdAt: new Date("2024-01-10T09:00:00Z"),
      updatedAt: new Date("2024-01-10T09:00:00Z"),
    };

    const mockDatabase = {
      cases: [
        {
          ...mockUnbilledCase,
        },
      ],
      updateCase: (id: string, updates: Record<string, unknown>) => {
        const caseRecord = mockDatabase.cases.find((c) => c.id === id);
        if (caseRecord) {
          Object.assign(caseRecord, updates);
          return caseRecord;
        }
        return null;
      },
      getCaseById: (id: string) => {
        return mockDatabase.cases.find((c) => c.id === id);
      },
    };

    const result = markUnbilledCaseAsCompleted(unbilledCaseId, mockDatabase, {
      timestamp: updateTimestamp,
    });

    expect(result).toEqual({
      success: true,
      caseId: unbilledCaseId,
      previousStatus: initialStatus,
      newStatus: expectedStatus,
      updatedAt: updateTimestamp,
    });

    const updatedCase = mockDatabase.getCaseById(unbilledCaseId);
    expect(updatedCase).not.toBeNull();
    expect(updatedCase?.status).toBe(expectedStatus);
    expect(updatedCase?.updatedAt).toEqual(updateTimestamp);
  });
});