'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { createAuthenticatedApi } from '@/lib/api';
import { ContractStatus } from '@jurix/shared-types';
import { useMounted } from '@/hooks/useMounted';
import { ContractPDFPreview } from '@/components/pdf/ContractPDFPreview';
import { cn } from '@/lib/utils';

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

export default function EditContractPage() {
  const params = useParams();
  const router = useRouter();
  const mounted = useMounted();
  const { accessToken } = useAuthStore();
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const contractId = params.id as string;

  // Preview data
  const previewData = useMemo(() => ({
    id: contract?.id,
    title,
    description,
    content,
    status: contract?.status,
    currentVersion: (contract?.currentVersion || 0) + 1,
    createdBy: contract?.createdBy,
    createdAt: contract?.createdAt,
    updatedAt: new Date().toISOString(),
  }), [title, description, content, contract]);

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
      const data = response.data;
      setContract(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setContent(data.content);
    } catch (error) {
      console.error('Erro ao buscar contrato:', error);
      setError('Contrato não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken || !mounted) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const api = createAuthenticatedApi(() => accessToken);
      await api.put(`/contracts/${contractId}`, {
        title,
        description,
        content,
        changeReason: changeReason || undefined,
      });
      
      router.push(`/contracts/${contractId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar contrato');
    } finally {
      setSaving(false);
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
        <p className="text-slate-400">{error || 'Contrato não encontrado'}</p>
        <Link href="/contracts" className="btn-primary mt-4 inline-flex">
          Voltar para lista
        </Link>
      </div>
    );
  }

  // Check if contract can be edited
  if (contract.status !== ContractStatus.DRAFT && contract.status !== ContractStatus.REJECTED) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Este contrato não pode ser editado no status atual.</p>
        <Link href={`/contracts/${contractId}`} className="btn-primary mt-4 inline-flex">
          Ver contrato
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/contracts/${contractId}`}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Editar Contrato</h1>
            <p className="text-slate-400 mt-1">
              Versão atual: v{contract.currentVersion} → Nova versão: v{contract.currentVersion + 1}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={cn(
            'btn-ghost',
            showPreview ? 'text-primary-400' : 'text-slate-400'
          )}
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPreview ? 'Ocultar Preview' : 'Mostrar Preview'}
        </button>
      </div>

      {/* Main Content */}
      <div className={cn(
        'grid gap-6 h-[calc(100%-80px)]',
        showPreview ? 'lg:grid-cols-2' : 'grid-cols-1 max-w-4xl'
      )}>
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400">
              {error}
            </div>
          )}

          <div className="card flex-1 overflow-y-auto space-y-5">
            <div>
              <label htmlFor="title" className="label">
                Título do Contrato *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="Ex: Contrato de Prestação de Serviços"
                required
                maxLength={255}
              />
            </div>

            <div>
              <label htmlFor="description" className="label">
                Descrição
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input min-h-[80px] resize-y"
                placeholder="Breve descrição do contrato..."
                maxLength={1000}
              />
              <p className="text-xs text-slate-500 mt-1">
                {description.length}/1000 caracteres
              </p>
            </div>

            <div className="flex-1">
              <label htmlFor="content" className="label">
                Conteúdo do Contrato *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input min-h-[250px] h-full resize-y font-mono text-sm"
                placeholder="Digite o conteúdo completo do contrato..."
                required
              />
            </div>

            <div>
              <label htmlFor="changeReason" className="label">
                Motivo da Alteração
              </label>
              <input
                id="changeReason"
                type="text"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="input"
                placeholder="Opcional: descreva o motivo da alteração para histórico"
                maxLength={500}
              />
              <p className="text-xs text-slate-500 mt-1">
                Este motivo será registrado no histórico de versões
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 mt-4 pt-4 border-t border-slate-700/50">
            <Link href={`/contracts/${contractId}`} className="btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving || !title.trim() || !content.trim()}
              className="btn-primary"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>

        {/* Preview */}
        {showPreview && (
          <ContractPDFPreview 
            data={previewData}
            className="h-full hidden lg:flex"
          />
        )}
      </div>
    </div>
  );
}
