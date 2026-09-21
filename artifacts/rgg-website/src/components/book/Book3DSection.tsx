import { lazy, Suspense } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { HARDCOVER_EDITIONS } from "./bookTextureConfig";

const RGGBook3D = lazy(() => import("./RGGBook3D"));

function ViewerLoading() {
  const { language, text } = useLanguage();
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center border border-[#203528] bg-[#080D09] px-8 text-center sm:min-h-[520px] lg:min-h-[610px]">
      <img
        src={HARDCOVER_EDITIONS[language].front}
        alt={text("Cover of Reclaiming the Green Gold", "Couverture de Reconquérir l'Or Vert")}
        className="max-h-[330px] w-auto shadow-[0_28px_60px_rgba(0,0,0,0.5)]"
      />
      <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-[#A98C50]">
        {text("Loading 3D edition…", "Chargement de l'édition 3D…")}
      </p>
    </div>
  );
}

export default function Book3DSection() {
  const { text } = useLanguage();
  return (
    <section
      aria-labelledby="hardcover-edition-title"
      className="border-b border-[#1A2E20] bg-[#080D09]"
    >
      <div className="container mx-auto grid items-center gap-14 px-6 py-24 md:py-32 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <div className="lg:pr-4">
          <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
            {text("The Hardcover Edition", "L'édition reliée")}
          </p>
          <h2
            id="hardcover-edition-title"
            className="font-serif text-[clamp(2.8rem,5vw,5rem)] leading-[1.02] tracking-[-0.04em]"
          >
            {text("Explore the book", "Explorer l'ouvrage")}
            <span className="block italic text-[#EDD99A]">{text("in 360°.", "à 360°.")}</span>
          </h2>
          <p className="mt-7 max-w-md text-sm font-light leading-7 text-[#879289] md:text-base md:leading-8">
            {text(
              "Examine the front cover, printed spine and full back cover of the hardcover edition through an interactive studio view.",
              "Examinez la première de couverture, le dos imprimé et la quatrième de couverture complète de l'édition reliée grâce à une vue de studio interactive."
            )}
          </p>
          <p className="mt-8 text-[10px] uppercase tracking-[0.2em] text-[#A98C50]">
            {text("Front", "Devant")} <span className="px-2 text-[#405246]">·</span> {text("Spine", "Dos")}
            <span className="px-2 text-[#405246]">·</span> {text("Back", "Arrière")}
          </p>
        </div>

        <Suspense fallback={<ViewerLoading />}>
          <RGGBook3D />
        </Suspense>
      </div>
    </section>
  );
}