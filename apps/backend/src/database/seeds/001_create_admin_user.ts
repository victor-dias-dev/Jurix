import type { Knex } from 'knex';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
  await knex.raw('TRUNCATE TABLE audit_logs, contract_versions, contracts, users RESTART IDENTITY CASCADE');

  const salt = await bcrypt.genSalt(10);

  await knex('users').insert([
    {
      id: uuidv4(),
      email: 'admin@jurix.com',
      password_hash: await bcrypt.hash('Admin@123', salt),
      name: 'Administrador',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    {
      id: uuidv4(),
      email: 'legal@jurix.com',
      password_hash: await bcrypt.hash('Legal@123', salt),
      name: 'Advogado Legal',
      role: 'LEGAL',
      status: 'ACTIVE',
    },
    {
      id: uuidv4(),
      email: 'viewer@jurix.com',
      password_hash: await bcrypt.hash('Viewer@123', salt),
      name: 'Visualizador',
      role: 'VIEWER',
      status: 'ACTIVE',
    },
  ]);
}

