import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { assignResponseInstructionToCase } from '../../src/logic/it-1784969823049-1-1-1';

interface CaseRecord {
  caseId: string;
  reconciliationStatus: string;
  responseInstructionId: string | null;
  salesPersonId: string | null;
  createdAt: Date;
}

interface ResponseInstruction {
  responseInstructionId: string;
  caseId: string;
  responseStatus: string;
  salesPersonId: string;
  createdAt: Date;
}

interface NotificationServiceAdapterStub {
  sendOrderNotification: jest.Mock;
  sendQuoteNotification: jest.Mock;
  getDeliveryStatus: jest.Mock;
}

describe('段階的対応ルーティング機能 - 照合確定後の対応指示割り当て', () => {
  let notificationServiceAdapterStub: NotificationServiceAdapterStub;
  let caseRecordDatabase: Map<string, CaseRecord>;
  let responseInstructionDatabase: Map<string, ResponseInstruction>;

  beforeEach(() => {
    caseRecordDatabase = new Map();
    responseInstructionDatabase = new Map();

    notificationServiceAdapterStub = {
      sendOrderNotification: jest.fn().mockResolvedValue({ success: true }),
      sendQuoteNotification: jest.fn().mockResolvedValue({ success: true }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ delivered: true }),
    };
  });

  // SCEN-704
  test('照合結果確定後、営業担当者への対応指示対象案件が1件の場合、その案件に対応指示が割り当てられる', async () => {
    const targetCaseId = 'CASE-2024-001';
    const targetSalesPersonId = 'SALES-PERSON-001';
    const now = new Date('2024-02-28T15:30:00Z');

    const preconditionCase: CaseRecord = {
      caseId: targetCaseId,
      reconciliationStatus: 'CONFIRMED',
      responseInstructionId: null,
      salesPersonId: targetSalesPersonId,
      createdAt: new Date('2024-02-27T10:00:00Z'),
    };

    caseRecordDatabase.set(targetCaseId, preconditionCase);

    const preconditionInstructionIdBeforeRouting = caseRecordDatabase.get(targetCaseId)?.responseInstructionId;
    expect(preconditionInstructionIdBeforeRouting).toBeNull();

    const assignmentResult = await assignResponseInstructionToCase(
      {
        caseId: targetCaseId,
        reconciliationStatus: 'CONFIRMED',
        salesPersonId: targetSalesPersonId,
      },
      {
        save: (instruction: ResponseInstruction) => {
          responseInstructionDatabase.set(instruction.responseInstructionId, instruction);
          const updatedCase = caseRecordDatabase.get(targetCaseId);
          if (updatedCase) {
            updatedCase.responseInstructionId = instruction.responseInstructionId;
          }
          return Promise.resolve(instruction.responseInstructionId);
        },
      },
      notificationServiceAdapterStub,
      { getCurrentTimestamp: () => now }
    );

    expect(assignmentResult).toEqual({
      success: true,
      responseInstructionId: expect.any(String),
      caseId: targetCaseId,
    });

    const assignedInstructionId = assignmentResult.responseInstructionId;
    const assignedInstruction = responseInstructionDatabase.get(assignedInstructionId);

    expect(assignedInstruction).toBeDefined();
    expect(assignedInstruction?.responseStatus).toBe('ASSIGNED');
    expect(assignedInstruction?.caseId).toBe(targetCaseId);
    expect(assignedInstruction?.salesPersonId).toBe(targetSalesPersonId);
    expect(assignedInstruction?.createdAt.getTime()).toBeLessThanOrEqual(now.getTime());
    expect(assignedInstruction?.createdAt.getTime()).toBeGreaterThanOrEqual(
      now.getTime() - 5000
    );

    const updatedCase = caseRecordDatabase.get(targetCaseId);
    expect(updatedCase?.responseInstructionId).toBe(assignedInstructionId);

    expect(notificationServiceAdapterStub.sendOrderNotification).toHaveBeenCalledTimes(1);
    expect(notificationServiceAdapterStub.sendQuoteNotification).toHaveBeenCalledTimes(0);
    expect(notificationServiceAdapterStub.sendOrderNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        caseId: targetCaseId,
        responseInstructionId: assignedInstructionId,
      })
    );
  });
});