import { ContractStatus } from '../enums/index.js';

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

export interface ContractWithCreator extends Contract {
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateContractDTO {
  title: string;
  content: string;
}

export interface UpdateContractDTO {
  title?: string;
  content?: string;
}

export interface RejectContractDTO {
  reason: string;
}
