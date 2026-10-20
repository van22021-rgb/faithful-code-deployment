import { describe, expect, it } from 'vitest';
import { RESPONSE_DAYS, ownershipSchema, orderSchema } from './commerce-schema';
describe('Demo purchase requirements', () => {
  it('sets the response period to seven days', () => { expect(RESPONSE_DAYS).toBe(7); });
  it('allows only the two requested ownership states', () => {
    expect(ownershipSchema.options).toEqual(['available', 'slotout']);
    expect(ownershipSchema.safeParse('sold').success).toBe(false);
  });
  it('requires complete contact information and a positive proposed price', () => {
    const item = { code: 'CQ-W-041', fb: 'https://facebook.com/customer', email: 'customer@example.com', price: 500000, note: '' };
    expect(orderSchema.safeParse({name:'Customer',items:[item]}).success).toBe(true);
    for(const change of [{fb:''},{email:''},{price:0}]) expect(orderSchema.safeParse({name:'Customer',items:[{...item,...change}]}).success).toBe(false);
  });
});