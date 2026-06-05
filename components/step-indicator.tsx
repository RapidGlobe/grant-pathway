import { Check } from 'lucide-react'

const STEPS = [
  'Application Details',
  'Uploaded Guidelines',
  'AI Summary',
  'Draft Answers',
  'Approve & Export',
]

interface StepIndicatorProps {
  currentStep: number // 1–5
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Application progress" className="mb-8">
      <ol className="flex items-start">
        {STEPS.map((label, i) => {
          const step = i + 1
          const isCurrent = step === currentStep
          const isComplete = step < currentStep

          return (
            <li
              key={step}
              className="flex shrink-0 flex-col items-center"
              style={{ width: `${100 / STEPS.length}%` }}
            >
              {/* Circle + connector row */}
              <div className="flex w-full items-center">
                {/* Left connector (all except first) */}
                {step > 1 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      isComplete || isCurrent ? 'bg-[#0D6E6E]' : 'bg-[#E2E8F0]'
                    }`}
                  />
                )}

                {/* Circle */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold ${
                    isCurrent
                      ? 'bg-[#0D6E6E] text-white'
                      : isComplete
                        ? 'bg-[#0D6E6E] text-white'
                        : 'border-2 border-[#E2E8F0] bg-white text-[#94A3B8]'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isComplete ? <Check className="h-4 w-4" aria-hidden="true" /> : step}
                  <span className="sr-only">
                    {isComplete ? 'Completed: ' : isCurrent ? 'Current: ' : ''}
                    {label}
                  </span>
                </div>

                {/* Right connector (all except last) */}
                {step < STEPS.length && (
                  <div className={`h-0.5 flex-1 ${isComplete ? 'bg-[#0D6E6E]' : 'bg-[#E2E8F0]'}`} />
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-2 w-full px-0.5 text-center text-[11px] leading-tight ${
                  isCurrent
                    ? 'font-semibold text-[#0D6E6E]'
                    : isComplete
                      ? 'font-medium text-[#0D6E6E]'
                      : 'text-[#94A3B8]'
                }`}
                aria-hidden="true"
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
