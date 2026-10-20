import { createFileRoute } from "@tanstack/react-router";

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
  return (
    <iframe
      src="/site.html"
      title="CHÍ QUY® — Creative Department"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0 }}
      allow="autoplay; fullscreen; clipboard-write"
    />
  );
}
