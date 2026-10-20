import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

const site=readFileSync(resolve(process.cwd(),'public/site.html'),'utf8');
const start=site.indexOf('async function openAccount(){');
const end=site.indexOf('\nlet ui=[];',start);
function harness(session: string|null, admin: boolean, cur='#'){
  const handlers: Record<string,()=>Promise<void>>={};
  const manage=vi.fn(),pageAdmin=vi.fn(),openDrawer=vi.fn(),openAuth=vi.fn(),closeAll=vi.fn();
  new Function('$','syncCloud','session','cloudAdmin','cur','cloud','pageAdmin','openDrawer','openAuth','closeAll','toast',site.slice(start,end))(
    (selector:string)=>({addEventListener:(_:string,handler:()=>Promise<void>)=>{handlers[selector]=handler;}}),
    vi.fn(),session,admin,cur,()=>({manage}),pageAdmin,openDrawer,openAuth,closeAll,vi.fn(),
  );
  return {manage,pageAdmin,openDrawer,openAuth,closeAll,async click(selector:string){const handler=handlers[selector];if(!handler)throw new Error('Missing account control');await handler();}};
}
describe('Account and demo-cart destinations',()=>{
  it('opens management, never the cart, for an administrator account',async()=>{
    const flow=harness('admin@example.com',true);await flow.click('#acctBtn');
    expect(flow.manage).toHaveBeenCalledOnce();expect(flow.openDrawer).not.toHaveBeenCalled();
  });
  it('refreshes management and clears overlays when the administrator is already there',async()=>{
    const flow=harness('admin@example.com',true,'#/admin');await flow.click('#acctBtn');
    expect(flow.pageAdmin).toHaveBeenCalledOnce();expect(flow.closeAll).toHaveBeenCalledOnce();expect(flow.manage).not.toHaveBeenCalled();
  });
  it('opens login without opening a cart for signed-out account clicks',async()=>{
    const flow=harness(null,false);await flow.click('#acctBtn');
    expect(flow.openAuth).toHaveBeenCalledWith('login');expect(flow.openDrawer).not.toHaveBeenCalled();
  });
  it('opens customer account independently of the demo cart',async()=>{
    const flow=harness('customer@example.com',false);await flow.click('#acctBtn');
    expect(flow.openDrawer).toHaveBeenCalledWith('account');expect(flow.manage).not.toHaveBeenCalled();
  });
  it('keeps the cart button dedicated to demos even for an administrator',async()=>{
    const flow=harness('admin@example.com',true);await flow.click('#cartBtn');
    expect(flow.openDrawer).toHaveBeenCalledWith('cart');expect(flow.manage).not.toHaveBeenCalled();
  });
});