import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiErrorProps {
  persistent?: boolean;
  onRetry?: () => void;
}

export function AiError({ persistent = false, onRetry }: AiErrorProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-4"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]"
          aria-hidden="true"
        />
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-[#991B1B]">
            {persistent ? "Something went wrong" : "We couldn't complete that request"}
          </p>
          <p className="mt-1 text-[13px] text-[#991B1B]">
            {persistent
              ? "If this keeps happening, please try again later. Your work has been saved."
              : "This sometimes happens with AI requests. Please try again."}
          </p>
          {!persistent && onRetry && (
            <Button
              type="button"
              onClick={onRetry}
              variant="outline"
              className="mt-3 h-8 border-[#DC2626] px-4 text-[13px] font-semibold text-[#DC2626] hover:bg-[#FEF2F2]"
            >
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
