import { validateMigrationCompletion } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-993
  test('移行判定結果に1件の不整合が検出された場合、その不整合レコードが是正候補として特定される', () => {
    const migrationRecords = [
      {
        recordId: 'MIG001',
        customerId: 'CUST-2024-0001',
        customerName: 'Test Company A',
        dealAmount: 100000,
        dealStatus: '受注',
        invoiceDate: '2024-01-15',
        invoiceAmount: 100000,
        isConsistent: true,
      },
      {
        recordId: 'MIG002',
        customerId: 'CUST-2024-0002',
        customerName: 'Test Company B',
        dealAmount: 150000,
        dealStatus: '受注',
        invoiceDate: '2024-01-16',
        invoiceAmount: 150000,
        isConsistent: true,
      },
      {
        recordId: 'MIG003',
        customerId: 'CUST-2024-0003',
        customerName: 'Test Company C',
        dealAmount: 120000,
        dealStatus: '受注',
        invoiceDate: '2024-01-17',
        invoiceAmount: 120000,
        isConsistent: true,
      },
      {
        recordId: 'MIG004',
        customerId: 'CUST-2024-0004',
        customerName: 'Test Company D',
        dealAmount: 200000,
        dealStatus: '受注',
        invoiceDate: '2024-01-18',
        invoiceAmount: 200000,
        isConsistent: true,
      },
      {
        recordId: 'MIG005',
        customerId: 'CUST-2024-0005',
        customerName: 'Test Company E',
        dealAmount: 180000,
        dealStatus: '受注',
        invoiceDate: '2024-01-19',
        invoiceAmount: 180000,
        isConsistent: true,
      },
      {
        recordId: 'MIG006',
        customerId: 'INVALID_FORMAT_X',
        customerName: 'Test Company F',
        dealAmount: 110000,
        dealStatus: '受注',
        invoiceDate: '2024-01-20',
        invoiceAmount: 110000,
        isConsistent: false,
      },
      {
        recordId: 'MIG007',
        customerId: 'CUST-2024-0007',
        customerName: 'Test Company G',
        dealAmount: 95000,
        dealStatus: '受注',
        invoiceDate: '2024-01-21',
        invoiceAmount: 95000,
        isConsistent: true,
      },
      {
        recordId: 'MIG008',
        customerId: 'CUST-2024-0008',
        customerName: 'Test Company H',
        dealAmount: 140000,
        dealStatus: '受注',
        invoiceDate: '2024-01-22',
        invoiceAmount: 140000,
        isConsistent: true,
      },
      {
        recordId: 'MIG009',
        customerId: 'CUST-2024-0009',
        customerName: 'Test Company I',
        dealAmount: 160000,
        dealStatus: '受注',
        invoiceDate: '2024-01-23',
        invoiceAmount: 160000,
        isConsistent: true,
      },
      {
        recordId: 'MIG010',
        customerId: 'CUST-2024-0010',
        customerName: 'Test Company J',
        dealAmount: 170000,
        dealStatus: '受注',
        invoiceDate: '2024-01-24',
        invoiceAmount: 170000,
        isConsistent: true,
      },
    ];

    const result = validateMigrationCompletion(migrationRecords);

    expect(result.totalRecords).toBe(10);
    expect(result.inconsistentRecords).toHaveLength(1);
    expect(result.consistentRecords).toBe(9);
    expect(result.inconsistentRecords[0].recordId).toBe('MIG006');
    expect(result.inconsistentRecords[0].inconsistencyReason).toBe('顧客ID形式不正');
    expect(result.inconsistentRecords[0].affectedFieldName).toBe('customerId');
    expect(result.inconsistentRecords[0].correctionStatus).toBe('是正待ち');
    expect(result.isCompletionApproved).toBe(false);
    expect(result.migrationStatus).toBe('不整合検出');
  });
});