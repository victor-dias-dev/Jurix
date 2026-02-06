'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { ContractStatus } from '@jurix/shared-types';

// Registrar fonte para melhor aparência
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 'bold',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf',
      fontStyle: 'italic',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 11,
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 60,
    backgroundColor: '#FFFFFF',
  },
  // Header
  header: {
    marginBottom: 30,
    borderBottom: '2pt solid #1a365d',
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  // Status badge
  statusBadge: {
    alignSelf: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Meta info
  metaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: '1pt solid #e2e8f0',
  },
  metaBlock: {
    width: '48%',
  },
  metaLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 11,
    color: '#1e293b',
  },
  // Contract info
  contractInfo: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    border: '1pt solid #e2e8f0',
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  contractDescription: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 1.5,
  },
  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: '1pt solid #e2e8f0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Content
  content: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 1.8,
    textAlign: 'justify',
  },
  paragraph: {
    marginBottom: 12,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 60,
    right: 60,
    borderTop: '1pt solid #e2e8f0',
    paddingTop: 15,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  pageNumber: {
    fontSize: 9,
    color: '#64748b',
  },
  // Signatures section
  signaturesSection: {
    marginTop: 50,
    paddingTop: 20,
    borderTop: '1pt solid #e2e8f0',
  },
  signaturesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 30,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBlock: {
    width: '45%',
    alignItems: 'center',
  },
  signatureLine: {
    width: '100%',
    borderBottom: '1pt solid #1e293b',
    marginBottom: 8,
    height: 40,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
  },
  signatureInfo: {
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
  // Watermark for non-approved
  watermark: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    right: '10%',
    opacity: 0.08,
    transform: 'rotate(-30deg)',
  },
  watermarkText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  // Clauses
  clause: {
    marginBottom: 15,
  },
  clauseNumber: {
    fontWeight: 'bold',
    color: '#1a365d',
  },
  // Legal notice
  legalNotice: {
    marginTop: 30,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    border: '1pt solid #fcd34d',
  },
  legalNoticeText: {
    fontSize: 9,
    color: '#92400e',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

const statusColors: Record<ContractStatus, { bg: string; text: string; label: string }> = {
  [ContractStatus.DRAFT]: { bg: '#f1f5f9', text: '#475569', label: 'RASCUNHO' },
  [ContractStatus.IN_REVIEW]: { bg: '#fef3c7', text: '#92400e', label: 'EM REVISÃO' },
  [ContractStatus.APPROVED]: { bg: '#dcfce7', text: '#166534', label: 'APROVADO' },
  [ContractStatus.REJECTED]: { bg: '#fee2e2', text: '#991b1b', label: 'REJEITADO' },
};

interface ContractPDFProps {
  contract: {
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
  };
}

export function ContractPDF({ contract }: ContractPDFProps) {
  const statusInfo = statusColors[contract.status];
  const createdDate = new Date(contract.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Parse content into paragraphs
  const paragraphs = contract.content.split('\n').filter(p => p.trim());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark for non-approved contracts */}
        {contract.status !== ContractStatus.APPROVED && (
          <View style={styles.watermark}>
            <Text style={styles.watermarkText}>{statusInfo.label}</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Contrato</Text>
          <Text style={styles.headerSubtitle}>
            Documento Nº {contract.id.substring(0, 8).toUpperCase()} • Versão {contract.currentVersion}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.text }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Meta Information */}
        <View style={styles.metaSection}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Data de Criação</Text>
            <Text style={styles.metaValue}>{createdDate}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Responsável</Text>
            <Text style={styles.metaValue}>{contract.createdBy?.name || 'N/A'}</Text>
          </View>
        </View>

        {/* Contract Info */}
        <View style={styles.contractInfo}>
          <Text style={styles.contractTitle}>{contract.title}</Text>
          {contract.description && (
            <Text style={styles.contractDescription}>{contract.description}</Text>
          )}
        </View>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disposições Contratuais</Text>
          <View style={styles.content}>
            {paragraphs.map((paragraph, index) => (
              <View key={index} style={styles.clause}>
                <Text>
                  {paragraph.trim().match(/^(CLÁUSULA|ARTIGO|§|\d+[\.\)]])/i) && (
                    <Text style={styles.clauseNumber}>{paragraph.split(/[:.-]/)[0]}: </Text>
                  )}
                  {paragraph.trim().match(/^(CLÁUSULA|ARTIGO|§|\d+[\.\)]])/i)
                    ? paragraph.split(/[:.-]/).slice(1).join(': ').trim()
                    : paragraph.trim()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Legal Notice for non-approved */}
        {contract.status !== ContractStatus.APPROVED && (
          <View style={styles.legalNotice}>
            <Text style={styles.legalNoticeText}>
              Este documento está em fase de {statusInfo.label.toLowerCase()} e não possui validade jurídica até sua aprovação final.
            </Text>
          </View>
        )}

        {/* Signatures Section - Only for approved contracts */}
        {contract.status === ContractStatus.APPROVED && (
          <View style={styles.signaturesSection}>
            <Text style={styles.signaturesTitle}>Assinaturas</Text>
            <View style={styles.signaturesRow}>
              <View style={styles.signatureBlock}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>CONTRATANTE</Text>
                <Text style={styles.signatureInfo}>Nome completo e CPF/CNPJ</Text>
              </View>
              <View style={styles.signatureBlock}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>CONTRATADO</Text>
                <Text style={styles.signatureInfo}>Nome completo e CPF/CNPJ</Text>
              </View>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={styles.footerContent}>
            <Text style={styles.footerText}>
              Jurix - Sistema de Gestão de Contratos • Gerado em {currentDate}
            </Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}

