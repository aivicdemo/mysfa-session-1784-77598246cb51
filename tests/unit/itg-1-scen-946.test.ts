import { extractUnbilledProjects } from '../../src/logic/it-1784969823049-1-1-1';

describe('売上実績・請求データ照合機能 - 未請求案件抽出', () => {
  // SCEN-946
  test('未請求案件の詳細情報（案件名、顧客名、金額、予定請求日）が報告結果に含まれる', () => {
    const testProjects = [
      {
        projectId: 'PRJ001',
        projectName: '○○システム導入',
        customerName: '△△株式会社',
        amount: 500000,
        plannedInvoiceDate: '2024-02-15',
        invoiceStatus: '未請求',
      },
      {
        projectId: 'PRJ002',
        projectName: '××コンサル支援',
        customerName: '□□商事',
        amount: 300000,
        plannedInvoiceDate: '2024-02-28',
        invoiceStatus: '未請求',
      },
      {
        projectId: 'PRJ003',
        projectName: '◎◎保守契約',
        customerName: '▲▲工業',
        amount: 200000,
        plannedInvoiceDate: '2024-01-31',
        invoiceStatus: '請求済',
      },
    ];

    const result = extractUnbilledProjects(testProjects);

    expect(result).toHaveLength(2);
    
    expect(result[0]).toEqual({
      projectId: 'PRJ001',
      projectName: '○○システム導入',
      customerName: '△△株式会社',
      amount: 500000,
      plannedInvoiceDate: '2024-02-15',
      invoiceStatus: '未請求',
    });

    expect(result[1]).toEqual({
      projectId: 'PRJ002',
      projectName: '××コンサル支援',
      customerName: '□□商事',
      amount: 300000,
      plannedInvoiceDate: '2024-02-28',
      invoiceStatus: '未請求',
    });

    const prj003Exists = result.some(
      (project) => project.projectId === 'PRJ003'
    );
    expect(prj003Exists).toBe(false);
  });
});