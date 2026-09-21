import { Link } from "wouter";

import {
  formatPublicationDate,
  getPublicationTypeLabel,
} from "@/lib/research";
import { useLanguage } from "@/i18n/LanguageContext";

import type { ResearchPublication } from "@/types/research";

interface ResearchCardProps {
  publication: ResearchPublication;
}

export default function ResearchCard({
  publication,
}: ResearchCardProps) {
  const { text, language } = useLanguage();

  return (
    <article
      className="
        group
        relative
        flex
        min-h-[360px]
        flex-col
        border-b
        border-r
        border-[#1A2E20]
        bg-[#0B0B0B]
        p-7
        transition-colors
        duration-300
        hover:bg-[#0D1510]
        md:p-8
      "
    >
      <div
        aria-hidden="true"
        className="
          absolute
          inset-x-0
          top-0
          h-px
          origin-left
          scale-x-0
          bg-[#C8A96B]
          transition-transform
          duration-500
          group-hover:scale-x-100
        "
      />

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-x-4
          gap-y-2
          text-[9px]
          uppercase
          tracking-[0.19em]
        "
      >
        <span className="text-[#A98C50]">
          {getPublicationTypeLabel(
            publication.publicationType,
            text
          )}
        </span>

        <span className="text-[#405246]">
          {formatPublicationDate(
            publication.publicationDate,
            language
          )}
        </span>

        {publication.readingTime && (
          <span className="text-[#405246]">
            {text(
              `${publication.readingTime} min read`,
              `${publication.readingTime} min de lecture`
            )}
          </span>
        )}
      </div>

      <div className="mt-10">
        {publication.category && (
          <p
            className="
              mb-4
              text-[9px]
              uppercase
              tracking-[0.2em]
              text-[#56685D]
            "
          >
            {publication.category}
          </p>
        )}

        <h2
          className="
            font-serif
            text-2xl
            leading-tight
            tracking-[-0.025em]
            text-[#F4F1EA]
            transition-colors
            group-hover:text-[#EDD99A]
            md:text-3xl
          "
        >
          {publication.title}
        </h2>

        {publication.subtitle && (
          <p
            className="
              mt-4
              text-sm
              font-light
              leading-6
              text-[#8A978E]
            "
          >
            {publication.subtitle}
          </p>
        )}

        <p
          className="
            mt-5
            line-clamp-4
            text-sm
            font-light
            leading-7
            text-[#65736B]
          "
        >
          {publication.abstract}
        </p>
      </div>

      <div className="mt-auto pt-9">
        <div
          className="
            mb-5
            flex
            flex-wrap
            gap-x-2
            text-[10px]
            text-[#56685D]
          "
        >
          {publication.authors.map(
            (author, index) => (
              <span key={`${author.name}-${index}`}>
                {author.name}
                {index <
                  publication.authors.length -
                    1 && ","}
              </span>
            ),
          )}
        </div>

        <Link
          href={`/research/${publication.slug}`}
          className="
            inline-flex
            items-center
            border-b
            border-[#405246]
            pb-1
            text-[9px]
            font-bold
            uppercase
            tracking-[0.2em]
            text-[#A98C50]
            transition-colors
            group-hover:border-[#C8A96B]
            group-hover:text-[#EDD99A]
          "
        >
          {text("Read Publication", "Lire la publication")}

          <span
            aria-hidden="true"
            className="ml-2"
          >
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
