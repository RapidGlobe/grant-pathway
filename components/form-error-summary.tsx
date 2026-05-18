import { AlertCircle } from "lucide-react";

interface FormErrorSummaryProps {
  errors: { field: string; fieldId: string; message: string }[];
}

export function FormErrorSummary({ errors }: FormErrorSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <div
      role="alert"
      aria-labelledby="form-error-heading"
      className="mb-6 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-4"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]"
          aria-hidden="true"
        />
        <div>
          <p
            id="form-error-heading"
            className="text-[14px] font-semibold text-[#991B1B]"
          >
            There {errors.length === 1 ? "is" : "are"} {errors.length}{" "}
            {errors.length === 1 ? "error" : "errors"} in this form
          </p>
          <ul className="mt-2 space-y-1">
            {errors.map(({ field, fieldId, message }) => (
              <li key={fieldId} className="text-[13px] text-[#991B1B]">
                <a
                  href={`#${fieldId}`}
                  className="underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
                >
                  {field}
                </a>
                {" — "}
                {message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
