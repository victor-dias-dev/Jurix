'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { createAuthenticatedApi } from '@/lib/api';
import { ContractStatus, UserRole } from '@jurix/shared-types';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/useMounted';

interface Contract {
  id: string;
  title: string;
  description: string;
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

interface ContractsResponse {
  success: boolean;
  data: Contract[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

export default function ContractsPage() {
  const mounted = useMounted();
  const { accessToken, user } = useAuthStore();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const canCreate = mounted && (user?.role === UserRole.ADMIN || user?.role === UserRole.LEGAL);

  useEffect(() => {
    if (mounted && accessToken) {
      fetchContracts();
    }
  }, [page, statusFilter, mounted, accessToken]);

  const fetchContracts = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const api = createAuthenticatedApi(() => accessToken);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);

      const response = await api.get<ContractsResponse>(`/contracts?${params.toString()}`);
      setContracts(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchContracts();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Contratos</h1>
          <p className="text-slate-400 mt-1">
            Gerencie todos os contratos da plataforma
          </p>
        </div>
        {canCreate && (
          <Link
            href="/contracts/new"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Contrato
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar contratos..."
              className="input pl-10 w-full"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ContractStatus | '');
                setPage(1);
              }}
              className="input pl-10 pr-10 appearance-none cursor-pointer"
            >
              <option value="">Todos os status</option>
              {Object.entries(statusConfig).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
          <button type="submit" className="btn-secondary">
            Buscar
          </button>
        </form>
      </div>

      {/* Contracts List */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-400 mt-4">Carregando contratos...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Nenhum contrato encontrado</p>
            {canCreate && (
              <Link
                href="/contracts/new"
                className="btn-primary inline-flex items-center gap-2 mt-4"
              >
                <Plus className="w-5 h-5" />
                Criar primeiro contrato
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                    Título
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                    Versão
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                    Criado por
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                    Data
                  </th>
                  <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {contracts.map((contract) => {
                  const status = statusConfig[contract.status];
                  const StatusIcon = status.icon;

                  return (
                    <tr
                      key={contract.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">{contract.title}</p>
                          <p className="text-sm text-slate-400 line-clamp-1">
                            {contract.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                            status.className
                          )}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300">v{contract.currentVersion}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300">
                          {contract.createdBy?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-400 text-sm">
                          {new Date(contract.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/contracts/${contract.id}`}
                          className="inline-flex items-center gap-1.5 text-primary-400 hover:text-primary-300 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-sm text-slate-400">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

