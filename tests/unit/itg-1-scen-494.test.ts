import { SearchCustomerRepository } from '../../src/logic/it-1';

describe('顧客レコード検索・権限制御機能', () => {
  // SCEN-494
  test('顧客IDがnull・空のとき、検索結果に顧客が含まれない', () => {
    const repository = new SearchCustomerRepository();

    const resultWithNull = repository.searchByCustomerId(null);
    expect(resultWithNull).toEqual([]);

    const resultWithEmpty = repository.searchByCustomerId('');
    expect(resultWithEmpty).toEqual([]);

    const resultWithWhitespace = repository.searchByCustomerId('   ');
    expect(resultWithWhitespace).toEqual([]);
  });
});