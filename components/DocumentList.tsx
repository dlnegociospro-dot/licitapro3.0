import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface DocumentListProps {
  title: string;
  documents: string[];
}

const DocumentList: React.FC<DocumentListProps> = ({ title, documents }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-700/50">
      <h3 className="text-xl font-bold text-cyber-neon mb-4 font-mono uppercase tracking-tight flex items-center gap-2">
        {title}
      </h3>
      <ul className="space-y-3">
        {documents && documents.length > 0 ? (
          documents.map((doc, idx) => (
            <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm md:text-base group">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="group-hover:text-white transition-colors">{doc}</span>
            </li>
          ))
        ) : (
          <li className="text-slate-500 italic">Nenhum documento listado nesta seção.</li>
        )}
      </ul>
    </div>
  );
};

export default DocumentList;