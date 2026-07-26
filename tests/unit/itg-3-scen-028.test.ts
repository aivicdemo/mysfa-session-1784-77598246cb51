import { aggregateLicenseUtilization } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforce License Utilization Aggregation - Unassigned Users Exclusion', () => {
  // SCEN-028: [edge] ユーザー数・エディション別内訳集計 - 未割り当てユーザーが集計から除外される
  test('should exclude unassigned users from user count and edition breakdown aggregation', () => {
    const testData = {
      users: [
        {
          id: 'USR001',
          name: 'User 1',
          licenseAssigned: true,
          editionType: 'Enterprise',
          assignmentStatus: 'ACTIVE',
        },
        {
          id: 'USR002',
          name: 'User 2',
          licenseAssigned: true,
          editionType: 'Enterprise',
          assignmentStatus: 'ACTIVE',
        },
        {
          id: 'USR003',
          name: 'User 3',
          licenseAssigned: true,
          editionType: 'Professional',
          assignmentStatus: 'ACTIVE',
        },
        {
          id: 'USR004',
          name: 'User 4',
          licenseAssigned: true,
          editionType: 'Professional',
          assignmentStatus: 'ACTIVE',
        },
        {
          id: 'USR005',
          name: 'User 5',
          licenseAssigned: true,
          editionType: 'Developer',
          assignmentStatus: 'ACTIVE',
        },
        {
          id: 'USR006',
          name: 'Unassigned User 1',
          licenseAssigned: false,
          editionType: null,
          assignmentStatus: 'UNASSIGNED',
        },
        {
          id: 'USR007',
          name: 'Unassigned User 2',
          licenseAssigned: false,
          editionType: null,
          assignmentStatus: 'UNASSIGNED',
        },
        {
          id: 'USR008',
          name: 'Unassigned User 3',
          licenseAssigned: false,
          editionType: null,
          assignmentStatus: 'UNASSIGNED',
        },
      ],
    };

    const result = aggregateLicenseUtilization(testData.users);

    // 集計結果に含まれるユーザー数は5名（割り当て済みユーザーのみ）
    expect(result.totalAssignedUsers).toBe(5);

    // 未割り当てユーザーは集計に含まれていない
    expect(result.totalUnassignedUsers).toBe(3);

    // エディション別内訳 - Enterprise: 2名
    expect(result.editionBreakdown.Enterprise).toBe(2);

    // エディション別内訳 - Professional: 2名
    expect(result.editionBreakdown.Professional).toBe(2);

    // エディション別内訳 - Developer: 1名
    expect(result.editionBreakdown.Developer).toBe(1);

    // エディション別内訳に未割り当てカテゴリが存在しない、または0である
    expect(result.editionBreakdown.UNASSIGNED || 0).toBe(0);

    // 全エディション別内訳の合計は割り当て済みユーザー数と一致
    const totalByEdition = Object.entries(result.editionBreakdown).reduce(
      (sum, [edition, count]) => {
        if (edition !== 'UNASSIGNED') {
          return sum + (typeof count === 'number' ? count : 0);
        }
        return sum;
      },
      0,
    );
    expect(totalByEdition).toBe(5);

    // 各割り当て済みユーザーが割り当て状態を保持
    expect(result.assignedUserDetails.length).toBe(5);
    result.assignedUserDetails.forEach((user) => {
      expect(user.licenseAssigned).toBe(true);
      expect(user.assignmentStatus).toBe('ACTIVE');
      expect(user.editionType).not.toBeNull();
    });

    // 未割り当てユーザーは詳細情報に含まれない
    const unassignedInDetails = result.assignedUserDetails.filter(
      (user) => user.licenseAssigned === false,
    );
    expect(unassignedInDetails.length).toBe(0);

    // 集計サマリーの検証
    expect(result.summary).toEqual({
      totalLicensedCount: 5,
      totalUnlicensedCount: 3,
      licensePenetration: (5 / 8) * 100,
      editionDistribution: {
        Enterprise: 40, // 2/5 * 100
        Professional: 40, // 2/5 * 100
        Developer: 20, // 1/5 * 100
      },
    });
  });
});