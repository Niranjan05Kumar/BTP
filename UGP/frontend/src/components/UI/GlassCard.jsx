const GlassCard = ({ children, className = "" }) => {
  return (
    <div className={`chart-card ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
