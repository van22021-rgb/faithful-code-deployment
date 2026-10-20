import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { demoSchema, orderSchema, orderStatusSchema } from './commerce-schema';
import { z } from 'zod';

export const listOrders = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
  const {data,error} = await context.supabase.from('demo_orders').select('*').order('created_at',{ascending:false});
  if(error) throw new Error('Không tải được đơn hàng.');
  return data;
});
export const placeOrder = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((input:unknown)=>orderSchema.parse(input)).handler(async ({data,context}) => {
  const {data:order,error} = await context.supabase.rpc('place_demo_order',{_items:data.items,_name:data.name});
  if(error) throw new Error('Không gửi được đơn. Kiểm tra thông tin và trạng thái demo rồi thử lại.');
  return order;
});
export const saveDemo = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((input:unknown)=>demoSchema.parse(input)).handler(async ({data,context}) => {
  const {data:admin,error:roleError} = await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
  if(roleError || !admin) throw new Error('Chỉ Chí Quy có quyền quản trị.');
  const {error} = await context.supabase.from('demos').upsert(data);
  if(error) throw new Error('Không lưu được demo.');
  return {ok:true};
});
export const updateOrder = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((input:unknown)=>z.object({id:z.string().uuid(),status:orderStatusSchema}).parse(input)).handler(async ({data,context}) => {
  const {data:admin,error:roleError} = await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
  if(roleError || !admin) throw new Error('Chỉ Chí Quy có quyền quản trị.');
  const {error} = await context.supabase.from('demo_orders').update({status:data.status}).eq('id',data.id);
  if(error) throw new Error('Không cập nhật được đơn.');
  return {ok:true};
});