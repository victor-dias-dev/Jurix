import { ContractStatus } from '../enums/index.js';

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

export interface ContractVersionWithAuthor extends ContractVersion {
  changedBy: {
    id: string;
    name: string;
    email: string;
  };
}
