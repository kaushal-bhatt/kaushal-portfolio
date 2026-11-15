/**
 * A section opener: the running head, a rule, and the title.
 *
 * Every heading in the `Site` and `AboutContent` rows is stored in two halves —
 * `heading` and `headingAccent` — because the accent half used to carry the
 * gradient. The split is kept and given a new job: the second half is set in
 * italic. So "About" + "Me" becomes About *Me*, and nothing in the database or
 * the admin forms has to change.
 */
export function SectionHead({
  number,
  label,
  heading,
  accent,
  lead,
  id,
}: {
  number: string;
  label: string;
  heading?: string;
  accent?: string;
  lead?: string;
  id?: string;
}) {
  return (
    <>
      <div className="ed-grid">
        <div className="flex items-baseline justify-between pb-4">
          <span className="ed-label ed-label-ink">
            <span style={{ color: 'var(--signal-ink)' }}>§ {number}</span>
            <span className="mx-3" aria-hidden="true">—</span>
            {label}
          </span>
        </div>
      </div>
      <hr className="ed-rule ed-wipe" />

      {(heading || accent) && (
        <div className="ed-grid pt-[clamp(2.5rem,5vw,4.5rem)]">
          <h2 id={id} className="ed-display col-1-9 ed-rise">
            {heading}
            {heading && accent && ' '}
            {accent && <em className="ed-italic">{accent}</em>}
          </h2>
          {lead && <p className="ed-lead col-4-12 ed-rise mt-8 text-[var(--ink-60)]">{lead}</p>}
        </div>
      )}
    </>
  );
}
