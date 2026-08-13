import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Renders a legal document (Terms of Service, Privacy Policy) from markdown
 * source held in `docs/`. Server component — the markdown is read at build
 * time by the page and passed in as a string, so the published page is
 * always generated from the same file the solicitor reviews.
 */
export function LegalDocument({ markdown }: { markdown: string }) {
  return (
    <article className="mx-auto w-full max-w-[760px] px-6 py-12">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-[1.75rem] font-bold leading-tight text-[#1E293B]">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-10 mb-3 text-[1.25rem] font-semibold text-[#1E293B]">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 mb-2 text-[1rem] font-semibold text-[#1E293B]">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-[#334155]">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mt-3 list-disc space-y-1.5 pl-6 text-[0.9375rem] leading-relaxed text-[#334155]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-3 list-decimal space-y-1.5 pl-6 text-[0.9375rem] leading-relaxed text-[#334155]">
              {children}
            </ol>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              {...(href?.startsWith('http')
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="font-medium text-[#0D6E6E] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 rounded"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[#1E293B]">{children}</strong>
          ),
          em: ({ children }) => <em className="text-[#64748B] not-italic">{children}</em>,
          hr: () => <hr className="my-8 border-[#EDE8E1]" />,
          table: ({ children }) => (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-[0.875rem]">{children}</table>
            </div>
          ),
          // GFM requires a header row, so headerless tables in the source
          // (e.g. the company details table) arrive with empty <th> cells —
          // hide that row rather than render a blank stripe
          thead: ({ children }) => (
            <thead className="bg-[#FDF9F5] [&:has(th:empty)]:hidden">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-[#EDE8E1] px-3 py-2 text-left font-semibold text-[#1E293B]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[#EDE8E1] px-3 py-2 align-top text-[#334155]">
              {children}
            </td>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  )
}
