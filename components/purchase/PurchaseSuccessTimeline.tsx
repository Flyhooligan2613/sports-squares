"use client";

type TimelineStep = "payment" | "squares" | "magic" | "open";

interface PurchaseSuccessTimelineProps {
  activeStep: TimelineStep;
}

const STEPS: { id: TimelineStep; label: string }[] = [
  { id: "payment", label: "Payment Complete" },
  { id: "squares", label: "Squares Reserved" },
  { id: "magic", label: "Magic Link Sent" },
  { id: "open", label: "Open My Games" },
];

const ORDER: TimelineStep[] = ["payment", "squares", "magic", "open"];

function stepIndex(step: TimelineStep): number {
  return ORDER.indexOf(step);
}

export default function PurchaseSuccessTimeline({
  activeStep,
}: PurchaseSuccessTimelineProps) {
  const activeIdx = stepIndex(activeStep);

  return (
    <div className="purchase-timeline">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-sb-muted mb-5 text-center">
        What happens next
      </h3>
      <ol className="purchase-timeline-list">
        {STEPS.map((step, index) => {
          const done = index <= activeIdx;
          const isLast = index === STEPS.length - 1;

          return (
            <li
              key={step.id}
              className="purchase-timeline-item admin-stat-enter"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="purchase-timeline-rail">
                <span
                  className={[
                    "purchase-timeline-dot",
                    done ? "purchase-timeline-dot-done" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {done ? "✓" : "·"}
                </span>
                {!isLast && (
                  <span
                    className={[
                      "purchase-timeline-connector",
                      index < activeIdx ? "purchase-timeline-connector-done" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                )}
              </div>
              <p
                className={[
                  "purchase-timeline-label",
                  done ? "text-white font-semibold" : "text-sb-muted",
                ].join(" ")}
              >
                {step.label}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
