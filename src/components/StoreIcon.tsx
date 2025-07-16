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
          <path d="M2.5 18.5h19v-1.5h-19v1.5zm0-3h19v-1.5h-19v1.5zm0-3h19v-1.5h-19v1.5zm0-3h19v-1.5h-19v1.5zm0-3h19v-1.5h-19v1.5z"/>
          <path d="M12 3l10.39 6.5v2L12 18 1.61 11.5v-2L12 3zm0 2.48L4.81 10 12 14.52 19.19 10 12 5.48z"/>
        </svg>
      );
    case 'gog':
      return (
        <svg className={`${className} text-foreground`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l-2 2 2 2 2-2-2-2zm-6 4l-2 2 2 2 2-2-2-2zm12 0l-2 2 2 2 2-2-2-2zm-6 4l-2 2 2 2 2-2-2-2zm-6 4l-2 2 2 2 2-2-2-2zm12 0l-2 2 2 2 2-2-2-2zm-6 4l-2 2 2 2 2-2-2-2z"/>
        </svg>
      );
    case 'humble':
      return (
        <svg className={`${className} text-foreground`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3L3 7.5v1l9 4.5 9-4.5v-1L12 3zm0 2.2l6.5 3.3L12 11.8 5.5 8.5 12 5.2z"/>
          <path d="M3 12.5l9 4.5 9-4.5v1l-9 4.5-9-4.5v-1z"/>
          <path d="M3 16.5l9 4.5 9-4.5v1l-9 4.5-9-4.5v-1z"/>
        </svg>
      );
    case 'fanatical':
      return (
        <svg className={`${className} text-foreground`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.5 7.5h8l-6.5 4.5 2.5 7.5L12 17l-6.5 4.5 2.5-7.5L1.5 9.5h8L12 2z"/>
          <path d="M12 6.5L10.5 11h-3l2.5 1.5-1 3L12 13l2.5 2.5-1-3 2.5-1.5h-3L12 6.5z"/>
        </svg>
      );
    default:
      return null;
  }
};