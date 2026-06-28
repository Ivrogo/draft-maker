import { describe, expect, it } from 'vitest';
import { drafts } from '../src/schema.js';

describe('smoke', () => {
  it('passes trivially', () => {
    expect(1 + 1).toBe(2);
  });

  it('drafts table has expected column names', () => {
    const columns = Object.keys(drafts);
    expect(columns).toContain('id');
    expect(columns).toContain('title');
    expect(columns).toContain('body');
    expect(columns).toContain('project');
    expect(columns).toContain('tags');
    expect(columns).toContain('createdAt');
    expect(columns).toContain('updatedAt');
  });
});
