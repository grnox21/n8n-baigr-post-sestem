/** Minimal geometric line icons — no stock art, no brand marks. */
type IconProps = { className?: string };

const base = "h-4 w-4";

export function IconImage({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4.5 16.5 9 12l3 2.8 3.2-3.6L20 15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCarousel({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="8" y="4" width="8" height="16" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 8v8M20 8v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconVideo({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="5.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16.5 10 20.5 7.5v9L16.5 14" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function IconTalkingHead({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="10" r="4.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4.8 19.5c1-3 3.7-4.8 7.2-4.8s6.2 1.8 7.2 4.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconAuto({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3.5 13.4 9l5.6 1.4-5.6 1.4L12 17.3l-1.4-5.5L5 10.4 10.6 9 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPublish({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m5 12.5 4.2 4.3L19 6.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconRevise({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 20 4.7 16.2 15.5 5.4a1.8 1.8 0 0 1 2.5 0l0.6.6a1.8 1.8 0 0 1 0 2.5L7.8 19.3 4 20Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function IconDelete({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 7.5h14M9.5 7.5V5.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3V7.5M7 7.5 7.8 19a1.6 1.6 0 0 0 1.6 1.5h5.2A1.6 1.6 0 0 0 16.2 19l0.8-11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
