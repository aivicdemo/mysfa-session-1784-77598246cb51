import { aggregateUserCountByEdition } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforce ライセンス利用状況の可視化機能（ユーザー数・エディション・年間費用・機能利用率の一覧表示・分析）', () => {
  // SCEN-027
  test('[normal] ユーザー数・エディション別内訳集計 - 割り当てられたユーザーがエディション別に正確に集計される', () => {
    // 初期状態: 複数のエディションに割り当てられたユーザーデータ
    const initialUserAssignments = [
      {
        user_id: 'user_001',
        user_name: 'Alice Johnson',
        edition_id: 'ed_standard_001',
        edition_name: 'Standard',
        assigned_date: '2024-01-15T10:00:00Z',
      },
      {
        user_id: 'user_002',
        user_name: 'Bob Smith',
        edition_id: 'ed_standard_001',
        edition_name: 'Standard',
        assigned_date: '2024-01-16T11:30:00Z',
      },
      {
        user_id: 'user_003',
        user_name: 'Charlie Brown',
        edition_id: 'ed_professional_001',
        edition_name: 'Professional',
        assigned_date: '2024-01-17T09:15:00Z',
      },
      {
        user_id: 'user_004',
        user_name: 'Diana Prince',
        edition_id: 'ed_enterprise_001',
        edition_name: 'Enterprise',
        assigned_date: '2024-01-18T14:45:00Z',
      },
      {
        user_id: 'user_005',
        user_name: 'Ethan Hunt',
        edition_id: 'ed_enterprise_001',
        edition_name: 'Enterprise',
        assigned_date: '2024-01-19T08:20:00Z',
      },
      {
        user_id: 'user_006',
        user_name: 'Fiona Green',
        edition_id: 'ed_enterprise_001',
        edition_name: 'Enterprise',
        assigned_date: '2024-01-20T16:00:00Z',
      },
    ];

    // 期待値: エディション別の集計結果
    // Standard: 2ユーザー (user_001, user_002)
    // Professional: 1ユーザー (user_003)
    // Enterprise: 3ユーザー (user_004, user_005, user_006)
    // 合計: 6ユーザー
    const expectedInitialAggregation = {
      total_user_count: 6,
      edition_breakdown: [
        {
          edition_id: 'ed_standard_001',
          edition_name: 'Standard',
          user_count: 2,
          percentage: 33.33,
        },
        {
          edition_id: 'ed_professional_001',
          edition_name: 'Professional',
          user_count: 1,
          percentage: 16.67,
        },
        {
          edition_id: 'ed_enterprise_001',
          edition_name: 'Enterprise',
          user_count: 3,
          percentage: 50.0,
        },
      ],
    };

    // 初期状態でのエディション別ユーザー数集計を実行
    const initialResult = aggregateUserCountByEdition(initialUserAssignments);

    // アサーション1: 合計ユーザー数が正確に集計されていることを検証
    expect(initialResult.total_user_count).toBe(6);

    // アサーション2: エディション別ユーザー数の集計数が期待値と一致することを検証
    expect(initialResult.edition_breakdown).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          edition_id: 'ed_standard_001',
          edition_name: 'Standard',
          user_count: 2,
        }),
        expect.objectContaining({
          edition_id: 'ed_professional_001',
          edition_name: 'Professional',
          user_count: 1,
        }),
        expect.objectContaining({
          edition_id: 'ed_enterprise_001',
          edition_name: 'Enterprise',
          user_count: 3,
        }),
      ])
    );

    // アサーション3: 各エディションのパーセンテージが正確に計算されていることを検証
    const standardEdition = initialResult.edition_breakdown.find(
      (e) => e.edition_id === 'ed_standard_001'
    );
    expect(standardEdition?.percentage).toBeCloseTo(33.33, 1);

    const professionalEdition = initialResult.edition_breakdown.find(
      (e) => e.edition_id === 'ed_professional_001'
    );
    expect(professionalEdition?.percentage).toBeCloseTo(16.67, 1);

    const enterpriseEdition = initialResult.edition_breakdown.find(
      (e) => e.edition_id === 'ed_enterprise_001'
    );
    expect(enterpriseEdition?.percentage).toBeCloseTo(50.0, 1);

    // アサーション4: エディション別ユーザー数の合算が合計ユーザー数と一致することを検証
    const sumOfEditionCounts = initialResult.edition_breakdown.reduce(
      (sum, edition) => sum + edition.user_count,
      0
    );
    expect(sumOfEditionCounts).toBe(initialResult.total_user_count);

    // ユーザー割り当て変更: 新規ユーザーを別のエディションに割り当てる
    const updatedUserAssignments = [
      ...initialUserAssignments,
      {
        user_id: 'user_007',
        user_name: 'Grace Lee',
        edition_id: 'ed_standard_001',
        edition_name: 'Standard',
        assigned_date: '2024-01-21T12:00:00Z',
      },
      {
        user_id: 'user_008',
        user_name: 'Henry Clark',
        edition_id: 'ed_professional_001',
        edition_name: 'Professional',
        assigned_date: '2024-01-22T13:30:00Z',
      },
    ];

    // 期待値: 更新後のエディション別集計結果
    // Standard: 3ユーザー (user_001, user_002, user_007)
    // Professional: 2ユーザー (user_003, user_008)
    // Enterprise: 3ユーザー (user_004, user_005, user_006)
    // 合計: 8ユーザー
    const updatedResult = aggregateUserCountByEdition(updatedUserAssignments);

    // アサーション5: 更新後の合計ユーザー数が正確に集計されていることを検証
    expect(updatedResult.total_user_count).toBe(8);

    // アサーション6: 更新後のエディション別ユーザー数が正確に変更されていることを検証
    const updatedStandardEdition = updatedResult.edition_breakdown.find(
      (e) => e.edition_id === 'ed_standard_001'
    );
    expect(updatedStandardEdition?.user_count).toBe(3);

    const updatedProfessionalEdition = updatedResult.edition_breakdown.find(
      (e) => e.edition_id === 'ed_professional_001'
    );
    expect(updatedProfessionalEdition?.user_count).toBe(2);

    const updatedEnterpriseEdition = updatedResult.edition_breakdown.find(
      (e) => e.edition_id === 'ed_enterprise_001'
    );
    expect(updatedEnterpriseEdition?.user_count).toBe(3);

    // アサーション7: 更新後のパーセンテージが正確に計算されていることを検証
    expect(updatedStandardEdition?.percentage).toBeCloseTo(37.5, 1);
    expect(updatedProfessionalEdition?.percentage).toBeCloseTo(25.0, 1);
    expect(updatedEnterpriseEdition?.percentage).toBeCloseTo(37.5, 1);

    // アサーション8: 更新後のエディション別ユーザー数の合算が合計ユーザー数と一致することを検証
    const updatedSumOfEditionCounts = updatedResult.edition_breakdown.reduce(
      (sum, edition) => sum + edition.user_count,
      0
    );
    expect(updatedSumOfEditionCounts).toBe(updatedResult.total_user_count);

    // アサーション9: 配列の長さがエディション数と一致することを検証
    expect(updatedResult.edition_breakdown.length).toBe(3);

    // アサーション10: エディション別集計にすべてのエディションが含まれていることを検証
    const editionIds = updatedResult.edition_breakdown.map((e) => e.edition_id);
    expect(editionIds).toContain('ed_standard_001');
    expect(editionIds).toContain('ed_professional_001');
    expect(editionIds).toContain('ed_enterprise_001');
  });
});