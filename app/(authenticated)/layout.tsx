// Authenticated layout — shared nav + footer built in Phase 1 (P1.1)
// Auth protection wired in Phase 3 (P3.4)
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Nav stub — replaced in P1.1 */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <span className="font-bold text-teal">Grant Pathway</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      {/* Footer stub — replaced in P1.1 */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-4 text-sm text-muted-foreground text-center">
          Your free grant writing companion for UK charities
        </div>
      </footer>
    </>
  );
}
