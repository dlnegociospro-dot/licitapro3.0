import React, { useState, useCallback } from 'react';
import { Upload, FileText, Download, RotateCcw, Building2, MapPin, Calendar, ScrollText, PlayCircle, Clock } from 'lucide-react';
import { analyzeDocument, createChatSession } from './services/geminiService';
import { ExtractedData, AppState } from './types';
import InfoCard from './components/InfoCard';
import DocumentList from './components/DocumentList';
import ItemsTable from './components/ItemsTable';
import ChatWidget from './components/ChatWidget';
import { Chat } from '@google/genai';

// Declare jsPDF global for TypeScript since we use CDN
declare global {
  interface Window {
    jspdf: any;
  }
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [data, setData] = useState<ExtractedData | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError("Por favor, envie apenas arquivos PDF. (DOCX requer conversão prévia neste ambiente de demonstração)");
      return;
    }

    setAppState('analyzing');
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1];
        
        // Parallel execution: extract data and setup chat
        const [extractedData, chat] = await Promise.all([
          analyzeDocument(base64String, file.type),
          createChatSession(base64String, file.type)
        ]);

        setData(extractedData);
        setChatSession(chat);
        setAppState('dashboard');
      } catch (err: any) {
        console.error(err);
        setError("Erro ao analisar o arquivo. Certifique-se de que é um edital válido ou tente novamente.");
        setAppState('upload');
      }
    };
    reader.onerror = () => {
      setError("Erro ao ler o arquivo.");
      setAppState('upload');
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setAppState('upload');
    setData(null);
    setChatSession(null);
    setError(null);
  };

  const exportPDF = () => {
    if (!data || !window.jspdf) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add fonts or use default
    doc.setFont("helvetica");

    // Title
    doc.setFontSize(22);
    doc.setTextColor(0, 150, 150); // Cyan colorish
    doc.text("Relatório LICITAPRO 3.0", 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    // General Info
    let y = 35;
    const addLine = (label: string, value: string) => {
        doc.setFont(undefined, 'bold');
        doc.text(`${label}:`, 14, y);
        doc.setFont(undefined, 'normal');
        // Simple text wrapping handling for PDF
        const splitText = doc.splitTextToSize(value, 150);
        doc.text(splitText, 50, y);
        y += (6 * splitText.length) + 4;
    };

    addLine("Órgão", data.orgaoResponsavel);
    addLine("Local", data.local);
    addLine("Modalidade", data.modalidade);
    addLine("Abertura", data.dataAbertura);
    addLine("Início Disputa", data.inicioSessaoDisputa);

    // Items Table using autoTable
    if ((doc as any).autoTable) {
        (doc as any).autoTable({
            startY: y + 10,
            head: [['Item', 'Descrição', 'Qtd', 'Val. Unit.', 'Total']],
            body: data.itens.map(i => [
                i.item, 
                i.descricao, 
                i.quantidade, 
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(i.valorUnitario),
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(i.valorTotal)
            ]),
            theme: 'grid',
            headStyles: { fillColor: [6, 182, 212] }
        });
    }

    doc.save("licitapro-export.pdf");
  };

  return (
    <div className="min-h-screen bg-[#050b14] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050b14] to-black text-slate-200 font-sans selection:bg-cyber-cyan selection:text-black">
      
      {/* Background ambient effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyber-cyan/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
             <div className="relative">
               <div className="absolute inset-0 bg-cyber-cyan blur-md opacity-50"></div>
               <FileText className="relative text-cyber-cyan w-10 h-10" />
             </div>
             <div>
               <h1 className="text-3xl font-bold text-white tracking-tighter font-mono">
                 LICITAPRO <span className="text-cyber-cyan">3.0</span>
               </h1>
               <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">Inteligência em Licitações</p>
             </div>
          </div>
          
          {appState === 'dashboard' && (
            <button 
              onClick={handleReset}
              className="group flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyber-cyan/50 rounded-full transition-all duration-300"
            >
              <RotateCcw size={16} className="text-cyber-cyan group-hover:-rotate-180 transition-transform duration-500" />
              <span className="font-semibold text-sm">Nova Análise</span>
            </button>
          )}
        </header>

        {/* VIEW: Upload */}
        {appState === 'upload' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
                  Carregue seu Edital
                </h2>
                <p className="text-slate-400 text-lg">
                  Nossa IA extrai automaticamente datas, documentos e itens do seu arquivo PDF.
                </p>
              </div>

              <label className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-700 rounded-3xl cursor-pointer bg-slate-900/30 hover:bg-slate-800/50 hover:border-cyber-cyan/50 transition-all duration-300 group overflow-hidden">
                <div className="absolute inset-0 bg-cyber-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                  <div className="w-20 h-20 mb-4 rounded-full bg-slate-800 flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300">
                     <Upload className="w-10 h-10 text-cyber-cyan" />
                  </div>
                  <p className="mb-2 text-xl font-medium text-white">Clique para enviar</p>
                  <p className="text-sm text-slate-500">ou arraste o arquivo PDF aqui</p>
                </div>
                <input type="file" className="hidden" accept=".pdf" onChange={handleFileSelect} />
              </label>

              {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-center">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: Analyzing */}
        {appState === 'analyzing' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 rounded-full border-t-2 border-cyber-cyan animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-spin animation-delay-150"></div>
              <div className="absolute inset-4 rounded-full border-b-2 border-white animate-spin animation-delay-300"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <BotIcon className="w-10 h-10 text-cyber-cyan animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">Analisando Documento...</h2>
            <p className="text-slate-400">Extraindo dados e estruturando informações com IA</p>
          </div>
        )}

        {/* VIEW: Dashboard */}
        {appState === 'dashboard' && data && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard label="Órgão Responsável" value={data.orgaoResponsavel} icon={<Building2 size={18}/>} />
              <InfoCard label="Local" value={data.local} icon={<MapPin size={18}/>} />
              <InfoCard label="Modalidade" value={data.modalidade} icon={<ScrollText size={18}/>} />
              <InfoCard label="Sessão de Disputa" value={data.inicioSessaoDisputa} icon={<PlayCircle size={18}/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
               <InfoCard label="Início Recebimento" value={data.dataInicioRecebimento} icon={<Calendar size={18}/>} />
               <InfoCard label="Fim Recebimento" value={data.dataFimRecebimento} icon={<Clock size={18}/>} />
               <InfoCard label="Abertura Propostas" value={data.dataAbertura} icon={<Calendar size={18}/>} />
            </div>

            {/* Document Lists Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DocumentList title="Habilitação Jurídica" documents={data.habilitacaoJuridica} />
              <DocumentList title="Habilitação Fiscal/Social" documents={data.habilitacaoFiscalSocialTrabalhista} />
              <DocumentList title="Habilitação Econômica" documents={data.habilitacaoEconomicoFinanceira} />
            </div>

            {/* Items Table */}
            <ItemsTable items={data.itens} />

            {/* Actions */}
            <div className="flex justify-end pt-4">
              <button 
                onClick={exportPDF}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] font-bold transition-all transform hover:-translate-y-1"
              >
                <Download size={20} />
                Exportar Relatório PDF
              </button>
            </div>

            {/* Chat Widget */}
            <ChatWidget chatSession={chatSession} />
          </div>
        )}
      </div>
    </div>
  );
};

// Helper icon
const BotIcon = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
);

export default App;