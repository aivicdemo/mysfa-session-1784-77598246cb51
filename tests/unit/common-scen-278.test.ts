import { calculateInitialConstructionCost } from '../../src/logic/common';

describe('共通', () => {
  // SCEN-278
  test('初期構築コスト算出機能 - 人員配置が0の場合、エラーを返す', () => {
    const staffAllocation = 0;
    const projectDurationMonths = 6;
    const unitPricePerMonth = 500000;
    const overheadRate = 0.2;

    expect(() =>
      calculateInitialConstructionCost({
        staffAllocation,
        projectDurationMonths,
        unitPricePerMonth,
        overheadRate,
      })
    ).toThrow(/人員配置/);
  });
});