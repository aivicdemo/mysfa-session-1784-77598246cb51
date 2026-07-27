import {
  executeTaskRoutingLogic,
  TaskRoutingInput,
  TaskRoutingOutput,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  test("SCEN-706: 段階的対応ルーティング機能 - 営業管理者報告が優先される", () => {
    // Setup: 照合対象の案件データ
    const dealId = "DEAL-20240415-001";
    const customerId = "CUST-00123";
    const dealAmount = 1500000;
    const dealStatus = "受注";
    const invoiceIssuedDate = null; // 未請求

    // Setup: 照合結果を『確定』状態に更新したシナリオ
    const reconciliationStatus = "確定";

    // Setup: 同一案件に対する 2 つのタスク
    // タスク 1: 営業管理者報告タスク（営業管理者への報告が優先される）
    const adminReportTask = {
      taskId: "TASK-20240415-ADM-001",
      dealId: dealId,
      taskType: "営業管理者報告",
      status: "未処理",
      assignedTo: "admin@company.com",
      dueDate: "2024-04-17", // 月次決算期限の2営業日前
      priority: "high",
    };

    // タスク 2: 営業担当者対応指示タスク
    const salesRepTask = {
      taskId: "TASK-20240415-SALES-001",
      dealId: dealId,
      taskType: "営業担当者対応指示",
      status: "未処理",
      assignedTo: "sales@company.com",
      dueDate: "2024-04-18", // 月次決算期限の1営業日前
      priority: "normal",
    };

    const taskRoutingInput: TaskRoutingInput = {
      dealId: dealId,
      customerId: customerId,
      dealAmount: dealAmount,
      dealStatus: dealStatus,
      invoiceIssuedDate: invoiceIssuedDate,
      reconciliationStatus: reconciliationStatus,
      tasks: [adminReportTask, salesRepTask],
    };

    // Execute: 段階的対応ルーティング機能を実行
    const result: TaskRoutingOutput = executeTaskRoutingLogic(taskRoutingInput);

    // Assert: ルーティング結果を検証
    expect(result.dealId).toBe(dealId);
    expect(result.routingStatus).toBe("completed");

    // Assert: 営業管理者報告タスクのみが『処理対象（実行待機）』状態
    const processedAdminTask = result.processedTasks.find(
      (t) => t.taskId === "TASK-20240415-ADM-001"
    );
    expect(processedAdminTask).toBeDefined();
    expect(processedAdminTask?.status).toBe("処理対象");
    expect(processedAdminTask?.assignmentStatus).toBe("割り当て済み");

    // Assert: 営業担当者対応指示タスクが『スキップ』状態に遷移
    const skippedSalesTask = result.processedTasks.find(
      (t) => t.taskId === "TASK-20240415-SALES-001"
    );
    expect(skippedSalesTask).toBeDefined();
    expect(skippedSalesTask?.status).toBe("スキップ");

    // Assert: 営業担当者対応指示タスクが実行キューから除外されていることを確認
    expect(result.executionQueue).toContain("TASK-20240415-ADM-001");
    expect(result.executionQueue).not.toContain("TASK-20240415-SALES-001");

    // Assert: ルーティング履歴に営業管理者報告タスクのみが記録されていることを確認
    expect(result.routingHistory.length).toBe(1);
    expect(result.routingHistory[0].taskId).toBe("TASK-20240415-ADM-001");
    expect(result.routingHistory[0].routingReason).toBe(
      "営業管理者報告が優先適用"
    );
  });
});