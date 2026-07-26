import { detectOverdueCasesWithEscalation } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  test("SCEN-192: 月次決算時の未請求・遅延案件の段階的検出と対応SLA管理機能 - 期限を過ぎた案件に対してSLAが遵守されない場合、エスカレーション対象となる", () => {
    // Precondition: 月次決算期限が到来し、営業管理システムに商談レコードと請求書発行記録が存在する状態
    // SLA設定: 遅延案件の対応期限は3営業日
    const dealRecords = [
      {
        dealId: "DEAL001",
        dealStatus: "受注",
        customerId: "CUST001",
        amount: 500000,
        invoiceIssuedDate: null,
        expectedBillingDate: new Date("2024-01-10T00:00:00Z"),
        createdAt: new Date("2024-01-01T00:00:00Z"),
      },
      {
        dealId: "DEAL002",
        dealStatus: "完了",
        customerId: "CUST002",
        amount: 300000,
        invoiceIssuedDate: new Date("2024-01-12T00:00:00Z"),
        expectedBillingDate: new Date("2024-01-15T00:00:00Z"),
        createdAt: new Date("2024-01-05T00:00:00Z"),
      },
      {
        dealId: "DEAL003",
        dealStatus: "受注",
        customerId: "CUST003",
        amount: 800000,
        invoiceIssuedDate: null,
        expectedBillingDate: new Date("2024-01-08T00:00:00Z"),
        createdAt: new Date("2024-01-02T00:00:00Z"),
      },
    ];

    // SLA configuration: 遅延案件対応期限は3営業日（営業日ベース）
    const slaConfig = {
      overdueThresholdBusinessDays: 3,
      notificationThresholdBusinessDays: 2,
    };

    // Current date: 2024-01-25 (月次決算期限到来)
    const currentDate = new Date("2024-01-25T10:00:00Z");

    // Trigger: 月次決算期限到来時に、システムが未請求・遅延案件を検出してSLA超過分析を実行
    const result = detectOverdueCasesWithEscalation(
      dealRecords,
      slaConfig,
      currentDate
    );

    // Expected outcome:
    // 1. DEAL001 (未請求案件): expectedBillingDate = 2024-01-10, 現在日 = 2024-01-25
    //    遅延日数 = 15日 > SLA 3営業日(約6暦日) → エスカレーション対象
    // 2. DEAL002 (遅延案件): 請求済みだが期限超過 → SLA確認
    // 3. DEAL003 (未請求案件): expectedBillingDate = 2024-01-08, 遅延日数 = 17日 > SLA → エスカレーション対象

    expect(result).toHaveProperty("escalationCases");
    expect(result).toHaveProperty("totalCasesDetected");
    expect(result).toHaveProperty("notificationLogs");

    // Validate escalation detection
    expect(result.escalationCases).toHaveLength(2);

    // Validate DEAL001 escalation
    const escalatedDeal001 = result.escalationCases.find(
      (c) => c.dealId === "DEAL001"
    );
    expect(escalatedDeal001).toBeDefined();
    expect(escalatedDeal001?.dealId).toBe("DEAL001");
    expect(escalatedDeal001?.overdueDays).toBe(15);
    expect(escalatedDeal001?.isUnbilled).toBe(true);
    expect(escalatedDeal001?.slaExceeded).toBe(true);
    expect(escalatedDeal001?.escalationStatus).toBe("待機中");

    // Validate DEAL003 escalation
    const escalatedDeal003 = result.escalationCases.find(
      (c) => c.dealId === "DEAL003"
    );
    expect(escalatedDeal003).toBeDefined();
    expect(escalatedDeal003?.dealId).toBe("DEAL003");
    expect(escalatedDeal003?.overdueDays).toBe(17);
    expect(escalatedDeal003?.isUnbilled).toBe(true);
    expect(escalatedDeal003?.slaExceeded).toBe(true);
    expect(escalatedDeal003?.escalationStatus).toBe("待機中");

    // Validate DEAL002 is not in escalation (already invoiced)
    const escalatedDeal002 = result.escalationCases.find(
      (c) => c.dealId === "DEAL002"
    );
    expect(escalatedDeal002).toBeUndefined();

    // Validate total cases detected
    expect(result.totalCasesDetected).toBe(2);

    // Validate notification logs
    expect(result.notificationLogs).toHaveLength(2);

    const notificationForDeal001 = result.notificationLogs.find(
      (log) => log.dealId === "DEAL001"
    );
    expect(notificationForDeal001).toBeDefined();
    expect(notificationForDeal001?.notificationStatus).toMatch(
      /通知待ち|通知済/
    );
    expect(notificationForDeal001?.assigneeEmail).toBeDefined();
    expect(notificationForDeal001?.recordedAt).toBeDefined();

    const notificationForDeal003 = result.notificationLogs.find(
      (log) => log.dealId === "DEAL003"
    );
    expect(notificationForDeal003).toBeDefined();
    expect(notificationForDeal003?.notificationStatus).toMatch(
      /通知待ち|通知済/
    );

    // Validate escalation management data structure
    expect(result.escalationManagementData).toBeDefined();
    expect(result.escalationManagementData.escalationListDisplayed).toBe(true);
    expect(result.escalationManagementData.escalationItems).toHaveLength(2);
    expect(
      result.escalationManagementData.escalationItems.every(
        (item) => item.escalationFlag === true
      )
    ).toBe(true);

    // Validate no system errors occurred
    expect(result.systemErrors).toHaveLength(0);
    expect(result.processingStatus).toBe("成功");
  });
});