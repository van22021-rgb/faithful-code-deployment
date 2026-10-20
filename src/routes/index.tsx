import { createFileRoute } from "@tanstack/react-router";
import { SiteFrame } from '@/components/site-frame';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CHÍ QUY® — Creative Department" },
      { name: "description", content: "CHÍ QUY® — Creative Department: website, video & trải nghiệm sự kiện tại Hà Nội." },
      { property: "og:title", content: "CHÍ QUY® — Creative Department" },
      { property: "og:description", content: "Creative department làm website, video và trải nghiệm sự kiện. Chọn demo, đặt mua và phát triển theo ý bạn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://id-preview--d1d6ed02-bf30-4658-ac51-59b8c45e9d86.lovable.app/chiquy-preview.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Logo CHÍ QUY® — Creative Department" },
      { name: "twitter:image", content: "https://id-preview--d1d6ed02-bf30-4658-ac51-59b8c45e9d86.lovable.app/chiquy-preview.jpg" },
    ],
  }),
  component: Index,
});

function Index() {
  return <SiteFrame />;
}
