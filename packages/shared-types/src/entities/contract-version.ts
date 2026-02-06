import { ContractStatus } from '../enums/index.js';

/**
 * Versão de Contrato
 * Snapshot imutável de um contrato em determinado momento
 * Criada sempre que conteúdo ou status é alterado
 */
export interface ContractVersion {
  id: string;
  contractId: string;
  version: number;
  title: string;
  content: string;
  status: ContractStatus;
  changedById: string;
  changeReason: string | null;
  createdAt: Date;
}

/**
 * Versão com informações do responsável pela mudança
 */
export interface ContractVersionWithAuthor extends ContractVersion {
  changedBy: {
    id: string;
    name: string;
    email: string;
  };
}

