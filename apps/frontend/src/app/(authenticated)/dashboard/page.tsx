'use client';

import { useAuthStore } from '@/store/auth.store';
import { FileText, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { UserRole } from '@jurix/shared-types';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Bem-vindo, {user?.name}
        </h1>
        <p className="text-slate-400 mt-1">
          Aqui está o resumo da sua plataforma de contratos.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Contratos"
          value="--"
          icon={<FileText className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Em Revisão"
          value="--"
          icon={<Clock className="w-6 h-6" />}
          color="warning"
        />
        <StatCard
          title="Aprovados"
          value="--"
          icon={<CheckCircle className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="Rejeitados"
          value="--"
          icon={<XCircle className="w-6 h-6" />}
          color="danger"
        />
      </div>

      {/* Quick Actions based on role */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h2>
        <div className="flex flex-wrap gap-3">
          {user?.role !== UserRole.VIEWER && (
            <a href="/contracts/new" className="btn-primary">
              <FileText className="w-4 h-4" />
              Novo Contrato
            </a>
          )}
          <a href="/contracts" className="btn-secondary">
            <FileText className="w-4 h-4" />
            Ver Contratos
          </a>
          {user?.role === UserRole.ADMIN && (
            <a href="/users" className="btn-secondary">
              <Users className="w-4 h-4" />
              Gerenciar Usuários
            </a>
          )}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Atividade Recente</h2>
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
          <p>Nenhuma atividade recente</p>
          <p className="text-sm">As ações serão exibidas aqui</p>
        </div>
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
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-slate-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

