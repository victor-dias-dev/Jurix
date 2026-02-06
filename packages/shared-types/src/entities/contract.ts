import { ContractStatus } from '../enums/index.js';

/**
 * Entidade Contrato
 * Documento jurídico gerenciado pelo sistema
 */
export interface Contract {
  id: string;
  title: string;
  content: string;
  status: ContractStatus;
  createdById: string;
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Contrato com informações do criador
 */
export interface ContractWithCreator extends Contract {
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Dados para criação de contrato
 */
export interface CreateContractDTO {
  title: string;
  content: string;
}

/**
 * Dados para atualização de contrato
 */
export interface UpdateContractDTO {
  title?: string;
  content?: string;
}

/**
 * Dados para rejeição de contrato (exige justificativa)
 */
export interface RejectContractDTO {
  reason: string;
}

