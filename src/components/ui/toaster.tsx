import { toast } from "@/hooks/use-toast";

export const Toaster = () => {
  const toasts = []; // ou use algum contexto real se estiver pronto

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts && toasts.length > 0 ? (
        toasts.map((t, i) => (
          <div key={i} className="bg-gray-800 text-white p-3 rounded-lg shadow-md">
            {t.message}
          </div>
        ))
      ) : null}
    </div>
  );
};
