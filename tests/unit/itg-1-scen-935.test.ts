import { reconcileSalesAndInvoiceData } from "../../src/logic/it-1784969823049-1-1-1";

describe("売上実績・請求データ照合機能", () => {
  test("SCEN-935: 同一の入力で照合処理を2回実行した場合、同一の結果が返される", () => {
    // テストデータの準備
    const salesData = {
      salesDate: "2024-01-15",
      amount: 150000,
      customerId: "C001",
      productId: "P001",
    };

    const invoiceData = {
      invoiceDate: "2024-01-15",
      amount: 150000,
      customerId: "C001",
      productId: "P001",
    };

    // 第1回目の照合処理を実行
    const firstResult = reconcileSalesAndInvoiceData(salesData, invoiceData);

    // 第1回目の照合結果をメモリに保存
    const firstStatus = firstResult.reconciliationStatus;
    const firstMatchedItems = firstResult.matchedItems;
    const firstDifferenceItems = firstResult.differenceItems;
    const firstJudgement = firstResult.judgement;

    // 第2回目の照合処理を実行（同じテストデータで）
    const secondResult = reconcileSalesAndInvoiceData(
      salesData,
      invoiceData
    );

    // 第2回目の照合結果を取得
    const secondStatus = secondResult.reconciliationStatus;
    const secondMatchedItems = secondResult.matchedItems;
    const secondDifferenceItems = secondResult.differenceItems;
    const secondJudgement = secondResult.judgement;

    // 照合ステータスが一致していることを確認
    expect(firstStatus).toBe("完全一致");
    expect(secondStatus).toBe("完全一致");
    expect(firstStatus).toBe(secondStatus);

    // 一致項目が一致していることを確認
    expect(firstMatchedItems).toEqual([
      "salesDate",
      "amount",
      "customerId",
      "productId",
    ]);
    expect(secondMatchedItems).toEqual([
      "salesDate",
      "amount",
      "customerId",
      "productId",
    ]);
    expect(firstMatchedItems).toEqual(secondMatchedItems);

    // 差異項目がなく一致していることを確認
    expect(firstDifferenceItems).toEqual([]);
    expect(secondDifferenceItems).toEqual([]);
    expect(firstDifferenceItems).toEqual(secondDifferenceItems);

    // 照合判定結果が一致していることを確認
    expect(firstJudgement).toBe("OK");
    expect(secondJudgement).toBe("OK");
    expect(firstJudgement).toBe(secondJudgement);

    // 結果全体が完全に一致していることを確認
    expect(firstResult).toEqual(secondResult);
  });
});