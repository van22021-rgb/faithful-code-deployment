import { useEffect, useRef } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { listOrders, placeOrder, saveDemo, updateOrder } from '@/lib/commerce.functions';
import { authSchema, demoSchema, orderSchema, orderStatusSchema } from '@/lib/commerce-schema';

export function SiteFrame({admin=false}: {admin?:boolean}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const ordersFn=useServerFn(listOrders), placeFn=useServerFn(placeOrder), saveFn=useServerFn(saveDemo), updateFn=useServerFn(updateOrder);
  const queryClient=useQueryClient(); const navigate=useNavigate();
  useEffect(()=>{
    const bridge = {
      async load() {
        const {data:demos,error}=await supabase.from('demos').select('*').order('code');
        if(error) throw new Error('Không tải được quầy demo. Vui lòng thử lại.');
        const {data:{user}}=await supabase.auth.getUser();
        let isAdmin=false;
        if(user){const result=await supabase.rpc('has_role',{_user_id:user.id,_role:'admin'});isAdmin=result.data===true;}
        const orders=user?await ordersFn():[];
        return {demos,orders:orders.map(o=>({...o,at:Date.parse(o.created_at),due:Date.parse(o.due_at)})),session:user?.email??null,admin:isAdmin};
      },
      async auth(input: {email:string;password:string;signup:boolean}) {
        const values=authSchema.parse(input);
        const result=input.signup ? await supabase.auth.signUp({...values,options:{emailRedirectTo:window.location.origin}}) : await supabase.auth.signInWithPassword(values);
        if(result.error){
          const code=(result.error as {code?:string}).code;
          if(code==='weak_password') throw new Error('Mật khẩu quá phổ biến, dễ bị đoán. Hãy chọn mật khẩu khác mạnh hơn (kết hợp chữ, số, ký tự đặc biệt).');
          if(code==='user_already_exists'||code==='email_exists') throw new Error('Email này đã có tài khoản. Hãy chuyển sang Đăng nhập.');
          throw new Error(input.signup?'Không tạo được tài khoản. Email có thể đã được dùng hoặc mật khẩu chưa đủ an toàn.':'Email hoặc mật khẩu không đúng.');
        }
        if(!result.data.session) throw new Error('Hãy kiểm tra email để xác nhận tài khoản.');
        return true;
      },
      async logout(){await queryClient.cancelQueries();queryClient.clear();const {error}=await supabase.auth.signOut();if(error)throw new Error('Chưa đăng xuất được.');await navigate({to:'/',replace:true});},
      async place(input:unknown){const o=await placeFn({data:orderSchema.parse(input)});return {...o,at:Date.parse(o.created_at),due:Date.parse(o.due_at)};},
      async save(input:unknown){return saveFn({data:demoSchema.parse(input)});},
      async update(id:string,status:unknown){return updateFn({data:{id,status:orderStatusSchema.parse(status)}});},
      manage(){return navigate({to:'/quan-tri'});},
    };
    const target=window as unknown as {chiquyCloud?:typeof bridge}; target.chiquyCloud=bridge;
    ref.current?.contentWindow?.dispatchEvent(new Event('cq-cloud-ready'));
    return ()=>{delete target.chiquyCloud;};
  },[ordersFn,placeFn,saveFn,updateFn,queryClient,navigate]);
  return <iframe ref={ref} src={admin?'/site.html#/admin':'/site.html'} title={admin?'CHÍ QUY® — Quản lý demo':'CHÍ QUY® — Creative Department'} className="fixed inset-0 h-full w-full border-0" allow="autoplay; fullscreen; clipboard-write" />;
}