import { generateRoutingInstructionForSalesRep } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  test("SCEN-701: 段階的対応ルーティング機能 - 照合結果確定後、営業日ベースで対応指示対象に含まれる", () => {
    // ===== Setup: テストデータ =====
    // 照合済み案件レコード
    const caseId = "CASE-701";
    const customerId = "CUST-001";
    const caseStatus = "照合確定";
    const assignedSalesRepName = "営業太郎";

    // 営業日カレンダー: 本日（2024-01-15 月曜）と明日（2024-01-16 火曜）は両方営業日
    const businessDayToday = new Date("2024-01-15T09:00:00Z");
    const businessDayTomorrow = new Date("2024-01-16T09:00:00Z");

    // 対応指示期限: 明日の17:00（1営業日後の終業時刻より1時間早い=16:00を基準に期限が明日16:00と設定されたケース）
    const instructionDueDateTime = new Date("2024-01-16T16:00:00Z");

    // 対応基準日: 本日から1営業日後の終業時刻
    const routingCriteriaDueDateTime = new Date("2024-01-16T17:00:00Z");

    // 入力パラメータ
    const routingInput = {
      caseId: caseId,
      customerId: customerId,
      caseStatus: caseStatus,
      assignedSalesRepName: assignedSalesRepName,
      currentDateTime: businessDayToday,
      instructionDueDateTime: instructionDueDateTime,
      routingCriteriaDueDateTime: routingCriteriaDueDateTime,
    };

    // ===== Execution: 段階的対応ルーティング機能を実行 =====
    const result = generateRoutingInstructionForSalesRep(routingInput);

    // ===== Verification: 結果検証 =====

    // 1. 対応指示レコードが生成されたことを確認
    expect(result).toBeDefined();
    expect(result.instructionGenerated).toBe(true);

    // 2. 対応指示対象フラグが true であることを確認
    expect(result.isRoutingTarget).toBe(true);

    // 3. 割り当て確認ステータスが「未確認」であることを確認
    expect(result.assignmentConfirmationStatus).toBe("未確認");

    // 4. 対応優先度が「高」であることを確認（期限がルーティング基準より早いため）
    expect(result.instructionPriority).toBe("高");

    // 5. 対応指示レコードのケースIDが正しく紐付いていることを確認
    expect(result.linkedCaseId).toBe("CASE-701");

    // 6. 割り当て営業担当者が正しく記録されていることを確認
    expect(result.assignedToSalesRepName).toBe("営業太郎");

    // 7. 生成タイムスタンプが本日以降であることを確認
    const generatedTimestamp = new Date(result.generatedAt);
    expect(generatedTimestamp.getTime()).toBeGreaterThanOrEqual(
      businessDayToday.getTime()
    );

    // 8. 期限情報が指示内容に含まれていることを確認
    expect(result.dueDateTimeForInstruction).toBe(
      instructionDueDateTime.toISOString()
    );

    // 9. 期限がルーティング基準（1営業日後の終業時刻）より早いことを検証
    expect(new Date(result.dueDateTimeForInstruction).getTime()).toBeLessThan(
      routingCriteriaDueDateTime.getTime()
    );

    // 10. 対応指示が通知キューに投入されるための状態フラグが true であることを確認
    expect(result.readyForNotificationQueue).toBe(true);
  });
});