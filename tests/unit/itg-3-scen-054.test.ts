import { validateMigrationPhaseCompletionCriteria } from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("段階的移行計画の定義・検証機能", () => {
  // SCEN-054
  test("移行フェーズの完了判定基準が不明確な場合、エラーが発生する", () => {
    const migrationPhaseData = {
      phaseId: "PHASE-001",
      phaseName: "Phase 1: Data Migration",
      phaseOrder: 1,
      completionCriteria: "",
      startDate: new Date("2024-06-01"),
      targetEndDate: new Date("2024-06-30"),
      riskFactors: ["Data loss risk", "User adoption delay"],
      mitigationStrategies: ["Backup verification", "Training program"],
    };

    expect(() =>
      validateMigrationPhaseCompletionCriteria(migrationPhaseData)
    ).toThrow(/完了判定基準/);
  });

  test("移行フェーズの完了判定基準がnullの場合、エラーが発生する", () => {
    const migrationPhaseData = {
      phaseId: "PHASE-002",
      phaseName: "Phase 2: System Integration",
      phaseOrder: 2,
      completionCriteria: null,
      startDate: new Date("2024-07-01"),
      targetEndDate: new Date("2024-07-31"),
      riskFactors: ["Integration complexity"],
      mitigationStrategies: ["Technical review"],
    };

    expect(() =>
      validateMigrationPhaseCompletionCriteria(migrationPhaseData)
    ).toThrow(/完了判定基準/);
  });

  test("移行フェーズの完了判定基準が空白のみの場合、エラーが発生する", () => {
    const migrationPhaseData = {
      phaseId: "PHASE-003",
      phaseName: "Phase 3: User Testing",
      phaseOrder: 3,
      completionCriteria: "   ",
      startDate: new Date("2024-08-01"),
      targetEndDate: new Date("2024-08-31"),
      riskFactors: ["User resistance"],
      mitigationStrategies: ["Change management"],
    };

    expect(() =>
      validateMigrationPhaseCompletionCriteria(migrationPhaseData)
    ).toThrow(/完了判定基準/);
  });

  test("移行フェーズの完了判定基準が有効な場合、検証に成功する", () => {
    const migrationPhaseData = {
      phaseId: "PHASE-004",
      phaseName: "Phase 4: Production Cutover",
      phaseOrder: 4,
      completionCriteria:
        "All data migrated successfully, user acceptance testing passed with 95% pass rate, system performance meets baseline requirements",
      startDate: new Date("2024-09-01"),
      targetEndDate: new Date("2024-09-15"),
      riskFactors: ["Production downtime"],
      mitigationStrategies: ["Rollback plan", "24/7 support team"],
    };

    const result = validateMigrationPhaseCompletionCriteria(migrationPhaseData);

    expect(result).toEqual({
      isValid: true,
      phaseId: "PHASE-004",
      phaseName: "Phase 4: Production Cutover",
      phaseOrder: 4,
      completionCriteria:
        "All data migrated successfully, user acceptance testing passed with 95% pass rate, system performance meets baseline requirements",
      startDate: new Date("2024-09-01"),
      targetEndDate: new Date("2024-09-15"),
      riskFactors: ["Production downtime"],
      mitigationStrategies: ["Rollback plan", "24/7 support team"],
    });
  });

  test("複数の移行フェーズのうち、1つの完了判定基準が不明確な場合、そのフェーズでエラーが発生する", () => {
    const migrationPhasesData = [
      {
        phaseId: "PHASE-005",
        phaseName: "Phase 1: Assessment",
        phaseOrder: 1,
        completionCriteria:
          "Gap analysis completed, requirements documented, stakeholder sign-off obtained",
        startDate: new Date("2024-05-01"),
        targetEndDate: new Date("2024-05-31"),
        riskFactors: ["Scope creep"],
        mitigationStrategies: ["Scope lockdown", "Change control board"],
      },
      {
        phaseId: "PHASE-006",
        phaseName: "Phase 2: Development",
        phaseOrder: 2,
        completionCriteria: "",
        startDate: new Date("2024-06-01"),
        targetEndDate: new Date("2024-08-31"),
        riskFactors: ["Development delays"],
        mitigationStrategies: ["Agile sprints", "Resource allocation"],
      },
    ];

    expect(() =>
      validateMigrationPhaseCompletionCriteria(migrationPhasesData[1])
    ).toThrow(/完了判定基準/);
  });
});