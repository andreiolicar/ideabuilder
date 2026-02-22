function IconBase({ children }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {children}
    </svg>
  );
}

export function DashboardIcon() {
  return (
    <IconBase>
      <path d="M4 11.4L12 4L20 11.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 10.9V19H17.5V10.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 19V14.5H14V19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function FolderIcon() {
  return (
    <IconBase>
      <path d="M3.5 7.5C3.5 6.4 4.4 5.5 5.5 5.5H9.6L11.1 7H18.5C19.6 7 20.5 7.9 20.5 9V16.5C20.5 17.6 19.6 18.5 18.5 18.5H5.5C4.4 18.5 3.5 17.6 3.5 16.5V7.5Z" stroke="currentColor" strokeWidth="1.7" />
    </IconBase>
  );
}

export function AdminIcon() {
  return (
    <IconBase>
      <path d="M12 3L19 6.5V11.7C19 15.8 16.4 19.2 12 20.5C7.6 19.2 5 15.8 5 11.7V6.5L12 3Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9.5 12.5L11.2 14.2L14.8 10.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function UsersIcon() {
  return (
    <IconBase>
      <circle cx="9" cy="9" r="2.8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4.8 17.2C5.4 15.2 7 14 9 14C11 14 12.6 15.2 13.2 17.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="16.5" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M14.6 16.6C15 15.4 16 14.6 17.3 14.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </IconBase>
  );
}

export function LedgerIcon() {
  return (
    <IconBase>
      <rect x="4" y="4.5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 9H16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8 12.5H16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8 16H13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </IconBase>
  );
}

export function BackIcon() {
  return (
    <IconBase>
      <path d="M9 6L4 12L9 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12H4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </IconBase>
  );
}

export function LogoutIcon() {
  return (
    <IconBase>
      <path d="M10 4.5H6.5C5.4 4.5 4.5 5.4 4.5 6.5V17.5C4.5 18.6 5.4 19.5 6.5 19.5H10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M14 8L18 12L14 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 12H18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </IconBase>
  );
}

export function SettingsIcon() {
  return (
    <IconBase>
      <path
        d="M10.3 3.8H13.7L14.3 5.8C14.8 5.95 15.3 6.15 15.7 6.4L17.7 5.6L20.1 8L19.3 10C19.55 10.45 19.75 10.9 19.9 11.4L21.9 12V15.4L19.9 16C19.75 16.5 19.55 16.95 19.3 17.4L20.1 19.4L17.7 21.8L15.7 21C15.25 21.25 14.8 21.45 14.3 21.6L13.7 23.6H10.3L9.7 21.6C9.2 21.45 8.75 21.25 8.3 21L6.3 21.8L3.9 19.4L4.7 17.4C4.45 16.95 4.25 16.5 4.1 16L2.1 15.4V12L4.1 11.4C4.25 10.9 4.45 10.45 4.7 10L3.9 8L6.3 5.6L8.3 6.4C8.75 6.15 9.2 5.95 9.7 5.8L10.3 3.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13.7" r="2.6" stroke="currentColor" strokeWidth="1.7" />
    </IconBase>
  );
}

export function ProfileIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="8.5" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5.2 18.5C6 15.9 8.5 14.2 12 14.2C15.5 14.2 18 15.9 18.8 18.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </IconBase>
  );
}
