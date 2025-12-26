export function BugIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <rect x="18" y="18" width="20" height="24" rx="6" stroke="#D1D5DB" strokeWidth="2" />
          <line x1="28" y1="18" x2="28" y2="12" stroke="#D1D5DB" strokeWidth="2" />
          <line x1="18" y1="24" x2="12" y2="22" stroke="#D1D5DB" strokeWidth="2" />
          <line x1="18" y1="30" x2="12" y2="30" stroke="#D1D5DB" strokeWidth="2" />
          <line x1="18" y1="36" x2="12" y2="38" stroke="#D1D5DB" strokeWidth="2" />
          <line x1="38" y1="24" x2="44" y2="22" stroke="#D1D5DB" strokeWidth="2" />
          <line x1="38" y1="30" x2="44" y2="30" stroke="#D1D5DB" strokeWidth="2" />
          <line x1="38" y1="36" x2="44" y2="38" stroke="#D1D5DB" strokeWidth="2" />
          <circle cx="28" cy="30" r="3" fill="#DC2626" />
          <circle cx="42" cy="42" r="8" stroke="#DC2626" strokeWidth="2" />
          <line
            x1="48"
            y1="48"
            x2="56"
            y2="56"
            stroke="#DC2626"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
  );
}

