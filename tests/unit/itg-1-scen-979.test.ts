import { reconcileSalesActualAndInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('売上実績・請求状況照合機能 - 削除済みフラグの除外処理', () => {
  // SCEN-979
  test('売上実績と請求書の両者が削除済みフラグを持つ場合、削除レコードは照合対象から除外される', () => {
    // テストデータセットアップ: 売上実績レコード（削除済みフラグ: true）
    const deletedSalesActual = {
      id: 'SR-001',
      amount: 100000,
      isDeleted: true,
      invoiceId: 'INV-001',
    };

    // テストデータセットアップ: 請求書レコード（削除済みフラグ: true、SR-001と対応）
    const deletedInvoice = {
      id: 'INV-001',
      amount: 100000,
      isDeleted: true,
      salesActualId: 'SR-001',
    };

    // テストデータセットアップ: 照合対象の売上実績レコード（削除済みフラグ: false）
    const activeSalesActual = {
      id: 'SR-002',
      amount: 50000,
      isDeleted: false,
      invoiceId: 'INV-002',
    };

    // テストデータセットアップ: 照合対象の請求書レコード（削除済みフラグ: false、SR-002と対応）
    const activeInvoice = {
      id: 'INV-002',
      amount: 50000,
      isDeleted: false,
      salesActualId: 'SR-002',
    };

    // 売上実績・請求状況照合機能を実行
    const reconciliationResult = reconcileSalesActualAndInvoice([
      deletedSalesActual,
      activeSalesActual,
    ], [
      deletedInvoice,
      activeInvoice,
    ]);

    // 期待結果: 削除済みレコードは除外され、アクティブなレコードペアのみが照合対象に含まれる
    expect(reconciliationResult.matchedPairs).toHaveLength(1);
    expect(reconciliationResult.matchedPairs[0]).toEqual({
      salesActualId: 'SR-002',
      invoiceId: 'INV-002',
      amount: 50000,
    });

    // 削除済みレコードが照合結果に含まれていないことを確認
    expect(reconciliationResult.matchedPairs).not.toContainEqual(
      expect.objectContaining({
        salesActualId: 'SR-001',
      })
    );
    expect(reconciliationResult.matchedPairs).not.toContainEqual(
      expect.objectContaining({
        invoiceId: 'INV-001',
      })
    );
  });
});