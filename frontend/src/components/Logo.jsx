export const Logo = ({ className = "", subtitle = true, height = "h-9" }) => {
  return (
    <div className={`flex items-center ${className}`} data-testid="brand-logo">
      <img
        src="/remax-logo.png"
        alt="RE/MAX"
        className={`${height} w-auto object-contain`}
      />
      {subtitle && (
        <span className="ml-2 text-sm font-bold text-gray-500 tracking-normal border-l border-gray-300 pl-2 whitespace-nowrap">
          Active Broker
        </span>
      )}
    </div>
  );
};
