import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addSnapshot, createProject, deleteProject, duplicateProject, listProjects, renameProject } from './projects';

const input = { budget: 2_000_000, plotWidthFt: 30, plotDepthFt: 40, bedrooms: 2, location: 'Coimbatore, Tamil Nadu' };
beforeEach(() => {
  const data = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value), removeItem: (key: string) => data.delete(key) });
});
describe('local project lifecycle', () => {
  it('creates, renames, duplicates, and deletes projects', () => {
    const p = createProject(input);
    expect(listProjects()).toHaveLength(1);
    expect(renameProject(p.id, 'Coimbatore home')[0].title).toBe('Coimbatore home');
    duplicateProject(p.id);
    expect(listProjects()).toHaveLength(2);
    deleteProject(p.id);
    expect(listProjects()).toHaveLength(1);
  });
  it('appends a new snapshot without changing the earlier version', () => {
    const p = createProject(input);
    const updated = addSnapshot(p.id, { ...input, budget: 2_500_000 });
    expect(updated.snapshots.map(s => s.version)).toEqual([1, 2]);
    expect(updated.snapshots[0].input.budget).toBe(2_000_000);
    expect(updated.snapshots[1].input.budget).toBe(2_500_000);
  });
  it('rejects blank project names', () => {
    const p = createProject(input);
    expect(() => renameProject(p.id, ' ')).toThrow(/cannot be blank/i);
  });
});
