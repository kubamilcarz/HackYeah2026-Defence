export type ProgressVariant = "neutral" | "success" | "warning" | "danger" | "info";

type ProgressProps = {
  className?: string;
  label: string;
  max?: number;
  value: number;
  valueLabel?: string;
  variant?: ProgressVariant;
};

type NormalizedProgress = {
  max: number;
  percentage: number;
  value: number;
};

function normalizeProgress(value: number, max: number): NormalizedProgress {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), safeMax) : 0;

  return {
    max: safeMax,
    percentage: (safeValue / safeMax) * 100,
    value: safeValue,
  };
}

function formattedValue(progress: NormalizedProgress, valueLabel?: string) {
  return valueLabel ?? `${Math.round(progress.percentage)}%`;
}

function progressProps(label: string, progress: NormalizedProgress, valueText: string) {
  return {
    "aria-label": label,
    "aria-valuemax": progress.max,
    "aria-valuemin": 0,
    "aria-valuenow": progress.value,
    "aria-valuetext": valueText,
    role: "progressbar" as const,
  };
}

export function LinearProgress({
  className,
  label,
  max = 100,
  value,
  valueLabel,
  variant = "neutral",
}: ProgressProps) {
  const progress = normalizeProgress(value, max);
  const displayValue = formattedValue(progress, valueLabel);

  return (
    <div className={`progress progress--linear progress--${variant}${className ? ` ${className}` : ""}`} {...progressProps(label, progress, displayValue)}>
      <div className="progress__meta">
        <span className="progress__label">{label}</span>
        <span className="progress__value">{displayValue}</span>
      </div>
      <div aria-hidden="true" className="progress__track">
        <span className="progress__fill" style={{ width: `${progress.percentage}%` }} />
      </div>
    </div>
  );
}

export function CircularProgress({
  className,
  label,
  max = 100,
  value,
  valueLabel,
  variant = "neutral",
}: ProgressProps) {
  const progress = normalizeProgress(value, max);
  const displayValue = formattedValue(progress, valueLabel);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress.percentage / 100);

  return (
    <div className={`progress progress--circular progress--${variant}${className ? ` ${className}` : ""}`} {...progressProps(label, progress, displayValue)}>
      <div aria-hidden="true" className="progress__circle">
        <svg className="progress__svg" viewBox="0 0 120 120">
          <circle className="progress__circle-track" cx="60" cy="60" r={radius} />
          <circle
            className="progress__circle-fill"
            cx="60"
            cy="60"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="progress__circle-value">{displayValue}</span>
      </div>
      <span className="progress__label">{label}</span>
    </div>
  );
}
