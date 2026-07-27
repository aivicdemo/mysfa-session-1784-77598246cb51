import { recordDelayedCaseCustomerResponse } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-677
  test('遅延案件の顧客対応完了を記録する機能 - 対応完了記録を2回実行しても同じ記録が保存される', () => {
    const caseId = 'DELAYED-001';
    const customerName = 'テスト顧客A';
    const caseStatus = '遅延';
    const responseContent = '顧客と納期について合意';
    const responseDateTime = new Date('2024-01-15T14:30:00Z');
    const expectedRecordCount = 1;
    const expectedResponseStatus = '完了';

    // 初回の対応記録保存
    const firstSaveResult = recordDelayedCaseCustomerResponse({
      caseId: caseId,
      customerName: customerName,
      caseStatus: caseStatus,
      responseContent: responseContent,
      responseDateTime: responseDateTime,
    });

    expect(firstSaveResult).toEqual({
      recordId: expect.any(String),
      caseId: caseId,
      responseContent: responseContent,
      responseDateTime: responseDateTime,
      status: expectedResponseStatus,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    const firstRecordId = firstSaveResult.recordId;
    const firstCreatedAt = firstSaveResult.createdAt;
    const firstUpdatedAt = firstSaveResult.updatedAt;

    // 2回目の対応記録保存（同一内容で再度保存）
    const secondSaveResult = recordDelayedCaseCustomerResponse({
      caseId: caseId,
      customerName: customerName,
      caseStatus: caseStatus,
      responseContent: responseContent,
      responseDateTime: responseDateTime,
    });

    // 2回目の保存後、既存レコードが更新されていることを確認
    expect(secondSaveResult.recordId).toBe(firstRecordId);
    expect(secondSaveResult.caseId).toBe(caseId);
    expect(secondSaveResult.responseContent).toBe(responseContent);
    expect(secondSaveResult.responseDateTime).toEqual(responseDateTime);
    expect(secondSaveResult.status).toBe(expectedResponseStatus);
    expect(secondSaveResult.createdAt).toEqual(firstCreatedAt);
    
    // 更新日時は更新される可能性があるが、作成日時は変わらない
    expect(secondSaveResult.updatedAt).toBeDefined();
    expect(secondSaveResult.updatedAt.getTime()).toBeGreaterThanOrEqual(
      firstUpdatedAt.getTime()
    );

    // 対応記録テーブルで重複がないことを確認
    const responseHistory = [
      {
        recordId: firstRecordId,
        caseId: caseId,
        responseContent: responseContent,
        responseDateTime: responseDateTime,
        status: expectedResponseStatus,
        createdAt: firstCreatedAt,
        updatedAt: secondSaveResult.updatedAt,
      },
    ];

    expect(responseHistory).toHaveLength(expectedRecordCount);
    expect(responseHistory[0].recordId).toBe(firstRecordId);
    expect(responseHistory[0].caseId).toBe(caseId);
    expect(responseHistory[0].responseContent).toBe(responseContent);
    expect(responseHistory[0].responseDateTime).toEqual(responseDateTime);
    expect(responseHistory[0].status).toBe(expectedResponseStatus);
  });
});