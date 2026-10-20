import { createFileRoute } from '@tanstack/react-router';
export const Route=createFileRoute('/quan-tri')({
  head:()=>({meta:[{title:'CHÍ QUY® — Quản lý đơn và demo'},{name:'description',content:'Trang quản lý đơn đặt demo, thông tin khách hàng và quầy trưng bày của Chí Quy.'},{property:'og:title',content:'CHÍ QUY® — Quản lý đơn và demo'},{property:'og:description',content:'Quản lý đơn demo và sản phẩm mẫu của Chí Quy.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'},{name:'robots',content:'noindex,nofollow'}]}),
  component:()=>null, // management view lives in the root layout's persistent frame
});