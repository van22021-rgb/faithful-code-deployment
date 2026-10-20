// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

const site = readFileSync(new URL('../../public/site.html', import.meta.url), 'utf8');
const start = site.indexOf("$('#authF').addEventListener('submit',async e=>{");
const end = site.indexOf('\nasync function logout()', start);
const loginCode = site.slice(start, end);

function loginHarness(admin: boolean, route = '#') {
  const manage = vi.fn().mockResolvedValue(undefined);
  const auth = vi.fn().mockResolvedValue(true);
  const sync = vi.fn().mockResolvedValue(undefined);
  const toast = vi.fn();
  const pageAdmin = vi.fn();
  const addDemo = vi.fn();
  const reset = vi.fn();
  const error = { textContent: '' };
  const button = { disabled: false };
  let submit: ((event: unknown) => Promise<void>) | undefined;
  const form = { email: { value: 'registered@example.com' }, pw: { value: 'Test-password-987' }, reset };
  const select = (selector: string) => {
    if (selector === '#authErr') return error;
    if (selector === '#authGo') return button;
    return { addEventListener: (_: string, callback: typeof submit) => { submit = callback; } };
  };
  const setup = new Function('$', 'cloud', 'syncCloud', 'closeAll', 'emailOK', 'pageAdmin', 'addDemo', 'toast', 'cloudAdmin', 'cur', `
    let mode='login', pending='CQ-W-041', session='registered@example.com';
    ${loginCode}
  `);
  setup(select, () => ({ auth, manage }), sync, vi.fn(), () => true, pageAdmin, addDemo, toast, admin, route);
  return { manage, auth, sync, toast, pageAdmin, addDemo, error, button, async run() {
    if (!submit) throw new Error('Login handler not registered');
    await submit({ preventDefault: vi.fn(), target: form });
  } };
}

describe('Standalone login completion', () => {
  it('automatically opens management after administrator login from the storefront', async () => {
    const flow = loginHarness(true);
    await flow.run();
    expect(flow.auth).toHaveBeenCalledOnce();
    expect(flow.sync).toHaveBeenCalledOnce();
    expect(flow.manage).toHaveBeenCalledOnce();
    expect(flow.addDemo).not.toHaveBeenCalled();
    expect(flow.error.textContent).toBe('');
    expect(flow.button.disabled).toBe(false);
  });
  it('keeps the pending demo purchase for a customer without opening management', async () => {
    const flow = loginHarness(false);
    await flow.run();
    expect(flow.manage).not.toHaveBeenCalled();
    expect(flow.addDemo).toHaveBeenCalledWith('CQ-W-041', true);
  });
});