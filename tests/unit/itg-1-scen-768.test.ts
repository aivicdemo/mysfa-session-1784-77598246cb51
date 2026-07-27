import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  test('SCEN-768: 請求対象データ抽出機能 - 金額条件が下限値直下のとき、該当データが抽出されない', () => {
    // Arrange
    const minAmountThreshold = 10000;

    const belowThresholdRecords = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-001',
        amount: 9999,
        status: 'completed',
        invoiceIssuedDate: '2024-01-15',
      },
      {
        dealId: 'DEAL-002',
        customerId: 'CUST-002',
        amount: 9999,
        status: 'completed',
        invoiceIssuedDate: '2024-01-16',
      },
      {
        dealId: 'DEAL-003',
        customerId: 'CUST-003',
        amount: 9999,
        status: 'completed',
        invoiceIssuedDate: '2024-01-17',
      },
    ];

    const atOrAboveThresholdRecords = [
      {
        dealId: 'DEAL-004',
        customerId: 'CUST-004',
        amount: 10000,
        status: 'completed',
        invoiceIssuedDate: '2024-01-18',
      },
      {
        dealId: 'DEAL-005',
        customerId: 'CUST-005',
        amount: 10001,
        status: 'completed',
        invoiceIssuedDate: '2024-01-19',
      },
    ];

    const allRecords = [...belowThresholdRecords, ...atOrAboveThresholdRecords];

    // Act
    const extractedData = extractBillingTargetData(allRecords, {
      minAmount: minAmountThreshold,
    });

    // Assert
    expect(extractedData).toHaveLength(2);
    expect(extractedData.every((record) => record.amount >= minAmountThreshold)).toBe(true);
    expect(extractedData.every((record) => record.amount < minAmountThreshold)).toBe(false);

    const extractedDealIds = extractedData.map((record) => record.dealId);
    expect(extractedDealIds).toContain('DEAL-004');
    expect(extractedDealIds).toContain('DEAL-005');
    expect(extractedDealIds).not.toContain('DEAL-001');
    expect(extractedDealIds).not.toContain('DEAL-002');
    expect(extractedDealIds).not.toContain('DEAL-003');
  });
});