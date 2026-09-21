import { getEvidenceRecord, getEvidenceRecordFr } from "@/content/evidenceContent";
import { useLanguage } from "@/i18n/LanguageContext";

export function EvidenceNote({
  ids,
  title,
  noReliance = false,
}: {
  ids: string[];
  title?: string;
  noReliance?: boolean;
}) {
  const { language, text } = useLanguage();
  const defaultTitle = text("Evidence and review note", "Note sur les données probantes et l'examen");
  const displayTitle = title || defaultTitle;

  const getRecord = language === "fr" ? getEvidenceRecordFr : getEvidenceRecord;
  const records = ids.map(getRecord);

  const STATE_LABELS = {
    approved: text("Approved", "Approuvé"),
    "editorial-review": text("Editorial review", "Révision éditoriale"),
    "verification-required": text("Verification required", "Vérification requise"),
  } as const;

  return (
    <aside className="mt-8 border border-[#26382C] bg-[#07100A] p-6 text-xs font-light leading-6 text-[#718078]">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A98C50]">
        {displayTitle}
      </h3>
      {noReliance && (
        <p className="mt-3 text-[#B8B39F]">
          {text(
            "This material is for editorial and policy discussion only. It is not legal, medical, investment, procurement, or other professional advice and should not be relied on without current primary-source and local-context review.",
            "Ce contenu est destiné exclusivement aux discussions éditoriales et de politique publique. Il ne constitue ni un conseil juridique, médical, en investissement, en matière de passation de marchés ou autre conseil professionnel, et ne doit pas être utilisé sans examen des sources primaires à jour et du contexte local."
          )}
        </p>
      )}
      <ul className="mt-4 space-y-4">
        {records.map((record) => (
          <li key={record.id}>
            <p>
              <strong className="font-medium text-[#C8C5B3]">
                [{record.id}] {record.claim}
              </strong>{" "}
              — {record.source}
              {record.sourceUrl && (
                <>
                  {" "}
                  <a
                    href={record.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#C8A96B] underline decoration-[#C8A96B]/40 underline-offset-4 hover:text-[#EDD99A]"
                  >
                    {text("Review source", "Consulter la source")}
                  </a>
                </>
              )}
            </p>
            <p className="mt-1">
              {text("Source date:", "Date de la source :")} {record.sourceDate}; {text("accessed:", "date d'accès :")} {record.accessedDate}.
              {text(" Method:", " Méthode :")} {record.method}. {text("Caveat:", "Mise en garde :")} {record.caveat} {text("Owner:", "Responsable :")} {record.owner}.
              {text("Status:", "Statut :")} {STATE_LABELS[record.approvalState]}.
            </p>
          </li>
        ))}
      </ul>
    </aside>
  );
}