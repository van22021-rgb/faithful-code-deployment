import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

const site = readFileSync(resolve(process.cwd(), 'public/site.html'), 'utf8');
const code = site.slice(site.indexOf('async function pageAdmin(){'), site.indexOf('\nfunction adminOrders(){'));
function harness(initialRoute: string) {
  const sub = document.createElement('div');
  document.body.append(sub);
  let finish: (() => void) | undefined;
  const sync = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
  const setup = new Function('sub', 'syncCloud', 'document', `
    let cur=${JSON.stringify(initialRoute)}, adminRender=0, session='admin', cloudAdmin=true, allOrders=[], demos=[], aTab='orders';
    const back=()=>document.createElement('a');
    const h=(tag,props={},...children)=>{const el=document.createElement(tag); if(props.text)el.textContent=props.text; children.flat().forEach(c=>el.append(c));return el};
    const adminOrders=()=>h('div',{text:'private orders'}),adminDemos=()=>h('div'),logout=()=>{},openAuth=()=>{};
    ${code}
    return {run:pageAdmin, leave:()=>{cur='#/samples';sub.textContent='samples'}};
  `);
  const controls = setup(sub, sync, document) as { run: () => Promise<void>; leave: () => void };
  return { sub, sync, ...controls, finish() { if (!finish) throw new Error('No pending read'); finish(); } };
}
describe('Management route boundaries', () => {
  it('does not render management after leaving for the storefront', async () => {
    const flow=harness('#/admin');
    const pending=flow.run();flow.leave();flow.finish();await pending;
    expect(flow.sub.textContent).toBe('samples');
  });
  it('ignores late management callbacks when already on samples', async () => {
    const flow=harness('#/samples');flow.sub.textContent='samples';await flow.run();
    expect(flow.sync).not.toHaveBeenCalled();expect(flow.sub.textContent).toBe('samples');
  });
});