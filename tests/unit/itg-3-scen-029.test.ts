import { aggregateUsersByEdition } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforce License User and Edition Aggregation', () => {
  // SCEN-029
  test('should throw error when edition information is invalid', () => {
    expect(() => aggregateUsersByEdition(null)).toThrow(/edition/i);
    expect(() => aggregateUsersByEdition(undefined)).toThrow(/edition/i);
    expect(() => aggregateUsersByEdition([])).toThrow(/edition/i);
    expect(() => aggregateUsersByEdition([
      { editionId: null, userCount: 5, editionName: 'Professional' }
    ])).toThrow(/edition/i);
    expect(() => aggregateUsersByEdition([
      { editionId: '', userCount: 5, editionName: 'Professional' }
    ])).toThrow(/edition/i);
    expect(() => aggregateUsersByEdition([
      { editionId: undefined, userCount: 5, editionName: 'Professional' }
    ])).toThrow(/edition/i);
    expect(() => aggregateUsersByEdition([
      { editionId: 'PROF-001', userCount: 5, editionName: '' }
    ])).toThrow(/edition/i);
    expect(() => aggregateUsersByEdition([
      { editionId: 'PROF-001', userCount: 5, editionName: null }
    ])).toThrow(/edition/i);
    expect(() => aggregateUsersByEdition([
      { editionId: 'PROF-001', userCount: -1, editionName: 'Professional' }
    ])).toThrow(/edition/i);
    expect(() => aggregateUsersByEdition([
      { editionId: 'PROF-001', userCount: NaN, editionName: 'Professional' }
    ])).toThrow(/edition/i);
    expect(() => aggregateUsersByEdition([
      { editionId: 'PROF-001', userCount: 'five', editionName: 'Professional' }
    ])).toThrow(/edition/i);
  });
});