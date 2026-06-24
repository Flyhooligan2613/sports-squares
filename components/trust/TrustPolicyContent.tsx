import type { PolicyDocument } from "@/lib/trust/types";

interface TrustPolicyContentProps {
  document: PolicyDocument;
}

export default function TrustPolicyContent({ document }: TrustPolicyContentProps) {
  return (
    <article className="trust-policy-content">
      {document.sections.map((section) => (
        <section key={section.heading} className="trust-policy-section">
          <h2 className="trust-policy-h2">{section.heading}</h2>
          <div className="trust-policy-section-body">
            {section.subsections.map((subsection, index) => (
              <div key={`${section.heading}-${index}`} className="trust-policy-subsection">
                {subsection.heading ? (
                  <h3 className="trust-policy-h3">{subsection.heading}</h3>
                ) : null}
                {subsection.paragraphs?.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className="trust-policy-p">
                    {paragraph}
                  </p>
                ))}
                {subsection.bullets && subsection.bullets.length > 0 ? (
                  <ul className="trust-policy-list">
                    {subsection.bullets.map((item) => (
                      <li key={item.slice(0, 48)}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {subsection.numbered && subsection.numbered.length > 0 ? (
                  <ol className="trust-policy-list trust-policy-list-ordered">
                    {subsection.numbered.map((item) => (
                      <li key={item.slice(0, 48)}>{item}</li>
                    ))}
                  </ol>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ))}
      {document.footerNote ? (
        <div className="trust-policy-footer-note">{document.footerNote}</div>
      ) : null}
    </article>
  );
}
