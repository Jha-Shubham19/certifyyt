import { HeroSection } from "@/components/home/hero-section";

export default function Home() {
  return (
    <div className="container relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-4 sm:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-grid-slate-100 [mask-image:linear-gradient(to_bottom,white_30%,transparent_80%)] dark:bg-grid-slate-800"
      ></div>
      <HeroSection />
    </div>
  );
}
