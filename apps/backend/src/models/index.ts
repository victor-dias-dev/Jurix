export { User } from './user.model';
export { Contract } from './contract.model';
export { ContractVersion } from './contract-version.model';
export { AuditLog } from './audit-log.model';

export const models = [
  require('./user.model').User,
  require('./contract.model').Contract,
  require('./contract-version.model').ContractVersion,
  require('./audit-log.model').AuditLog,
];