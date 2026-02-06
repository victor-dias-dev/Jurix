'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Calendar,
  History,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { createAuthenticatedApi } from '@/lib/api';
import { ContractStatus, UserRole } from '@jurix/shared-types';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/useMounted';
import { ContractPDFDownload } from '@/components/pdf';

interface Contract {
  id: string;
  title: string;
  description: string;
  content: string;
  status: ContractStatus;
  currentVersion: number;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ContractVersion {
  id: string;
  contractId: string;
  version: number;
  content: string;
  changedById: string;
  changedBy?: {
    name: string;
  };
  changeReason: string | null;
  createdAt: string;
}

const statusConfig: Record<ContractStatus, { label: string; icon: typeof Clock; className: string }> = {
  [ContractStatus.DRAFT]: {
    label: 'Rascunho',
    icon: FileText,
    className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  },
  [ContractStatus.IN_REVIEW]: {
    label: 'Em Revisão',
    icon: Clock,
    className: 'bg-warning-500/10 text-warning-400 border-warning-500/20',
  },
  [ContractStatus.APPROVED]: {
    label: 'Aprovado',
    icon: CheckCircle,
    className: 'bg-success-500/10 text-success-400 border-success-500/20',
  },
  [ContractStatus.REJECTED]: {
    label: 'Rejeitado',
    icon: XCircle,
    className: 'bg-danger-500/10 text-danger-400 border-danger-500/20',
  },
};

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mounted = useMounted();
  const { accessToken, user } = useAuthStore();
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [versions, setVersions] = useState<ContractVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const contractId = params.id as string;

  const canEdit = mounted && (user?.role === UserRole.ADMIN || user?.role === UserRole.LEGAL);
  const canApprove = mounted && (user?.role === UserRole.ADMIN || user?.role === UserRole.LEGAL);

  useEffect(() => {
    if (mounted && accessToken) {
      fetchContract();
    }
  }, [contractId, mounted, accessToken]);

  const fetchContract = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const api = createAuthenticatedApi(() => accessToken);
      const response = await api.get<{ success: boolean; data: Contract }>(
        `/contracts/${contractId}`
      );
      setContract(response.data);
    } catch (error) {
      console.error('Erro ao buscar contrato:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    if (!accessToken) return;

    try {
      const api = createAuthenticatedApi(() => accessToken);
      const response = await api.get<{ success: boolean; data: ContractVersion[] }>(
        `/contracts/${contractId}/versions`
      );
      setVersions(response.data);
      setShowVersions(true);
    } catch (error) {
      console.error('Erro ao buscar versões:', error);
    }
  };

  const handleAction = async (action: 'submit' | 'approve' | 'reject' | 'return-to-draft') => {
    if (!accessToken || !contract) return;

    setActionLoading(true);
    try {
      const api = createAuthenticatedApi(() => accessToken);
      
      if (action === 'reject') {
        await api.post(`/contracts/${contractId}/reject`, { reason: rejectReason });
        setShowRejectModal(false);
        setRejectReason('');
      } else {
        await api.post(`/contracts/${contractId}/${action}`, {});
      }
      
      fetchContract();
    } catch (error) {
      console.error('Erro na ação:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Contrato não encontrado</p>
        <Link href="/contracts" className="btn-primary mt-4 inline-flex">
          Voltar para lista
        </Link>
      </div>
    );
  }

  const status = statusConfig[contract.status];
  const StatusIcon = status.icon;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/contracts"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{contract.title}</h1>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                  status.className
                )}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {status.label}
              </span>
            </div>
            {contract.description && (
              <p className="text-slate-400">{contract.description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* PDF Export */}
          <ContractPDFDownload contract={contract} />

          {canEdit && contract.status === ContractStatus.DRAFT && (
            <>
              <Link
                href={`/contracts/${contract.id}/edit`}
                className="btn-secondary"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Link>
              <button
                onClick={() => handleAction('submit')}
                disabled={actionLoading}
                className="btn-primary"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Enviar para Revisão
              </button>
            </>
          )}
          
          {canApprove && contract.status === ContractStatus.IN_REVIEW && (
            <>
              <button
                onClick={() => handleAction('approve')}
                disabled={actionLoading}
                className="btn-primary bg-success-600 hover:bg-success-500"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Aprovar
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="btn-danger"
              >
                <XCircle className="w-4 h-4" />
                Rejeitar
              </button>
            </>
          )}

          {canEdit && contract.status === ContractStatus.REJECTED && (
            <button
              onClick={() => handleAction('return-to-draft')}
              disabled={actionLoading}
              className="btn-secondary"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Edit className="w-4 h-4" />
              )}
              Retornar para Rascunho
            </button>
          )}
        </div>
      </div>

      {/* Meta info */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Criado por</p>
              <p className="text-sm text-white">{contract.createdBy?.name || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Criado em</p>
              <p className="text-sm text-white">
                {new Date(contract.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
              <History className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Versão</p>
              <p className="text-sm text-white">v{contract.currentVersion}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Atualizado em</p>
              <p className="text-sm text-white">
                {new Date(contract.updatedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Conteúdo do Contrato</h2>
          <button
            onClick={fetchVersions}
            className="text-sm text-primary-400 hover:text-primary-300"
          >
            Ver histórico de versões
          </button>
        </div>
        <div className="prose prose-invert max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-slate-300 bg-slate-800/50 p-4 rounded-lg">
            {contract.content}
          </pre>
        </div>
      </div>

      {/* Versions Modal */}
      {showVersions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Histórico de Versões</h2>
              <button
                onClick={() => setShowVersions(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 space-y-3">
              {versions.length === 0 ? (
                <p className="text-slate-400 text-center py-4">Nenhuma versão encontrada</p>
              ) : (
                versions.map((version) => (
                  <div
                    key={version.id}
                    className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">Versão {version.version}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(version.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Por: {version.changedBy?.name || 'N/A'}
                    </p>
                    {version.changeReason && (
                      <p className="text-sm text-slate-500 mt-1">
                        Motivo: {version.changeReason}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Rejeitar Contrato</h2>
            <div className="mb-4">
              <label className="label">Motivo da Rejeição *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="input min-h-[100px]"
                placeholder="Descreva o motivo da rejeição..."
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={!rejectReason.trim() || actionLoading}
                className="btn-danger"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Confirmar Rejeição'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

