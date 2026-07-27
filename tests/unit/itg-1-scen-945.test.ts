import { detectBillingDiscrepancies } from '../../src/logic/it-1784969823049-1-1-1';

describe('売上実績・請求データ照合機能 - ズレ検出', () => {
  // SCEN-945: [normal] 売上実績・請求データ照合機能 - ズレ検出結果に遅延案件の詳細情報（案件名、顧客名、金額、ズレ日数）が含まれる
  test('should detect billing discrepancies and include detailed information for delayed cases', () => {
    const salesRecords = [
      {
        deal_name: 'A社システム導入',
        customer_name: 'A社',
        amount: 1500000,
        sales_recognition_date: new Date('2024-01-15'),
      },
      {
        deal_name: 'B社コンサル',
        customer_name: 'B社',
        amount: 800000,
        sales_recognition_date: new Date('2024-01-20'),
      },
      {
        deal_name: 'C社保守',
        customer_name: 'C社',
        amount: 300000,
        sales_recognition_date: new Date('2024-01-25'),
      },
    ];

    const billingRecords = [
      {
        customer_name: 'A社',
        amount: 1500000,
        billing_date: new Date('2024-01-20'),
      },
      {
        customer_name: 'B社',
        amount: 800000,
        billing_date: new Date('2024-01-25'),
      },
      {
        customer_name: 'C社',
        amount: 300000,
        billing_date: new Date('2024-02-10'),
      },
    ];

    const result = detectBillingDiscrepancies(salesRecords, billingRecords);

    expect(result).toHaveLength(3);

    const companyA = result.find((r) => r.deal_name === 'A社システム導入');
    expect(companyA).toBeDefined();
    expect(companyA?.customer_name).toBe('A社');
    expect(companyA?.amount).toBe(1500000);
    expect(companyA?.discrepancy_days).toBe(5);

    const companyB = result.find((r) => r.deal_name === 'B社コンサル');
    expect(companyB).toBeDefined();
    expect(companyB?.customer_name).toBe('B社');
    expect(companyB?.amount).toBe(800000);
    expect(companyB?.discrepancy_days).toBe(5);

    const companyC = result.find((r) => r.deal_name === 'C社保守');
    expect(companyC).toBeDefined();
    expect(companyC?.customer_name).toBe('C社');
    expect(companyC?.amount).toBe(300000);
    expect(companyC?.discrepancy_days).toBe(16);
  });
});