import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ItemLicitacao } from '../types';

interface ItemsTableProps {
  items: ItemLicitacao[];
}

const ITEMS_PER_PAGE = 5;

const ItemsTable: React.FC<ItemsTableProps> = ({ items }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil((items?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = items?.slice(startIndex, startIndex + ITEMS_PER_PAGE) || [];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  return (
    <div className="glass-panel rounded-2xl border border-slate-700/50 overflow-hidden flex flex-col">
      <div className="p-4 bg-slate-800/50 border-b border-slate-700">
        <h3 className="text-xl font-bold text-cyber-neon font-mono uppercase">Tabela de Itens</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/50 text-xs uppercase text-slate-400 font-semibold">
            <tr>
              <th className="px-4 py-3 w-16 text-center">Item</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3 w-1/3">Especificação</th>
              <th className="px-4 py-3 text-center">Qtd</th>
              <th className="px-4 py-3 text-right">Val. Unit.</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {currentItems.length > 0 ? (
              currentItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-center font-mono text-cyber-cyan">{item.item}</td>
                  <td className="px-4 py-3 font-medium text-white">{item.descricao}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 leading-relaxed">{item.especificacao}</td>
                  <td className="px-4 py-3 text-center">{item.quantidade}</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-400">{formatCurrency(item.valorUnitario)}</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-400">{formatCurrency(item.valorTotal)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Nenhum item encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 flex items-center justify-between border-t border-slate-700 bg-slate-800/30">
          <span className="text-sm text-slate-400">
            Página <span className="text-white font-bold">{currentPage}</span> de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsTable;