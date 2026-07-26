import { calculateAnnualMaintenanceCost } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforce ライセンス利用状況の可視化機能', () => {
  // SCEN-033
  test('年間保守運用コスト算出機能 - 人月単価と運用工数から年間保守運用コストが正確に算出される', () => {
    const cost_per_person_month = 800000;
    const operation_months = 12;

    const result = calculateAnnualMaintenanceCost({
      cost_per_person_month,
      operation_months,
    });

    expect(result).toBe(9600000);
  });
});