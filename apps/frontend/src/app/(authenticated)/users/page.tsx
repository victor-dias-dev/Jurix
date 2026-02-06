'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Eye,
  Edit,
  UserX,
  UserCheck,
  MoreVertical,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { createAuthenticatedApi } from '@/lib/api';
import { UserRole, UserStatus } from '@jurix/shared-types';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/useMounted';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const roleConfig: Record<UserRole, { label: string; icon: typeof Shield; className: string }> = {
  [UserRole.ADMIN]: {
    label: 'Administrador',
    icon: ShieldCheck,
    className: 'bg-danger-500/10 text-danger-400 border-danger-500/20',
  },
  [UserRole.LEGAL]: {
    label: 'Jurídico',
    icon: Shield,
    className: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  },
  [UserRole.VIEWER]: {
    label: 'Visualizador',
    icon: Eye,
    className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  },
};

const statusConfig: Record<UserStatus, { label: string; className: string }> = {
  [UserStatus.ACTIVE]: {
    label: 'Ativo',
    className: 'bg-success-500/10 text-success-400',
  },
  [UserStatus.INACTIVE]: {
    label: 'Inativo',
    className: 'bg-slate-500/10 text-slate-500',
  },
};

export default function UsersPage() {
  const mounted = useMounted();
  const { accessToken, user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (mounted && accessToken) {
      fetchUsers();
    }
  }, [page, mounted, accessToken]);

  const fetchUsers = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const api = createAuthenticatedApi(() => accessToken);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (search) params.set('search', search);

      const response = await api.get<UsersResponse>(`/users?${params.toString()}`);
      setUsers(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const toggleUserStatus = async (userId: string, newStatus: UserStatus) => {
    if (!accessToken) return;

    try {
      const api = createAuthenticatedApi(() => accessToken);
      await api.put(`/users/${userId}`, { status: newStatus });
      fetchUsers();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
    setActionMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuários</h1>
          <p className="text-slate-400 mt-1">
            Gerencie os usuários da plataforma
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Usuário
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="input pl-10 w-full"
            />
          </div>
          <button type="submit" className="btn-secondary">
            Buscar
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-400 mt-4">Carregando usuários...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                    Usuário
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                    Papel
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                    Criado em
                  </th>
                  <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {users.map((user) => {
                  const role = roleConfig[user.role];
                  const status = statusConfig[user.status];
                  const RoleIcon = role.icon;
                  const isCurrentUser = mounted && user.id === currentUser?.id;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {user.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-primary-400">(você)</span>
                              )}
                            </p>
                            <p className="text-sm text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                            role.className
                          )}
                        >
                          <RoleIcon className="w-3.5 h-3.5" />
                          {role.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                            status.className
                          )}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-400 text-sm">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isCurrentUser && (
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setActionMenuId(actionMenuId === user.id ? null : user.id)
                              }
                              className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            {actionMenuId === user.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setActionMenuId(null)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-20 py-1">
                                  <button
                                    onClick={() =>
                                      toggleUserStatus(
                                        user.id,
                                        user.status === UserStatus.ACTIVE
                                          ? UserStatus.INACTIVE
                                          : UserStatus.ACTIVE
                                      )
                                    }
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2"
                                  >
                                    {user.status === UserStatus.ACTIVE ? (
                                      <>
                                        <UserX className="w-4 h-4 text-danger-400" />
                                        <span className="text-danger-400">Desativar</span>
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="w-4 h-4 text-success-400" />
                                        <span className="text-success-400">Ativar</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => setActionMenuId(null)}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2 text-slate-300"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
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

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Novo Usuário</h2>
            <p className="text-slate-400 mb-6">
              Funcionalidade em desenvolvimento...
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="btn-secondary w-full"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

