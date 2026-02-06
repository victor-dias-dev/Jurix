import Link from 'next/link';
import { Scale, Shield, FileCheck, History } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-950/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Jurix</span>
          </div>
          <Link
            href="/login"
            className="btn-primary"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Gestão de Contratos
              <span className="block text-primary-400">Jurídicos Corporativos</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 text-balance">
              Plataforma segura para gerenciamento de contratos legais com controle de acesso,
              workflow de aprovação e auditoria completa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="btn-primary text-lg px-8 py-3">
                Acessar Plataforma
              </Link>
              <a href="#features" className="btn-secondary text-lg px-8 py-3">
                Conheça os Recursos
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 border-t border-slate-800/50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-white text-center mb-16">
              Recursos da Plataforma
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<Shield className="w-8 h-8" />}
                title="Controle de Acesso"
                description="Perfis ADMIN, LEGAL e VIEWER com permissões específicas baseadas em RBAC."
                delay="0"
              />
              <FeatureCard
                icon={<FileCheck className="w-8 h-8" />}
                title="Workflow de Aprovação"
                description="Fluxo formal de revisão e aprovação de contratos com rastreabilidade."
                delay="100"
              />
              <FeatureCard
                icon={<History className="w-8 h-8" />}
                title="Versionamento"
                description="Histórico completo de versões com snapshots imutáveis de cada alteração."
                delay="200"
              />
              <FeatureCard
                icon={<Scale className="w-8 h-8" />}
                title="Auditoria"
                description="Logs imutáveis de todas as ações para compliance e rastreabilidade."
                delay="300"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Jurix. Plataforma de Contratos Jurídicos.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <div
      className="card group hover:border-primary-500/30 transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-14 h-14 rounded-xl bg-primary-600/10 flex items-center justify-center text-primary-400 mb-4 group-hover:bg-primary-600/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

