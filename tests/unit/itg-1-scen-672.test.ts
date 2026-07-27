import { recordDelayedProjectCompletionResponse } from '../../src/logic/it-1784969823049-1-1-1';

describe('遅延案件の顧客対応完了を記録する機能', () => {
  test('SCEN-672: 遅延案件の対応完了日を記録するとき、対応完了日が正確に保存される', () => {
    // Arrange
    const projectId = 'PROJ-001';
    const customerName = 'テスト顧客A';
    const plannedCompletionDate = new Date('2024-01-15T00:00:00Z');
    const responseCompletionDate = new Date('2024-02-10T14:30:00Z');
    const responseContent = '顧客への遅延理由説明と代替案提示を完了';
    const currentTime = new Date('2024-02-10T14:31:00Z');

    const delayedProject = {
      projectId: projectId,
      customerName: customerName,
      plannedCompletionDate: plannedCompletionDate,
      status: '遅延中',
      responseCompletionDate: responseCompletionDate,
      responseContent: responseContent,
      lastUpdatedAt: currentTime,
    };

    // Act
    const result = recordDelayedProjectCompletionResponse({
      projectId: projectId,
      responseCompletionDate: responseCompletionDate,
      responseContent: responseContent,
      recordedAt: currentTime,
    });

    // Assert
    expect(result.projectId).toBe('PROJ-001');
    expect(result.responseCompletionDate).toEqual(new Date('2024-02-10T14:30:00Z'));
    expect(result.responseContent).toBe('顧客への遅延理由説明と代替案提示を完了');
    expect(result.status).toBe('対応完了');
    expect(result.lastUpdatedAt.getTime()).toBeGreaterThanOrEqual(
      new Date('2024-02-10T14:30:00Z').getTime()
    );
    expect(result.lastUpdatedAt.getTime()).toBeLessThanOrEqual(
      new Date('2024-02-10T14:32:00Z').getTime()
    );
  });
});