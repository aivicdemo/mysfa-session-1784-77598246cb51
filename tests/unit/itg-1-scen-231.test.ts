import { detectInvoicingDelayAndMismatch } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-231
  test("決算期限1営業日前の営業担当者対応指示タイミングで段階的SLAが正確に判定される", () => {
    // テストシナリオのセットアップ
    // 決算期限が明日（1営業日後）に設定された時点を想定
    const today = new Date("2024-04-29T09:00:00Z"); // 月曜日
    const nextBusinessDay = new Date("2024-04-30T09:00:00Z"); // 火曜日（決算期限）
    const oneBusinessDayBefore = new Date("2024-04-29T09:00:00Z"); // 月曜日（決算期限1営業日前）

    // テストデータ：決算期限1営業日前の商談レコード
    const dealRecord = {
      dealId: "DEAL-001",
      dealStatus: "contracted", // ステータス：契約済み
      dealAmount: 1000000,
      customerId: "CUST-001",
      customerName: "テスト顧客",
      expectedInvoicingDate: nextBusinessDay,
      currentDate: oneBusinessDayBefore,
    };

    // テストデータ：対応する請求書の発行状況
    const invoiceRecord = {
      invoiceId: "INV-001",
      dealId: "DEAL-001",
      invoiceStatus: "unissued", // 発行状況：未発行
      invoiceAmount: 1000000,
    };

    // 決算期限設定
    const settlementDeadline = nextBusinessDay;

    // システムの自動照合機能を実行
    const result = detectInvoicingDelayAndMismatch(
      dealRecord,
      invoiceRecord,
      settlementDeadline
    );

    // 期待結果の検証

    // 1. ズレが正確に検出されることを確認
    expect(result.mismatchDetected).toBe(true);
    expect(result.mismatchType).toBe("unissued");

    // 2. 段階的SLAが『高優先度・即時対応必須』に判定されることを確認
    expect(result.slaLevel).toBe("high");
    expect(result.slaDescription).toBe("営業担当者への対応指示は期限1営業日前");

    // 3. 営業担当者への対応指示が生成されることを確認
    expect(result.actionRequired).toBe(true);
    expect(result.actionType).toBe("urgent");
    expect(result.actionDescription).toMatch(/請求書作成・発行を実行/);

    // 4. 対応指示の優先度が高に設定されることを確認
    expect(result.priority).toBe("high");

    // 5. 警告フラグが立っていることを確認
    expect(result.warningFlag).toBe(true);

    // 6. 検出ログに判定情報が記録されることを確認
    expect(result.detectionLog).toBeDefined();
    expect(result.detectionLog.timestamp).toBe(oneBusinessDayBefore.toISOString());
    expect(result.detectionLog.dealId).toBe("DEAL-001");
    expect(result.detectionLog.mismatchType).toBe("unissued");
    expect(result.detectionLog.slaLevel).toBe("high");
    expect(result.detectionLog.actionRequired).toBe(true);

    // 7. ズレ検出内容が正確に記録されることを確認
    expect(result.detectionLog.dealStatus).toBe("contracted");
    expect(result.detectionLog.invoiceStatus).toBe("unissued");
    expect(result.detectionLog.daysUntilDeadline).toBe(1); // 決算期限まで1営業日

    // 8. 対応指示内容が正確に記録されることを確認
    expect(result.detectionLog.instructionContent).toBeDefined();
    expect(result.detectionLog.instructionContent.dealAmount).toBe(1000000);
    expect(result.detectionLog.instructionContent.customerId).toBe("CUST-001");
    expect(result.detectionLog.instructionContent.actionType).toBe("urgent");
    expect(result.detectionLog.instructionContent.priority).toBe("high");

    // 9. 発行タイミングが即座（遅延なし）であることを検証
    expect(result.issuanceTimingValid).toBe(true);
    expect(result.delayMinutes).toBe(0);

    // 10. 段階的SLAが決算期限スケジュールと一致することを確認
    // 決算期限3営業日前：管理者への報告段階
    // 決算期限2営業日前：管理者への報告SLA
    // 決算期限1営業日前：営業担当者への対応指示SLA（このテストケース）
    expect(result.slaStage).toBe("operator_action_instruction");
    expect(result.expectedActionTiming).toBe("immediate");

    // 11. 複合的な検証：複数項目が一貫性を保っていることを確認
    expect(result.mismatchDetected).toBe(true);
    expect(result.slaLevel).toBe("high");
    expect(result.actionRequired).toBe(true);
    expect(result.priority).toBe("high");
    expect(result.warningFlag).toBe(true);

    // 12. 記録内容の完全性を確認（全ての必須項目が存在）
    expect(result.detectionLog.dealId).toBeDefined();
    expect(result.detectionLog.timestamp).toBeDefined();
    expect(result.detectionLog.mismatchType).toBeDefined();
    expect(result.detectionLog.slaLevel).toBeDefined();
    expect(result.detectionLog.actionRequired).toBeDefined();
    expect(result.detectionLog.instructionContent).toBeDefined();
  });
});