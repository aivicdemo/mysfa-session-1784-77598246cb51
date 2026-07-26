import { filterActivitiesByType } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-193
  test("活動記録タイプフィルタリング機能 - 選択されたタイプ（メール・電話・訪問等）の活動記録のみが時系列で表示される", () => {
    const activities = [
      {
        id: "activity_001",
        type: "email",
        customerId: "customer_001",
        description: "顧客への初回提案メール送信",
        createdAt: new Date("2024-01-10T14:30:00Z"),
      },
      {
        id: "activity_002",
        type: "phone",
        customerId: "customer_001",
        description: "顧客との電話打ち合わせ",
        createdAt: new Date("2024-01-12T10:00:00Z"),
      },
      {
        id: "activity_003",
        type: "visit",
        customerId: "customer_001",
        description: "顧客先での対面ミーティング",
        createdAt: new Date("2024-01-15T09:00:00Z"),
      },
      {
        id: "activity_004",
        type: "email",
        customerId: "customer_001",
        description: "提案内容に関するフォローアップメール",
        createdAt: new Date("2024-01-20T16:45:00Z"),
      },
      {
        id: "activity_005",
        type: "phone",
        customerId: "customer_001",
        description: "最終確認電話",
        createdAt: new Date("2024-01-25T11:15:00Z"),
      },
      {
        id: "activity_006",
        type: "visit",
        customerId: "customer_001",
        description: "契約書签署の対面対応",
        createdAt: new Date("2024-01-28T13:30:00Z"),
      },
    ];

    // メールタイプでフィルタリング
    const emailFiltered = filterActivitiesByType(activities, "email");

    expect(emailFiltered).toHaveLength(2);
    expect(emailFiltered[0].id).toBe("activity_004");
    expect(emailFiltered[0].type).toBe("email");
    expect(emailFiltered[0].createdAt).toEqual(new Date("2024-01-20T16:45:00Z"));
    expect(emailFiltered[1].id).toBe("activity_001");
    expect(emailFiltered[1].type).toBe("email");
    expect(emailFiltered[1].createdAt).toEqual(new Date("2024-01-10T14:30:00Z"));

    // 時系列順序確認（新しい順）
    expect(emailFiltered[0].createdAt.getTime()).toBeGreaterThan(
      emailFiltered[1].createdAt.getTime()
    );

    // 電話タイプでフィルタリング
    const phoneFiltered = filterActivitiesByType(activities, "phone");

    expect(phoneFiltered).toHaveLength(2);
    expect(phoneFiltered[0].id).toBe("activity_005");
    expect(phoneFiltered[0].type).toBe("phone");
    expect(phoneFiltered[0].createdAt).toEqual(new Date("2024-01-25T11:15:00Z"));
    expect(phoneFiltered[1].id).toBe("activity_002");
    expect(phoneFiltered[1].type).toBe("phone");
    expect(phoneFiltered[1].createdAt).toEqual(new Date("2024-01-12T10:00:00Z"));

    // 時系列順序確認（新しい順）
    expect(phoneFiltered[0].createdAt.getTime()).toBeGreaterThan(
      phoneFiltered[1].createdAt.getTime()
    );

    // 訪問タイプでフィルタリング
    const visitFiltered = filterActivitiesByType(activities, "visit");

    expect(visitFiltered).toHaveLength(2);
    expect(visitFiltered[0].id).toBe("activity_006");
    expect(visitFiltered[0].type).toBe("visit");
    expect(visitFiltered[0].createdAt).toEqual(new Date("2024-01-28T13:30:00Z"));
    expect(visitFiltered[1].id).toBe("activity_003");
    expect(visitFiltered[1].type).toBe("visit");
    expect(visitFiltered[1].createdAt).toEqual(new Date("2024-01-15T09:00:00Z"));

    // 時系列順序確認（新しい順）
    expect(visitFiltered[0].createdAt.getTime()).toBeGreaterThan(
      visitFiltered[1].createdAt.getTime()
    );

    // すべてのフィルタ結果が対象タイプのみであることを確認
    emailFiltered.forEach((activity) => {
      expect(activity.type).toBe("email");
    });

    phoneFiltered.forEach((activity) => {
      expect(activity.type).toBe("phone");
    });

    visitFiltered.forEach((activity) => {
      expect(activity.type).toBe("visit");
    });
  });
});