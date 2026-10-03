type AccessibilityIconProps = {
  className?: string;
};

export function AccessibilityIcon({ className }: AccessibilityIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="4.5" r="2.25" />
      <path d="M3.5 9h17" />
      <path d="M12 9v6" />
      <path d="m7.5 21 4.5-6 4.5 6" />
    </svg>
  );
}
