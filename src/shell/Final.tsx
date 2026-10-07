import { BRAND } from "../shared/theme";

export default function Final() {
  return (
    <footer className="bg-abyss border-t border-fog/8 mt-12">
      <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-mist/70">
        <span className="font-semibold tracking-[0.3em] text-mist">{BRAND.name}</span>
        <span className="font-display italic text-base text-mist">You never really wake up.</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
