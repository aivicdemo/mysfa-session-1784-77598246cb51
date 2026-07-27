import { recordUnbilledCaseCompletion } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-678
  test("未請求案件の対応完了日を記録するとき、対応完了日が正確に保存される", () => {
    // Arrange
    const project_id = "TEST-PROJ-001";
    const completion_date = "2024-01-15";
    const input_timestamp = new Date("2024-01-15T10:30:00Z");

    const initial_record = {
      id: project_id,
      status: "未請求",
      completedDate: null,
      created_at: new Date("2024-01-10T09:00:00Z"),
      updated_at: new Date("2024-01-10T09:00:00Z"),
    };

    // Act
    const result = recordUnbilledCaseCompletion(project_id, completion_date, input_timestamp);

    // Assert
    expect(result).toEqual({
      id: project_id,
      status: "対応完了",
      completedDate: "2024-01-15",
      created_at: new Date("2024-01-10T09:00:00Z"),
      updated_at: input_timestamp,
    });
  });
});