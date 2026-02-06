'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Download, Loader2, Eye } from 'lucide-react';
import { ContractStatus } from '@jurix/shared-types';

// Dynamic import to avoid SSR issues
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

const BlobProvider = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.BlobProvider),
  { ssr: false }
);

interface Contract {
  id: string;
  title: string;
  description: string;
  content: string;
  status: ContractStatus;
  currentVersion: number;
  createdBy?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ContractPDFDownloadProps {
  contract: Contract;
}

export function ContractPDFDownload({ contract }: ContractPDFDownloadProps) {
  const [isClient, setIsClient] = useState(false);
  const [ContractPDFComponent, setContractPDFComponent] = useState<React.ComponentType<{ contract: Contract }> | null>(null);

  // Load the PDF component on client side
  useState(() => {
    if (typeof window !== 'undefined') {
      import('./ContractPDF').then((mod) => {
        setContractPDFComponent(() => mod.ContractPDF);
        setIsClient(true);
      });
    }
  });

  const fileName = `contrato-${contract.title.toLowerCase().replace(/\s+/g, '-')}-v${contract.currentVersion}.pdf`;

  if (!isClient || !ContractPDFComponent) {
    return (
      <button disabled className="btn-secondary opacity-50">
        <Loader2 className="w-4 h-4 animate-spin" />
        Carregando...
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <PDFDownloadLink
        document={<ContractPDFComponent contract={contract} />}
        fileName={fileName}
        className="btn-secondary inline-flex items-center gap-2"
      >
        {({ loading }) =>
          loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Exportar PDF
            </>
          )
        }
      </PDFDownloadLink>

      <BlobProvider document={<ContractPDFComponent contract={contract} />}>
        {({ url, loading }) => (
          <a
            href={url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn-ghost inline-flex items-center gap-2 ${loading || !url ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            Visualizar
          </a>
        )}
      </BlobProvider>
    </div>
  );
}

