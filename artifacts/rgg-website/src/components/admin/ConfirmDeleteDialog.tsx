import { useEffect, useRef } from "react";

interface ConfirmDeleteDialogProps {
  title: string;
  isPending: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteDialog({
  title,
  isPending,
  error,
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const onCancelRef = useRef(onCancel);
  const isPendingRef = useRef(isPending);

  useEffect(() => {
    onCancelRef.current = onCancel;
    isPendingRef.current = isPending;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPendingRef.current) {
        event.preventDefault();
        onCancelRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-description"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030604]/85 px-6"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-lg border border-[#5B342F] bg-[#0B0B0B] p-8"
      >
        <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#9B6761]">
          Delete Publication
        </p>
        <h2
          id="confirm-delete-title"
          className="mt-5 font-serif text-3xl"
        >
          Are you sure?
        </h2>
        <p
          id="confirm-delete-description"
          className="mt-4 text-sm leading-7 text-[#718078]"
        >
          “{title}” will be permanently removed. Archive it instead if this
          record may be needed later.
        </p>
        {error && (
          <p role="alert" className="mt-5 text-sm text-[#D7968F]">
            {error}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="min-h-11 border border-[#405246] px-5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#B8B39F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A96B]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="min-h-11 border border-[#8C4A4A] bg-[#8C4A4A] px-5 text-[9px] font-bold uppercase tracking-[0.18em] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EDD99A] disabled:opacity-50"
          >
            {isPending ? "Deleting…" : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}