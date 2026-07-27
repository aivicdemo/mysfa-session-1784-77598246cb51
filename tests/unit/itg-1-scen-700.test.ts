import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { routeIncrementalAssignmentOnDealStatusReconciliation } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-700
  test("段階的対応ルーティング機能 - 対応指示期限が1営業日前ジャストの場合、対応指示対象に含まれる", () => {
    // Setup: テスト用のモック日時
    // 基準日: 2025年1月15日（水）11:00:00 UTC
    const baseDateTime = new Date("2025-01-15T11:00:00Z");

    // 対応指示期限: 2025年1月16日（木）00:00:00 UTC（翌営業日のジャスト）
    const assignmentDeadline = new Date("2025-01-16T00:00:00Z");

    // 照合確定後の判定実行日時: 2025年1月15日（水）00:00:00 UTC
    // （期限2025-01-16 00:00:00から正確に24営業時間前 = 1営業日前のジャスト）
    const routingEvaluationDateTime = new Date("2025-01-15T00:00:00Z");

    // Input: 照合結果確定のコンテキスト
    const reconciliationContext = {
      customerId: "CUST-001",
      customerName: "顧客A",
      reconciliationStatus: "confirmed" as const,
      reconciliationConfirmedAt: baseDateTime,
      assignedSalesRepId: "SALES-REP-X",
      assignedSalesRepName: "営業担当者X",
      assignmentDeadlineUtc: assignmentDeadline,
      currentTimeUtc: routingEvaluationDateTime,
    };

    // Execute: 段階的対応ルーティングロジックを実行
    const routingResult = routeIncrementalAssignmentOnDealStatusReconciliation(
      reconciliationContext
    );

    // Assert: 営業担当者Xが対応指示対象に含まれることを検証
    expect(routingResult).toEqual({
      routed: true,
      targetSalesRepId: "SALES-REP-X",
      targetSalesRepName: "営業担当者X",
      assignmentStatus: "待機中",
      assignmentAllocatedAt: baseDateTime,
      assignmentDeadline: assignmentDeadline,
      routingReason: "対応指示期限まで1営業日前のジャスト",
      isWithinSLA: true,
    });

    // 詳細検証: ルーティング結果リストに営業担当者Xのレコードが存在
    expect(routingResult.targetSalesRepId).toBe("SALES-REP-X");
    expect(routingResult.assignmentStatus).toBe("待機中");
    expect(routingResult.assignmentAllocatedAt).toEqual(baseDateTime);
    expect(routingResult.assignmentDeadline).toEqual(assignmentDeadline);
    expect(routingResult.isWithinSLA).toBe(true);
  });
});