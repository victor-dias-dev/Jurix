'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, FileText, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { ContractStatus } from '@jurix/shared-types';
import { useMounted } from '@/hooks/useMounted';

// Dynamic import to avoid SSR issues
const BlobProvider = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.BlobProvider),
  { ssr: false }
);

interface ContractPreviewData {
  id?: string;
  title: string;
  description: string;
  content: string;
  status?: ContractStatus;
  currentVersion?: number;
  createdBy?: {
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface ContractPDFPreviewProps {
  data: ContractPreviewData;
  className?: string;
}

export function ContractPDFPreview({ data, className = '' }: ContractPDFPreviewProps) {
  const mounted = useMounted();
  const [ContractPDFComponent, setContractPDFComponent] = useState<React.ComponentType<{ contract: ContractPreviewData }> | null>(null);
  const [zoom, setZoom] = useState(100);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load the PDF component on client side
  useEffect(() => {
    if (mounted) {
      import('./ContractPDF').then((mod) => {
        setContractPDFComponent(() => mod.ContractPDF);
      });
    }
  }, [mounted]);

  // Memoize the contract data to prevent unnecessary re-renders
  const contractData = useMemo(() => ({
    id: data.id || 'preview-' + Date.now(),
    title: data.title || 'Título do Contrato',
    description: data.description || '',
    content: data.content || 'O conteúdo do contrato aparecerá aqui...',
    status: data.status || ContractStatus.DRAFT,
    currentVersion: data.currentVersion || 1,
    createdBy: data.createdBy || { name: 'Você' },
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  }), [data.id, data.title, data.description, data.content, data.status, data.currentVersion, data.createdBy, data.createdAt, data.updatedAt]);

  if (!mounted || !ContractPDFComponent) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-800/30 rounded-lg border border-slate-700/50 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-3" />
        <p className="text-slate-400 text-sm">Carregando preview...</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden ${className}`}>
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-400" />
          <span className="text-sm font-medium text-white">Preview do PDF</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Diminuir zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-400 w-12 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(150, zoom + 10))}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Aumentar zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-700 mx-1" />
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Atualizar preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Preview */}
      <div className="flex-1 overflow-auto p-4 bg-slate-900/50">
        <BlobProvider key={refreshKey} document={<ContractPDFComponent contract={contractData} />}>
          {({ url, loading, error }) => {
            if (loading) {
              return (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500 mb-2" />
                  <p className="text-slate-400 text-sm">Gerando preview...</p>
                </div>
              );
            }

            if (error) {
              return (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-danger-400">
                  <p className="text-sm">Erro ao gerar preview</p>
                  <p className="text-xs text-slate-500 mt-1">{error.message}</p>
                </div>
              );
            }

            if (!url) {
              return (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                  <FileText className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="text-slate-400 text-sm">Preencha os campos para ver o preview</p>
                </div>
              );
            }

            return (
              <div 
                className="flex justify-center"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              >
                <iframe
                  src={url}
                  className="w-[595px] h-[842px] bg-white rounded shadow-2xl"
                  title="Preview do Contrato"
                />
              </div>
            );
          }}
        </BlobProvider>
      </div>

      {/* Preview Footer */}
      <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-800/50">
        <p className="text-xs text-slate-500 text-center">
          O preview é atualizado automaticamente conforme você digita
        </p>
      </div>
    </div>
  );
}

