import type { Knex } from 'knex';
import * as bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Limpar tabela (cuidado em produção!)
  await knex('audit_logs').del();
  await knex('contract_versions').del();
  await knex('contracts').del();
  await knex('users').del();

  // Criar hash da senha
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Admin@123', salt);

  // Inserir usuários iniciais
  await knex('users').insert([
    {
      id: knex.raw('uuid_generate_v4()'),
      email: 'admin@jurix.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      email: 'legal@jurix.com',
      password: await bcrypt.hash('Legal@123', salt),
      name: 'Advogado Legal',
      role: 'LEGAL',
      status: 'ACTIVE',
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      email: 'viewer@jurix.com',
      password: await bcrypt.hash('Viewer@123', salt),
      name: 'Visualizador',
      role: 'VIEWER',
      status: 'ACTIVE',
    },
  ]);
}

