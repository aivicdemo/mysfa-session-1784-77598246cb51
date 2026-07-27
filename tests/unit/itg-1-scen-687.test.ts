import { detectDelayedInvoiceCases } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-687
  test('月次決算期限3営業日前に照合開始時、遅延案件が複数件の場合、全案件が検出結果に含まれる', () => {
    // 準備: テストデータを構築
    const monthlyDeadline = new Date('2024-01-31T23:59:59Z');
    const executionDate = new Date('2024-01-26T10:00:00Z'); // 決算期限3営業日前

    // 遅延案件A: 期日超過10日
    const delayedCaseA = {
      dealId: 'DEAL-A001',
      dealStatus: '成約済み',
      invoiceStatus: '未発行',
      daysOverdue: 10,
      expectedInvoiceDate: new Date('2024-01-16T00:00:00Z'),
      dealAmount: 500000,
    };

    // 遅延案件B: 期日超過5日
    const delayedCaseB = {
      dealId: 'DEAL-B002',
      dealStatus: '成約済み',
      invoiceStatus: '未発行',
      daysOverdue: 5,
      expectedInvoiceDate: new Date('2024-01-21T00:00:00Z'),
      dealAmount: 300000,
    };

    // 遅延案件C: 期日超過15日
    const delayedCaseC = {
      dealId: 'DEAL-C003',
      dealStatus: '成約済み',
      invoiceStatus: '未発行',
      daysOverdue: 15,
      expectedInvoiceDate: new Date('2024-01-11T00:00:00Z'),
      dealAmount: 750000,
    };

    // 正常な案件D: 請求発行済み、期日内
    const normalCaseD = {
      dealId: 'DEAL-D004',
      dealStatus: '成約済み',
      invoiceStatus: '発行済み',
      daysOverdue: 0,
      expectedInvoiceDate: new Date('2024-01-30T00:00:00Z'),
      dealAmount: 200000,
    };

    const allCases = [delayedCaseA, delayedCaseB, delayedCaseC, normalCaseD];

    // 実行: 照合処理を実行
    const detectionResult = detectDelayedInvoiceCases(
      allCases,
      monthlyDeadline,
      executionDate
    );

    // 検証: 検出結果に遅延案件が全て含まれることを確認
    expect(detectionResult.delayedCases).toHaveLength(3);

    // 検証: 遅延案件A が検出されているか確認
    const foundCaseA = detectionResult.delayedCases.find(
      (c) => c.dealId === 'DEAL-A001'
    );
    expect(foundCaseA).toBeDefined();
    expect(foundCaseA?.discrepancyType).toBe('商談完了済みだが請求書未発行');
    expect(foundCaseA?.daysOverdue).toBe(10);

    // 検証: 遅延案件B が検出されているか確認
    const foundCaseB = detectionResult.delayedCases.find(
      (c) => c.dealId === 'DEAL-B002'
    );
    expect(foundCaseB).toBeDefined();
    expect(foundCaseB?.discrepancyType).toBe('商談完了済みだが請求書未発行');
    expect(foundCaseB?.daysOverdue).toBe(5);

    // 検証: 遅延案件C が検出されているか確認
    const foundCaseC = detectionResult.delayedCases.find(
      (c) => c.dealId === 'DEAL-C003'
    );
    expect(foundCaseC).toBeDefined();
    expect(foundCaseC?.discrepancyType).toBe('商談完了済みだが請求書未発行');
    expect(foundCaseC?.daysOverdue).toBe(15);

    // 検証: 正常な案件D が検出結果に含まれていないことを確認
    const foundCaseD = detectionResult.delayedCases.find(
      (c) => c.dealId === 'DEAL-D004'
    );
    expect(foundCaseD).toBeUndefined();

    // 検証: 検出結果の総件数が遅延案件の総数と一致することを確認
    expect(detectionResult.delayedCases.length).toBe(3);
  });
});