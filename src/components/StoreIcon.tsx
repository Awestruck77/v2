interface StoreIconProps {
  store: 'steam' | 'epic' | 'gog' | 'humble' | 'fanatical';
  className?: string;
}

export const StoreIcon = ({ store, className = "w-4 h-4" }: StoreIconProps) => {
  switch (store) {
    case 'steam':
      return (
        <svg className={`${className}`} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#171a21"/>
          <path d="M11.979 5.546c-3.172 0-5.754 2.443-5.985 5.552l3.364 1.388c.285-.194.63-.308 1-.308.033 0 .065.002.098.003l1.496-2.166v-.05c0-1.304 1.061-2.364 2.364-2.364 1.304 0 2.364 1.06 2.364 2.364s-1.06 2.365-2.364 2.365h-.055l-2.131 1.522c0 .027.002.055.002.083 0 .98-.794 1.775-1.772 1.775-.855 0-1.576-.613-1.741-1.425l-2.497-1.033c.744 2.622 3.392 4.545 6.257 4.545 3.462 0 6.267-2.805 6.267-6.267s-2.805-6.267-6.267-6.267z" fill="white"/>
          <path d="M7.54 15.21c.207.401.631.67 1.112.67.207 0 .403-.052.573-.145l-.646-.267c-.305.125-.658-.03-.784-.334-.125-.305.03-.658.334-.784l.646.267c-.03-.207-.125-.403-.257-.553-.403-.459-1.102-.501-1.559-.098-.459.403-.501 1.102-.098 1.559l.157.205z" fill="white"/>
        </svg>
      );
    case 'epic':
      return (
        <svg className={`${className}`} viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#313131"/>
          <path d="M7.5 7.5h9v1.5h-9v-1.5zm0 3h9v1.5h-9v-1.5zm0 3h6v1.5h-6v-1.5z" fill="white"/>
        </svg>
      );
    case 'gog':
      return (
        <svg className={`${className}`} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#86328A"/>
          <path d="M12 6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm2.5 8.5h-5v-5h5v5z" fill="white"/>
        </svg>
      );
    case 'humble':
      return (
        <svg className={`${className}`} viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#cc2929"/>
          <path d="M12 7l-3 3v4l3 3 3-3v-4l-3-3zm0 2.5l1.5 1.5v3l-1.5 1.5-1.5-1.5v-3l1.5-1.5z" fill="white"/>
        </svg>
      );
    case 'fanatical':
      return (
        <svg className={`${className}`} viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#15BFFF"/>
          <path d="M12 6l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-4z" fill="white"/>
        </svg>
      );
    default:
      return null;
  }
};