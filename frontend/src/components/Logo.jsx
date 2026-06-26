export const Logo = ({ className = "", subtitle = true }) => {
  return (
    <div className={`flex items-center ${className}`} data-testid="brand-logo">
      <div className="flex items-center gap-0.5 font-display font-black text-2xl tracking-tighter leading-none">
        <span className="text-[#DC1C2E]">RE</span>
        <span className="text-[#003DA5]">/</span>
        <span className="text-[#003DA5]">MAX</span>
      </div>
      {subtitle && (
        <span className="ml-2 text-sm font-bold text-gray-500 tracking-normal border-l border-gray-300 pl-2">
          Active Broker
        </span>
      )}
    </div>
  );
};
