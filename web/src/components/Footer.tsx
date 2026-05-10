import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-edge bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="relative inline-flex items-center justify-center w-6 h-6 rounded-full bg-ink text-paper">
              <span className="font-display italic text-[16px] leading-none -translate-y-[1px]">m</span>
            </span>
            <span className="text-[13px] font-medium tracking-tight">
              got milk <span className="font-display text-[15px] not-italic">mob</span>
              <span className="text-mood">?</span>
            </span>
          </div>
          <p className="text-[12.5px] text-whisper text-pretty max-w-[28ch]">
            A campaign that knows what it&apos;s looking at. Built on TwelveLabs
            for brand-partnership marketing teams.
          </p>
        </div>

        <FooterCol title="The Product">
          <FooterLink href="/upload">Drop a clip</FooterLink>
          <FooterLink href="/me">My Mob</FooterLink>
          <FooterLink href="/mobs">Explore mobs</FooterLink>
          <FooterLink href="/search">Search the campaign</FooterLink>
        </FooterCol>

        <FooterCol title="Behind the Build">
          <FooterLink href="/architecture">Architecture</FooterLink>
          <FooterLink href="/impact">Impact</FooterLink>
          <FooterLink href="/whats-next">What&apos;s next</FooterLink>
          <FooterLink href="/operator/review">Operator console</FooterLink>
        </FooterCol>

        <FooterCol title="Powered by">
          <li className="text-[12.5px] text-whisper">
            <span className="text-ink">Marengo 3.0</span> — multimodal retrieval & embeddings
          </li>
          <li className="text-[12.5px] text-whisper">
            <span className="text-ink">Pegasus 1.5</span> — video-language reasoning
          </li>
          <li className="text-[12.5px] text-whisper">
            On <span className="text-ink">AWS Bedrock</span> with cross-region inference
          </li>
        </FooterCol>
      </div>
      <div className="border-t border-edge">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11.5px] text-whisper-2">
            © 2026 — a demonstration application.
          </p>
          <p className="text-[11.5px] text-whisper-2">
            Tribute to the original <em className="font-display">got milk?</em> campaign, 1993.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] uppercase tracking-[0.14em] text-whisper-2 mb-3">{title}</h4>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-[12.5px] text-ink hover:text-mood transition-colors">
        {children}
      </Link>
    </li>
  );
}
