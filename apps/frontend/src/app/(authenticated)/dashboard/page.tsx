'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { createAuthenticatedApi } from '@/lib/api';
import { useMounted } from '@/hooks/useMounted';
import {
  FileText,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Send,
  UserPlus,
} from 'lucide-react';
import { UserRole, ContractStatus, AuditAction } from '@jurix/shared-types';
import { cn } from '@/lib/utils';

interface Contract {
  id: string;
  title: string;
  status: ContractStatus;
}

interface AuditLog {
  id: string;
  userId: string;
  user?: {
    name: string;
  };
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  createdAt: string;
}

interface ContractsResponse {
  success: boolean;
  data: Contract[];
  pagination: {
    total: number;
  };
}

interface AuditResponse {
  success: boolean;
  data: AuditLog[];
}

const actionIcons: Record<AuditAction, typeof Clock> = {
  [AuditAction.LOGIN]: LogIn,
  [AuditAction.LOGOUT]: LogOut,
  [AuditAction.CONTRACT_CREATED]: FileText,
  [AuditAction.CONTRACT_UPDATED]: Edit,
  [AuditAction.CONTRACT_DELETED]: Trash2,
  [AuditAction.CONTRACT_SUBMITTED]: Send,
  [AuditAction.CONTRACT_APPROVED]: CheckCircle,
  [AuditAction.CONTRACT_REJECTED]: XCircle,
  [AuditAction.USER_CREATED]: UserPlus,
  [AuditAction.USER_UPDATED]: Edit,
  [AuditAction.USER_DEACTIVATED]: Trash2,
};

const actionLabels: Record<AuditAction, string> = {
  [AuditAction.LOGIN]: 'fez login',
  [AuditAction.LOGOUT]: 'fez logout',
  [AuditAction.CONTRACT_CREATED]: 'criou um contrato',
  [AuditAction.CONTRACT_UPDATED]: 'atualizou um contrato',
  [AuditAction.CONTRACT_DELETED]: 'excluiu um contrato',
  [AuditAction.CONTRACT_SUBMITTED]: 'enviou contrato para revisão',
  [AuditAction.CONTRACT_APPROVED]: 'aprovou um contrato',
  [AuditAction.CONTRACT_REJECTED]: 'rejeitou um contrato',
  [AuditAction.USER_CREATED]: 'criou um usuário',
  [AuditAction.USER_UPDATED]: 'atualizou um usuário',
  [AuditAction.USER_DEACTIVATED]: 'desativou um usuário',
};

export default function DashboardPage() {
  const mounted = useMounted();
  const { user, accessToken } = useAuthStore();
  
  const [stats, setStats] = useState({
    total: 0,
    inReview: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mounted && accessToken) {
      fetchDashboardData();
    }
  }, [mounted, accessToken]);

  const fetchDashboardData = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const api = createAuthenticatedApi(() => accessToken);

      // Fetch all contracts to calculate stats
      const contractsRes = await api.get<ContractsResponse>('/contracts?limit=1000');
      const contracts = contractsRes.data;

      const stats = {
        total: contracts.length,
        inReview: contracts.filter(c => c.status === ContractStatus.IN_REVIEW).length,
        approved: contracts.filter(c => c.status === ContractStatus.APPROVED).length,
        rejected: contracts.filter(c => c.status === ContractStatus.REJECTED).length,
      };
      setStats(stats);

      // Fetch recent activity (only for ADMIN and LEGAL)
      if (user?.role === UserRole.ADMIN || user?.role === UserRole.LEGAL) {
        try {
          const auditRes = await api.get<AuditResponse>('/audit?limit=10');
          setRecentActivity(auditRes.data);
        } catch {
          // User might not have access to audit
          setRecentActivity([]);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `há ${diffMins} min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays < 7) return `há ${diffDays}d`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Bem-vindo, {mounted ? user?.name : '...'}
        </h1>
        <p className="text-slate-400 mt-1">
          Aqui está o resumo da sua plataforma de contratos.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Contratos"
          value={loading ? '...' : String(stats.total)}
          icon={<FileText className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Em Revisão"
          value={loading ? '...' : String(stats.inReview)}
          icon={<Clock className="w-6 h-6" />}
          color="warning"
        />
        <StatCard
          title="Aprovados"
          value={loading ? '...' : String(stats.approved)}
          icon={<CheckCircle className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="Rejeitados"
          value={loading ? '...' : String(stats.rejected)}
          icon={<XCircle className="w-6 h-6" />}
          color="danger"
        />
      </div>

      {/* Quick Actions based on role */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h2>
        <div className="flex flex-wrap gap-3">
          {mounted && user?.role !== UserRole.VIEWER && (
            <Link href="/contracts/new" className="btn-primary">
              <FileText className="w-4 h-4" />
              Novo Contrato
            </Link>
          )}
          <Link href="/contracts" className="btn-secondary">
            <FileText className="w-4 h-4" />
            Ver Contratos
          </Link>
          {mounted && user?.role === UserRole.ADMIN && (
            <Link href="/users" className="btn-secondary">
              <Users className="w-4 h-4" />
              Gerenciar Usuários
            </Link>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Atividade Recente</h2>
          {mounted && (user?.role === UserRole.ADMIN || user?.role === UserRole.LEGAL) && (
            <Link href="/audit" className="text-sm text-primary-400 hover:text-primary-300">
              Ver todas
            </Link>
          )}
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Clock className="w-12 h-12 mb-4 opacity-50" />
            <p>Nenhuma atividade recente</p>
            <p className="text-sm">As ações serão exibidas aqui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity) => {
              const Icon = actionIcons[activity.action] || Clock;
              const label = actionLabels[activity.action] || activity.action;

              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-medium">{activity.user?.name || 'Usuário'}</span>
                      {' '}{label}
                    </p>
                    <p className="text-xs text-slate-500">{formatTimeAgo(activity.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'primary' | 'warning' | 'success' | 'danger';
}) {
  const colorClasses = {
    primary: 'bg-primary-600/10 text-primary-400',
    warning: 'bg-warning-500/10 text-warning-500',
    success: 'bg-success-500/10 text-success-500',
    danger: 'bg-danger-500/10 text-danger-500',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colorClasses[color])}>
          {icon}
        </div>
      </div>
      <p className="text-slate-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}
