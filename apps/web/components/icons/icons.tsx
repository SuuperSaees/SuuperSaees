interface IconProps {
  className?: string;
}

export function CheckboxRoundedFilled({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" fill="#155EEF" />
      <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" stroke="#155EEF" />
      <rect x="6" y="6" width="8" height="8" rx="4" fill="white" />
    </svg>
  );
}

export function CheckboxRounded({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" fill="#F9FAFB" />
      <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" stroke="#E4E7EC" />
      <rect x="6" y="6" width="8" height="8" rx="4" fill="#E4E7EC" />
    </svg>
  );
}
