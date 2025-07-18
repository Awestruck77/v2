interface StoreIconProps {
  store: 'steam' | 'epic' | 'gog' | 'humble' | 'fanatical';
  className?: string;
}

export const StoreIcon = ({ store, className = "w-4 h-4" }: StoreIconProps) => {
  switch (store) {
    case 'steam':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#1b2838"/>
          <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm-1.5 14.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm5-5c-1.38 0-2.5-1.12-2.5-2.5S14.12 6.5 15.5 6.5 18 7.62 18 9s-1.12 2.5-2.5 2.5z" fill="white"/>
        </svg>
      );
    case 'epic':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#313131"/>
          <path d="M4 6h16v2H4V6zm0 4h16v2H4v-2zm0 4h12v2H4v-2z" fill="white"/>
        </svg>
      );
    case 'gog':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#86328A"/>
          <path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-2-9h4v2h-4V9zm0 3h4v2h-4v-2z" fill="white"/>
        </svg>
      );
    case 'humble':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#cc2929"/>
          <path d="M12 3l-8 8v8h16v-8l-8-8zm0 3.5L17.5 12v5h-11v-5L12 6.5z" fill="white"/>
        </svg>
      );
    case 'fanatical':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#15BFFF"/>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="white"/>
        </svg>
      );
    default:
      return null;
  }
};