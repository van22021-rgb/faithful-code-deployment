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
    ],
  }),
  component: Index,
});

function Index() {
  return <SiteFrame />;
}
