import { fetchCustomerRecordsWithFiltering } from "../../src/logic/it-1";

describe("顧客レコード検索・権限制御機能", () => {
  // SCEN-498: [edge] 顧客レコード検索・権限制御機能 - 検索結果が99件のとき、全件が返される
  test("検索結果が99件のとき、全件が返される", () => {
    const loggedInUserId = "user-001";
    const userDepartment = "sales-dept-a";
    const searchQuery = "顧客";

    const assumedCustomerRecords = Array.from({ length: 99 }, (_, index) => ({
      customerId: `cust-${String(index + 1).padStart(3, "0")}`,
      customerName: `${searchQuery}企業${String(index + 1).padStart(3, "0")}`,
      department: userDepartment,
      assignedSalesUserId: loggedInUserId,
      purchaseHistory: [
        {
          purchaseDate: new Date("2024-01-15").toISOString(),
          amount: 100000 + index * 1000,
        },
      ],
      lastContactDate: new Date("2024-02-28").toISOString(),
    }));

    const mockDataSource = {
      searchCustomerRecords: jest.fn().mockResolvedValue(assumedCustomerRecords),
    };

    const mockPermissionService = {
      getAssignedCustomerIds: jest.fn().mockResolvedValue(
        assumedCustomerRecords.map((record) => record.customerId)
      ),
    };

    const result = await fetchCustomerRecordsWithFiltering(
      {
        userId: loggedInUserId,
        department: userDepartment,
        searchQuery,
      },
      {
        dataSource: mockDataSource,
        permissionService: mockPermissionService,
      }
    );

    expect(result.records).toHaveLength(99);
    expect(result.totalCount).toBe(99);
    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.pageSize).toBe(100);
    expect(result.pagination.totalPages).toBe(1);

    result.records.forEach((record, index) => {
      expect(record.customerId).toBe(`cust-${String(index + 1).padStart(3, "0")}`);
      expect(record.customerName).toBe(`${searchQuery}企業${String(index + 1).padStart(3, "0")}`);
      expect(record.assignedSalesUserId).toBe(loggedInUserId);
    });

    expect(mockDataSource.searchCustomerRecords).toHaveBeenCalledWith({
      searchQuery,
      filters: { department: userDepartment },
    });

    expect(mockPermissionService.getAssignedCustomerIds).toHaveBeenCalledWith({
      userId: loggedInUserId,
    });
  });
});