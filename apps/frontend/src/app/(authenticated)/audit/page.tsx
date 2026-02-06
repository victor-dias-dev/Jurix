'use client';

import { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  ChevronDown,
  LogIn,
  LogOut,
  FileText,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Send,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { createAuthenticatedApi } from '@/lib/api';
import { AuditAction, EntityType } from '@jurix/shared-types';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/useMounted';

interface AuditLog {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  action: AuditAction;
  entityType: EntityType;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface AuditResponse {
  success: boolean;
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const actionConfig: Record<AuditAction, { label: string; icon: typeof History; className: string }> = {
  [AuditAction.LOGIN]: {
    label: 'Login',
    icon: LogIn,
    className: 'bg-success-500/10 text-success-400',
  },
  [AuditAction.LOGOUT]: {
    label: 'Logout',
    icon: LogOut,
    className: 'bg-slate-500/10 text-slate-400',
  },
  [AuditAction.CONTRACT_CREATED]: {
    label: 'Contrato Criado',
    icon: FileText,
    className: 'bg-primary-500/10 text-primary-400',
  },
  [AuditAction.CONTRACT_UPDATED]: {
    label: 'Contrato Atualizado',
    icon: Edit,
    className: 'bg-warning-500/10 text-warning-400',
  },
  [AuditAction.CONTRACT_DELETED]: {
    label: 'Contrato Excluído',
    icon: Trash2,
    className: 'bg-danger-500/10 text-danger-400',
  },
  [AuditAction.CONTRACT_SUBMITTED]: {
    label: 'Contrato Enviado',
    icon: Send,
    className: 'bg-primary-500/10 text-primary-400',
  },
  [AuditAction.CONTRACT_APPROVED]: {
    label: 'Contrato Aprovado',
    icon: CheckCircle,
    className: 'bg-success-500/10 text-success-400',
  },
  [AuditAction.CONTRACT_REJECTED]: {
    label: 'Contrato Rejeitado',
    icon: XCircle,
    className: 'bg-danger-500/10 text-danger-400',
  },
  [AuditAction.USER_CREATED]: {
    label: 'Usuário Criado',
    icon: UserPlus,
    className: 'bg-primary-500/10 text-primary-400',
  },
  [AuditAction.USER_UPDATED]: {
    label: 'Usuário Atualizado',
    icon: Edit,
    className: 'bg-warning-500/10 text-warning-400',
  },
  [AuditAction.USER_DEACTIVATED]: {
    label: 'Usuário Desativado',
    icon: Trash2,
    className: 'bg-danger-500/10 text-danger-400',
  },
};

const entityTypeLabels: Record<EntityType, string> = {
  [EntityType.USER]: 'Usuário',
  [EntityType.CONTRACT]: 'Contrato',
  [EntityType.CONTRACT_VERSION]: 'Versão do Contrato',
  [EntityType.SESSION]: 'Sessão',
};

export default function AuditPage() {
  const mounted = useMounted();
  const { accessToken } = useAuthStore();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<AuditAction | ''>('');
  const [entityFilter, setEntityFilter] = useState<EntityType | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (mounted && accessToken) {
      fetchLogs();
    }
  }, [page, actionFilter, entityFilter, mounted, accessToken]);

  const fetchLogs = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const api = createAuthenticatedApi(() => accessToken);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (actionFilter) params.set('action', actionFilter);
      if (entityFilter) params.set('entityType', entityFilter);

      const response = await api.get<AuditResponse>(`/audit?${params.toString()}`);
      setLogs(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Auditoria</h1>
        <p className="text-slate-400 mt-1">
          Histórico de todas as ações realizadas na plataforma
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value as AuditAction | '');
                setPage(1);
              }}
              className="input pl-10 pr-10 w-full appearance-none cursor-pointer"
            >
              <option value="">Todas as ações</option>
              {Object.entries(actionConfig).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value as EntityType | '');
                setPage(1);
              }}
              className="input pl-10 pr-10 w-full appearance-none cursor-pointer"
            >
              <option value="">Todas as entidades</option>
              {Object.entries(entityTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-400 mt-4">Carregando logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <History className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Nenhum registro encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {logs.map((log) => {
              const action = actionConfig[log.action];
              const ActionIcon = action.icon;

              return (
                <div
                  key={log.id}
                  className="px-6 py-4 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        action.className
                      )}
                    >
                      <ActionIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-white font-medium">
                            {log.user?.name || 'Usuário desconhecido'}
                            <span className="text-slate-400 font-normal">
                              {' '}realizou{' '}
                            </span>
                            <span className={cn('font-medium', action.className.replace('/10', ''))}>
                              {action.label}
                            </span>
                          </p>
                          <p className="text-sm text-slate-400 mt-0.5">
                            Entidade: {entityTypeLabels[log.entityType]}
                            {log.entityId && (
                              <span className="text-slate-500">
                                {' '}({log.entityId.substring(0, 8)}...)
                              </span>
                            )}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      {log.ipAddress && (
                        <p className="text-xs text-slate-500 mt-2">
                          IP: {log.ipAddress}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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

