import { filterPurchaseHistoryByDateRange } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-188
  test('過去購買履歴フィルタリング機能 - 対象期間の設定値が不正な場合、フィルタリング処理がエラーで終了する', () => {
    const purchaseHistory = [
      {
        id: 'PH001',
        customerId: 'CUST001',
        purchaseDate: '2023-06-15',
        amount: 50000,
      },
      {
        id: 'PH002',
        customerId: 'CUST001',
        purchaseDate: '2024-01-20',
        amount: 75000,
      },
      {
        id: 'PH003',
        customerId: 'CUST001',
        purchaseDate: '2024-06-10',
        amount: 120000,
      },
    ];

    // エラーケース 1: 開始日が不正な形式（存在しない日付）
    expect(() => {
      filterPurchaseHistoryByDateRange(purchaseHistory, '2024-13-45', '2024-12-31');
    }).toThrow(/対象期間/);

    // エラーケース 2: 開始日が不正な形式（非日付文字列）
    expect(() => {
      filterPurchaseHistoryByDateRange(purchaseHistory, 'invalid', '2024-12-31');
    }).toThrow(/対象期間/);

    // エラーケース 3: 終了日が開始日より前
    expect(() => {
      filterPurchaseHistoryByDateRange(purchaseHistory, '2024-12-31', '2024-01-01');
    }).toThrow(/開始日/);

    // エラーケース 4: 終了日が不正な形式
    expect(() => {
      filterPurchaseHistoryByDateRange(purchaseHistory, '2024-01-01', 'invalid_date');
    }).toThrow(/対象期間/);

    // 成功ケース: 正しい日付範囲でフィルタリング
    const result = filterPurchaseHistoryByDateRange(
      purchaseHistory,
      '2024-01-01',
      '2024-12-31'
    );
    expect(result).toEqual([
      {
        id: 'PH002',
        customerId: 'CUST001',
        purchaseDate: '2024-01-20',
        amount: 75000,
      },
      {
        id: 'PH003',
        customerId: 'CUST001',
        purchaseDate: '2024-06-10',
        amount: 120000,
      },
    ]);

    // 成功ケース: 開始日と終了日が同じ
    const resultSameDate = filterPurchaseHistoryByDateRange(
      purchaseHistory,
      '2024-01-20',
      '2024-01-20'
    );
    expect(resultSameDate).toEqual([
      {
        id: 'PH002',
        customerId: 'CUST001',
        purchaseDate: '2024-01-20',
        amount: 75000,
      },
    ]);

    // 成功ケース: 期間内に購買履歴がない場合
    const resultEmpty = filterPurchaseHistoryByDateRange(
      purchaseHistory,
      '2025-01-01',
      '2025-12-31'
    );
    expect(resultEmpty).toEqual([]);
  });
});