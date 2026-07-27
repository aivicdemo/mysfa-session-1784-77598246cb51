import { classifyCurrentMonthDealsByStatus } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  test('SCEN-143: 当月商談ステータス分類機能 - 当月登録商談に対して進捗ステータスが正確に分類される', () => {
    // Arrange
    const currentDate = new Date('2024-04-15T10:00:00Z');
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const dealA = {
      id: 'DEAL-001',
      name: '商談A',
      status: '提案中',
      registeredDate: new Date(`${currentYear}-${String(currentMonth).padStart(2, '0')}-01T00:00:00Z`),
      amount: 500000,
    };

    const dealB = {
      id: 'DEAL-002',
      name: '商談B',
      status: '交渉中',
      registeredDate: new Date(`${currentYear}-${String(currentMonth).padStart(2, '0')}-15T00:00:00Z`),
      amount: 750000,
    };

    const dealC = {
      id: 'DEAL-003',
      name: '商談C',
      status: '決定',
      registeredDate: new Date(`${currentYear}-${String(currentMonth).padStart(2, '0')}-28T00:00:00Z`),
      amount: 1000000,
    };

    const allDeals = [dealA, dealB, dealC];

    // Act
    const classificationResult = classifyCurrentMonthDealsByStatus(allDeals, currentDate);

    // Assert
    // 『提案中』グループの検証
    expect(classificationResult['提案中']).toBeDefined();
    expect(classificationResult['提案中']).toHaveLength(1);
    expect(classificationResult['提案中'][0].id).toBe('DEAL-001');
    expect(classificationResult['提案中'][0].name).toBe('商談A');

    // 『交渉中』グループの検証
    expect(classificationResult['交渉中']).toBeDefined();
    expect(classificationResult['交渉中']).toHaveLength(1);
    expect(classificationResult['交渉中'][0].id).toBe('DEAL-002');
    expect(classificationResult['交渉中'][0].name).toBe('商談B');

    // 『決定』グループの検証
    expect(classificationResult['決定']).toBeDefined();
    expect(classificationResult['決定']).toHaveLength(1);
    expect(classificationResult['決定'][0].id).toBe('DEAL-003');
    expect(classificationResult['決定'][0].name).toBe('商談C');

    // 総レコード数の検証
    const totalClassifiedDeals = Object.values(classificationResult).flat();
    expect(totalClassifiedDeals).toHaveLength(3);
  });
});