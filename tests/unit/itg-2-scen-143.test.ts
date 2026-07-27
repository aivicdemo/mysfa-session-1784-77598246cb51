import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { validateInvoiceApprovalPermission } from "../../src/logic/it-1784969823049-2-1-3";

describe("Customer Portal Access Control and Permission Management", () => {
  // SCEN-143: [normal] Invoice approval validation - Permission check succeeds when approver has valid status in user permission master
  test("should authorize invoice approval when approver has valid permission status", async () => {
    // Setup: Test database with user permission record
    const approver_id = "approver_001";
    const invoice_id = "INV-2024-001";
    const permission_status = "有効";
    const permission_type = "invoice_approver";

    // Mock user permission query
    const mockUserPermissionRepository = {
      findByUserIdAndType: jest.fn().mockResolvedValue({
        user_id: approver_id,
        permission_type: permission_type,
        status: permission_status,
        created_at: new Date("2024-01-15T08:00:00Z"),
      }),
    };

    // Mock invoice query
    const mockInvoiceRepository = {
      findById: jest.fn().mockResolvedValue({
        invoice_id: invoice_id,
        status: "待機中",
        approver_id: approver_id,
        amount: 100000,
        created_at: new Date("2024-01-15T09:00:00Z"),
      }),
    };

    // Mock AuditLogExporter adapter
    const mockAuditLogExporter = {
      logPermissionChange: jest.fn().mockResolvedValue({
        log_id: "LOG-2024-001",
        event_type: "permission_check",
        user_id: approver_id,
        resource_id: invoice_id,
        action: "invoice_approval_validated",
        timestamp: new Date("2024-01-15T10:00:00Z"),
      }),
      logUserAccess: jest.fn(),
      logDataAccess: jest.fn(),
      queryAuditLog: jest.fn(),
    };

    // Execute: Call approval validation function
    const result = await validateInvoiceApprovalPermission(
      {
        approver_id: approver_id,
        invoice_id: invoice_id,
      },
      mockUserPermissionRepository,
      mockInvoiceRepository,
      mockAuditLogExporter
    );

    // Verify: User permission master query executed
    expect(mockUserPermissionRepository.findByUserIdAndType).toHaveBeenCalledWith(
      approver_id,
      "invoice_approver"
    );
    expect(mockUserPermissionRepository.findByUserIdAndType).toHaveBeenCalledTimes(1);

    // Verify: Invoice query executed
    expect(mockInvoiceRepository.findById).toHaveBeenCalledWith(invoice_id);
    expect(mockInvoiceRepository.findById).toHaveBeenCalledTimes(1);

    // Verify: AuditLogExporter.logPermissionChange called exactly once
    expect(mockAuditLogExporter.logPermissionChange).toHaveBeenCalledTimes(1);
    expect(mockAuditLogExporter.logPermissionChange).toHaveBeenCalledWith({
      user_id: approver_id,
      resource_id: invoice_id,
      action: "invoice_approval_validated",
      permission_type: permission_type,
      status: permission_status,
    });

    // Verify: Return value indicates authorized state
    expect(result).toEqual({
      authorized: true,
      approver_id: approver_id,
      invoice_id: invoice_id,
      permission_status: permission_status,
      message: "承認者に権限があります",
    });

    // Verify: Specific authorized flag is true
    expect(result.authorized).toBe(true);
  });
});