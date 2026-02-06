'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { createAuthenticatedApi } from '@/lib/api';
import { useMounted } from '@/hooks/useMounted';
import { ContractPDFPreview } from '@/components/pdf/ContractPDFPreview';
import { cn } from '@/lib/utils';

export default function NewContractPage() {
  const router = useRouter();
  const mounted = useMounted();
  const { accessToken, user } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  // Debounced preview data
  const previewData = useMemo(() => ({
    title,
    description,
    content,
    createdBy: mounted ? { name: user?.name || 'Você' } : { name: 'Você' },
  }), [title, description, content, mounted, user?.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken || !mounted) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const api = createAuthenticatedApi(() => accessToken);
      await api.post('/contracts', {
        title,
        description,
        content,
      });
      
      router.push('/contracts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar contrato');
    } finally {
      setLoading(false);
    }
  };

  // Template suggestions
  const applyTemplate = (template: string) => {
    switch (template) {
      case 'servicos':
        setTitle('Contrato de Prestação de Serviços');
        setDescription('Contrato para prestação de serviços profissionais entre as partes.');
        setContent(`CLÁUSULA PRIMEIRA - DO OBJETO
O presente contrato tem como objeto a prestação de serviços de [DESCREVER SERVIÇOS] pelo CONTRATADO ao CONTRATANTE, conforme especificações detalhadas neste instrumento.

CLÁUSULA SEGUNDA - DO PRAZO
O presente contrato terá vigência de [X] meses, iniciando-se em [DATA INÍCIO] e terminando em [DATA FIM], podendo ser prorrogado mediante acordo entre as partes.

CLÁUSULA TERCEIRA - DO VALOR E FORMA DE PAGAMENTO
Pelos serviços prestados, o CONTRATANTE pagará ao CONTRATADO o valor de R$ [VALOR], a ser pago da seguinte forma: [FORMA DE PAGAMENTO].

§1º Os pagamentos serão efetuados até o dia [X] de cada mês, mediante apresentação de nota fiscal.

§2º Em caso de atraso, incidirá multa de 2% (dois por cento) sobre o valor devido, acrescido de juros de mora de 1% (um por cento) ao mês.

CLÁUSULA QUARTA - DAS OBRIGAÇÕES DO CONTRATADO
Constituem obrigações do CONTRATADO:
a) Executar os serviços com zelo, diligência e honestidade;
b) Manter sigilo sobre informações confidenciais;
c) Cumprir os prazos estabelecidos;
d) Comunicar imediatamente qualquer impedimento na execução dos serviços.

CLÁUSULA QUINTA - DAS OBRIGAÇÕES DO CONTRATANTE
Constituem obrigações do CONTRATANTE:
a) Efetuar os pagamentos nas datas acordadas;
b) Fornecer as informações necessárias à execução dos serviços;
c) Facilitar o acesso do CONTRATADO aos locais de trabalho, quando necessário.

CLÁUSULA SEXTA - DA RESCISÃO
O presente contrato poderá ser rescindido:
a) Por acordo mútuo entre as partes;
b) Por descumprimento de qualquer cláusula contratual;
c) Por qualquer das partes, mediante aviso prévio de 30 (trinta) dias.

CLÁUSULA SÉTIMA - DO FORO
Fica eleito o foro da Comarca de [CIDADE/ESTADO] para dirimir quaisquer dúvidas oriundas do presente contrato.

E, por estarem assim justas e contratadas, as partes assinam o presente instrumento em duas vias de igual teor e forma.`);
        break;
      case 'confidencialidade':
        setTitle('Acordo de Confidencialidade (NDA)');
        setDescription('Acordo para proteção de informações confidenciais entre as partes.');
        setContent(`CLÁUSULA PRIMEIRA - DO OBJETO
O presente Acordo tem por objeto estabelecer as condições de confidencialidade que regerão o intercâmbio de informações entre as PARTES.

CLÁUSULA SEGUNDA - DEFINIÇÃO DE INFORMAÇÃO CONFIDENCIAL
Para os fins deste Acordo, considera-se "Informação Confidencial" toda e qualquer informação, seja ela técnica, comercial, jurídica, ou de qualquer outra natureza, divulgada por uma parte à outra, incluindo, mas não se limitando a:
a) Dados de clientes e fornecedores;
b) Estratégias comerciais e de marketing;
c) Informações financeiras e contábeis;
d) Propriedade intelectual e segredos industriais;
e) Projetos, estudos e pesquisas.

CLÁUSULA TERCEIRA - DAS OBRIGAÇÕES
A PARTE RECEPTORA compromete-se a:
a) Manter sigilo absoluto sobre todas as Informações Confidenciais;
b) Não divulgar as Informações Confidenciais a terceiros;
c) Utilizar as Informações Confidenciais exclusivamente para os fins previstos;
d) Proteger as Informações Confidenciais com o mesmo grau de cuidado que dispensa às suas próprias.

CLÁUSULA QUARTA - EXCEÇÕES
Não serão consideradas confidenciais as informações que:
a) Já eram de conhecimento público antes de sua divulgação;
b) Tornaram-se públicas sem culpa da PARTE RECEPTORA;
c) Foram legalmente obtidas de terceiros sem obrigação de confidencialidade;
d) Precisem ser divulgadas por força de lei ou decisão judicial.

CLÁUSULA QUINTA - DO PRAZO
Este Acordo terá vigência de [X] anos a partir da data de sua assinatura, permanecendo em vigor as obrigações de confidencialidade por prazo indeterminado após seu término.

CLÁUSULA SEXTA - DAS PENALIDADES
A violação deste Acordo sujeitará a parte infratora ao pagamento de indenização por perdas e danos, sem prejuízo das demais medidas judiciais cabíveis.

CLÁUSULA SÉTIMA - DO FORO
Fica eleito o foro da Comarca de [CIDADE/ESTADO] para dirimir quaisquer questões decorrentes deste Acordo.`);
        break;
      case 'locacao':
        setTitle('Contrato de Locação de Imóvel');
        setDescription('Contrato para locação de imóvel residencial ou comercial.');
        setContent(`CLÁUSULA PRIMEIRA - DO OBJETO
O LOCADOR dá em locação ao LOCATÁRIO o imóvel situado em [ENDEREÇO COMPLETO], de propriedade do primeiro, conforme matrícula nº [NÚMERO] do [X]º Cartório de Registro de Imóveis.

CLÁUSULA SEGUNDA - DA DESTINAÇÃO
O imóvel objeto deste contrato destina-se exclusivamente para fins [RESIDENCIAIS/COMERCIAIS], sendo vedada qualquer outra utilização sem prévia autorização do LOCADOR.

CLÁUSULA TERCEIRA - DO PRAZO
A presente locação é ajustada pelo prazo de [X] meses, iniciando-se em [DATA] e terminando em [DATA], independentemente de notificação judicial ou extrajudicial.

CLÁUSULA QUARTA - DO ALUGUEL
O valor do aluguel mensal é de R$ [VALOR] ([VALOR POR EXTENSO]), a ser pago até o dia [X] de cada mês.

§1º O aluguel será reajustado anualmente pelo índice [IGPM/IPCA], ou outro que vier a substituí-lo.

§2º O atraso no pagamento acarretará multa de 10% sobre o valor do aluguel, acrescido de juros de 1% ao mês.

CLÁUSULA QUINTA - DO DEPÓSITO CAUÇÃO
A título de garantia, o LOCATÁRIO depositou a quantia de R$ [VALOR], equivalente a [X] aluguéis, que será devolvida ao final da locação, desde que cumpridas todas as obrigações contratuais.

CLÁUSULA SEXTA - DAS OBRIGAÇÕES DO LOCATÁRIO
Obriga-se o LOCATÁRIO a:
a) Pagar pontualmente o aluguel e encargos;
b) Zelar pelo imóvel como se fosse seu;
c) Não sublocar sem autorização expressa do LOCADOR;
d) Devolver o imóvel nas mesmas condições em que o recebeu;
e) Permitir a vistoria do imóvel mediante agendamento prévio.

CLÁUSULA SÉTIMA - DAS OBRIGAÇÕES DO LOCADOR
Obriga-se o LOCADOR a:
a) Entregar o imóvel em condições de uso;
b) Garantir o uso pacífico do imóvel;
c) Responder pelos vícios ou defeitos anteriores à locação.

CLÁUSULA OITAVA - DA RESCISÃO
A rescisão antecipada por parte do LOCATÁRIO implicará no pagamento de multa equivalente a [X] aluguéis, proporcional ao tempo restante do contrato.

CLÁUSULA NONA - DO FORO
Fica eleito o foro da Comarca de [CIDADE/ESTADO] para dirimir quaisquer questões oriundas deste contrato.`);
        break;
    }
  };

  return (
    <div className="h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/contracts"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Novo Contrato</h1>
            <p className="text-slate-400 mt-1">
              Crie um novo contrato no sistema
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
            {/* Template Suggestions */}
            <div>
              <label className="label">Começar com um modelo</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyTemplate('servicos')}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Prestação de Serviços
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('confidencialidade')}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Confidencialidade (NDA)
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('locacao')}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Locação de Imóvel
                </button>
              </div>
            </div>

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
                className="input min-h-[300px] h-full resize-y font-mono text-sm"
                placeholder="Digite o conteúdo completo do contrato...

Dica: Use CLÁUSULA, ARTIGO ou §(parágrafo) para estruturar seu contrato. O PDF formatará automaticamente."
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 mt-4 pt-4 border-t border-slate-700/50">
            <Link href="/contracts" className="btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Criar Contrato
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
