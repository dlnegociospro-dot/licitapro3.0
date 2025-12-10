import React from 'react';

interface InfoCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ label, value, icon }) => {
  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-700/50 hover:border-cyber-cyan/30 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{label}</h3>
        {icon && <div className="text-cyber-cyan opacity-70 group-hover:opacity-100 transition-opacity">{icon}</div>}
      </div>
      <p className="text-white font-medium text-lg leading-tight break-words font-sans">
        {value || '---'}
      </p>
    </div>
  );
};

export default InfoCard;