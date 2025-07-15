interface StoreIconProps {
  store: 'steam' | 'epic' | 'gog' | 'humble' | 'fanatical';
  className?: string;
}

export const StoreIcon = ({ store, className = "w-4 h-4" }: StoreIconProps) => {
  switch (store) {
    case 'steam':
      return (
        <svg className={`${className} text-[#1b2838]`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.979 0C5.678 0 0.511 4.86 0.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.624 0 11.979-5.354 11.979-11.979C23.958 5.354 18.603.021 11.979 0z"/>
          <path d="M7.54 18.21c.397.767 1.208 1.282 2.128 1.282.397 0 .771-.1 1.097-.277l-1.235-.51c-.583.24-1.259-.057-1.499-.639-.24-.583.058-1.259.639-1.499l1.235.51c-.057-.397-.24-.771-.492-1.058-.771-.879-2.108-.958-2.986-.187-.879.771-.958 2.108-.187 2.986l.3.392z"/>
          <path d="M15.955 9.066c1.665 0 3.015-1.35 3.015-3.015s-1.35-3.015-3.015-3.015-3.015 1.35-3.015 3.015 1.35 3.015 3.015 3.015zm-2.265-3.015c0-1.251 1.014-2.265 2.265-2.265s2.265 1.014 2.265 2.265-1.014 2.265-2.265 2.265-2.265-1.014-2.265-2.265z"/>
        </svg>
      );
    case 'epic':
      return (
        <svg className={`${className} text-foreground`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M5.5 3h13v18h-13V3zm2 2v14h9V5h-9zm1 1h7v1h-7V6zm0 2h7v1h-7V8zm0 2h5v1h-5v-1z"/>
          <path d="M9 13h3v1H9v-1zm0 2h2v1H9v-1z"/>
        </svg>
      );
    case 'gog':
      return (
        <svg className={`${className} text-foreground`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          <path d="M8 8h8v8H8V8zm2 2v4h4v-4h-4z"/>
        </svg>
      );
    case 'humble':
      return (
        <svg className={`${className} text-foreground`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      );
    case 'fanatical':
      return (
        <svg className={`${className} text-foreground`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      );
    default:
      return null;
  }
};