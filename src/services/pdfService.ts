import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RegistroVeiculo, Secretaria, UsuarioAutenticado } from '../types';
import { getLocalDateString } from '../utils/dateUtils';

interface ExportarPdfOptions {
  registros: RegistroVeiculo[];
  secretariaFiltro?: 'TODAS' | Secretaria;
  dataFiltro?: string;
  usuario?: UsuarioAutenticado | null;
}

export const PdfService = {
  construirDocumentoRelatorio({
    registros,
    secretariaFiltro = 'TODAS',
    dataFiltro = '',
    usuario,
  }: ExportarPdfOptions): { doc: jsPDF; fileName: string } {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Cores Institucionais
    const primaryColor: [number, number, number] = [15, 23, 42]; // Slate 900
    const emeraldColor: [number, number, number] = [5, 150, 105]; // Emerald 600
    const matteBrownColor: [number, number, number] = [154, 115, 68]; // Marrom Claro Fosco (#9a7344)

    // Top Header Banner
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Accent line (Emerald & Matte Brown dual stripe for Agriculture & Tourism)
    doc.setFillColor(...emeraldColor);
    doc.rect(0, 28, pageWidth / 2, 2.5, 'F');
    doc.setFillColor(...matteBrownColor);
    doc.rect(pageWidth / 2, 28, pageWidth / 2, 2.5, 'F');

    // Title & Institutional Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('CONTROLE DE REGISTROS DE VEÍCULOS', 14, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text(
      'Secretaria da Agricultura  •  Secretaria do Turismo',
      14,
      17
    );

    // Right header info
    const agora = new Date();
    const dataHoraEmissao = agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    doc.setFontSize(8);
    doc.setTextColor(226, 232, 240);
    doc.text(`Emissão Oficial: ${dataHoraEmissao}`, pageWidth - 14, 11, { align: 'right' });
    doc.text(`Documento Administrativo Auditado`, pageWidth - 14, 17, { align: 'right' });

    // Metadata Cards below header - 3 colunas independentes para evitar qualquer sobreposição
    const cardY = 33;
    const cardHeight = 17;
    const cardWidth = 86; // 86 * 3 + 8 = 266mm (cabe perfeitamente em 269mm)

    // Card 1: Órgão e Período
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, cardY, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('ÓRGÃO / SECRETARIA:', 18, cardY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const secCurta = secretariaFiltro === 'TODAS' 
      ? 'Agricultura & Turismo' 
      : secretariaFiltro.replace('Secretaria da ', '').replace('Secretaria do ', '');
    doc.text(secCurta, 18, cardY + 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const dataTexto = dataFiltro ? new Date(dataFiltro + 'T00:00:00').toLocaleDateString('pt-BR') : 'Todos os Períodos';
    doc.text(`Data: ${dataTexto}`, 18, cardY + 14.5);

    // Card 2: Estatísticas da Frota
    const card2X = 14 + cardWidth + 4; // 104
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 2, 2, 'FD');

    const totalEmTransito = registros.filter(r => r.status === 'EM_TRANSITO').length;
    const totalFinalizados = registros.filter(r => r.status === 'FINALIZADO').length;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('CONTROLE DE VEÍCULOS:', card2X + 4, cardY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${registros.length} veículo(s) listado(s)`, card2X + 4, cardY + 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`${totalEmTransito} em trânsito  •  ${totalFinalizados} finalizado(s)`, card2X + 4, cardY + 14.5);

    // Card 3: Auditoria / Emissão
    const card3X = card2X + cardWidth + 4; // 194
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('OPERADOR RESPONSÁVEL:', card3X + 4, cardY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(usuario ? `${usuario.nome} (Operador)` : 'Operador de Plantão', card3X + 4, cardY + 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Matrícula: ${usuario?.matricula || 'OP-002'} (Operador de Cadastro)`, card3X + 4, cardY + 14.5);

    // Prepare table data
    const tableBody = registros.map((r, index) => {
      const dataFormatada = r.data ? new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR') : '-';
      const secSigla = r.secretaria === 'Secretaria da Agricultura' ? 'Agricultura' : 'Turismo';
      const veiculoPlaca = r.placa ? `${r.placa}${r.modeloVeiculo ? ` (${r.modeloVeiculo})` : ''}` : '-';
      const chegada = r.horarioChegada ? r.horarioChegada : 'Em trânsito';
      const respNome = r.funcionarioResponsavel || 'Não informado';

      return [
        (index + 1).toString(),
        dataFormatada,
        secSigla,
        r.fct,
        r.motorista,
        veiculoPlaca,
        r.horarioSaida || '-',
        chegada,
        r.andar ? `Andar ${r.andar}` : '-',
        respNome,
        'Assinado ✓'
      ];
    });

    if (tableBody.length === 0) {
      tableBody.push([
        '-',
        '-',
        '-',
        '-',
        'Nenhum registro de veículo no período selecionado',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-'
      ]);
    }

    // Generate Table sem colisão e com espaçamento impecável
    autoTable(doc, {
      startY: 53,
      head: [[
        'Nº',
        'Data',
        'Secretaria',
        'FCT',
        'Motorista',
        'Veículo / Placa',
        'Saída',
        'Chegada',
        'Andar',
        'Resp. Cadastro',
        'Assinatura'
      ]],
      body: tableBody,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: { top: 2.8, bottom: 2.8, left: 2, right: 2 },
        overflow: 'linebreak',
        valign: 'middle',
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        minCellHeight: 9,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'center', cellWidth: 26 },
        3: { halign: 'center', cellWidth: 24, fontStyle: 'bold' },
        4: { cellWidth: 42 },
        5: { cellWidth: 38 },
        6: { halign: 'center', cellWidth: 18 },
        7: { halign: 'center', cellWidth: 22 },
        8: { halign: 'center', cellWidth: 18 },
        9: { cellWidth: 33, fontStyle: 'bold' },
        10: { halign: 'center', cellWidth: 18, fontStyle: 'bold' },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        // Footer on every page
        const currentPage = data.pageNumber;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);

        // Thin top divider for footer
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

        // Left text: Title
        doc.text(
          'Controle de Registros Secretaria da Agricultura e Secretaria do Turismo',
          14,
          pageHeight - 6.5
        );

        // Right text: Desenvolvido por Siolly Technology + Page Number (aligned right to prevent font overlap)
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(
          `Desenvolvido por Siolly Technology   •   Página ${currentPage}`,
          pageWidth - 14,
          pageHeight - 6.5,
          { align: 'right' }
        );
      },
    });

    // Nome do arquivo inteligente
    const dataSlug = dataFiltro ? dataFiltro : 'completo';
    const secSlug = secretariaFiltro === 'TODAS' ? 'agricultura-turismo' : secretariaFiltro.toLowerCase().replace(/\s+/g, '-');
    const fileName = `Relatorio-Veiculos-${secSlug}-${dataSlug}.pdf`;

    return { doc, fileName };
  },

  gerarRelatorioDiario(options: ExportarPdfOptions): void {
    const { doc, fileName } = this.construirDocumentoRelatorio(options);
    doc.save(fileName);
  },

  obterRelatorioPdfBlob(options: ExportarPdfOptions): { blob: Blob; fileName: string } {
    const { doc, fileName } = this.construirDocumentoRelatorio(options);
    const blob = doc.output('blob');
    return { blob, fileName };
  },

  // Gera texto estruturado para envio por WhatsApp, E-mail ou Área de Transferência
  // NUNCA exibe ou inclui senhas criadas por operadores
  gerarTextoRelatorio({
    registros,
    secretariaFiltro = 'TODAS',
    dataFiltro = '',
    usuario,
  }: ExportarPdfOptions): string {
    const dataTexto = dataFiltro
      ? new Date(dataFiltro + 'T00:00:00').toLocaleDateString('pt-BR')
      : 'Todos os Dias Registrados';

    const secTexto = secretariaFiltro === 'TODAS'
      ? 'Secretaria da Agricultura & Secretaria do Turismo'
      : secretariaFiltro;

    const totalEmTransito = registros.filter(r => r.status === 'EM_TRANSITO').length;
    const totalFinalizados = registros.filter(r => r.status === 'FINALIZADO').length;

    let texto = `*CONTROLE DE REGISTROS DE VEÍCULOS*\n`;
    texto += `*${secTexto}*\n`;
    texto += `----------------------------------------\n`;
    texto += `📅 *Data:* ${dataTexto}\n`;
    texto += `🚗 *Total de Veículos:* ${registros.length} (${totalEmTransito} em trânsito | ${totalFinalizados} finalizados)\n`;
    if (usuario) {
      texto += `👤 *Operador Emissor:* ${usuario.nome} (Matrícula: ${usuario.matricula})\n`;
    }
    texto += `🕒 *Emissão:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n`;
    texto += `----------------------------------------\n\n`;

    if (registros.length === 0) {
      texto += `_Nenhum veículo registrado para o dia selecionado._\n\n`;
    } else {
      texto += `*RELAÇÃO DOS VEÍCULOS NO DIA SELECIONADO:*\n\n`;
      registros.forEach((r, idx) => {
        const secCurta = r.secretaria === 'Secretaria da Agricultura' ? 'Agricultura' : 'Turismo';
        const veiculo = r.placa ? `${r.placa}${r.modeloVeiculo ? ` (${r.modeloVeiculo})` : ''}` : 'Não informada';
        const chegada = r.horarioChegada ? r.horarioChegada : 'Em trânsito';
        const status = r.status === 'FINALIZADO' ? '✅ Finalizado' : '⏳ Em Trânsito';

        texto += `${idx + 1}. *FCT:* ${r.fct} | *${secCurta}*\n`;
        texto += `   • Motorista: ${r.motorista}\n`;
        texto += `   • Veículo: ${veiculo}\n`;
        texto += `   • Saída: ${r.horarioSaida || '-'} | Chegada: ${chegada} (${status})\n`;
        texto += `   • Andar: ${r.andar || '-'}\n`;
        if (r.ocorrencia) {
          texto += `   • ⚠️ *Ocorrência:* ${r.ocorrencia}\n`;
        }
        texto += `   • Operador Responsável: ${r.funcionarioResponsavel} (Matrícula: ${r.matriculaFuncionario || '-'})\n\n`;
      });
    }

    texto += `----------------------------------------\n`;
    texto += `Relatório Oficial de Tráfego e Controle de Frotas\n`;
    texto += `Desenvolvido por Siolly Technology\n`;
    texto += `*(Credenciais e senhas de operadores são estritamente confidenciais e protegidas)*`;

    return texto;
  },

  gerarFichaIndividual(registro: RegistroVeiculo, usuario?: UsuarioAutenticado | null): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Top Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 32, 'F');

    const isAgri = registro.secretaria === 'Secretaria da Agricultura';
    doc.setFillColor(isAgri ? 5 : 217, isAgri ? 150 : 119, isAgri ? 105 : 6);
    doc.rect(0, 32, pageWidth, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('COMPROVANTE DE REGISTRO VEICULAR', 14, 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text(registro.secretaria.toUpperCase(), 14, 20);
    const fctTextPdf = isAgri && registro.fct && registro.fct !== 'N/A' && registro.fct !== '-' ? `Registro FCT: ${registro.fct}` : 'FCT: Não Aplicável (Secretaria do Turismo)';
    doc.text(fctTextPdf, 14, 26);

    const agora = new Date();
    doc.setFontSize(8);
    doc.text(`Emissão: ${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')}`, pageWidth - 14, 26, { align: 'right' });

    // Body container 1: Dados da Operação (2 colunas perfeitamente alinhadas)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 40, pageWidth - 28, 126, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('1. DADOS DA OPERAÇÃO E DO VEÍCULO', 20, 50);

    const renderCampo = (label: string, valor: string, x: number, y: number) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(label.toUpperCase(), x, y);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(valor || 'Não informado', x, y + 5.5);
    };

    const dataFormatada = registro.data ? new Date(registro.data + 'T00:00:00').toLocaleDateString('pt-BR') : '-';

    // Coluna 1 (Esquerda: x = 20)
    renderCampo('Órgão / Secretaria', registro.secretaria, 20, 62);
    renderCampo('Motorista Responsável', registro.motorista, 20, 78);
    renderCampo('Horário de Saída', registro.horarioSaida || '-', 20, 94);
    renderCampo('Andar de Liberação', registro.andar ? `Andar ${registro.andar}` : '-', 20, 110);
    renderCampo('Destino / Finalidade', registro.destino || 'Operacional de rotina', 20, 126);

    // Coluna 2 (Direita: x = 110)
    const fctValPdf = isAgri && registro.fct && registro.fct !== 'N/A' && registro.fct !== '-' ? registro.fct : 'Não Aplicável (Turismo)';
    renderCampo('Nº de Registro (FCT)', fctValPdf, 110, 62);
    renderCampo('Veículo & Placa', `${registro.placa || 'Sem placa'}  •  ${registro.modeloVeiculo || ''}`, 110, 78);
    renderCampo('Horário de Chegada', registro.horarioChegada || 'EM TRÂNSITO', 110, 94);
    renderCampo('Data da Operação', dataFormatada, 110, 110);
    renderCampo('Situação Atual', registro.status === 'EM_TRANSITO' ? 'Em trânsito' : 'Concluído', 110, 126);

    // Campo de Ocorrência
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(registro.ocorrencia ? 180 : 100, registro.ocorrencia ? 83 : 116, registro.ocorrencia ? 9 : 139);
    doc.text('OCORRÊNCIA / ANOTAÇÕES DO OPERADOR', 20, 142);

    doc.setFont('helvetica', registro.ocorrencia ? 'bold' : 'normal');
    doc.setFontSize(9);
    doc.setTextColor(registro.ocorrencia ? 15 : 71, registro.ocorrencia ? 23 : 85, registro.ocorrencia ? 42 : 105);
    const ocorrenciaTxt = registro.ocorrencia ? registro.ocorrencia : 'Nenhuma ocorrência ou avaria registrada para este veículo.';
    const linhasOcorrencia = doc.splitTextToSize(ocorrenciaTxt, pageWidth - 48);
    doc.text(linhasOcorrencia, 20, 147.5);

    // Container 2: Termo de Responsabilidade & Assinatura
    const termY = 170;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, termY, pageWidth - 28, 92, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('2. TERMO DE RESPONSABILIDADE & ASSINATURA', 20, termY + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      'Declaro que as informações e horários foram devidamente conferidos e validados pela administração.',
      20,
      termY + 16
    );

    // Box de Assinatura Branco
    const sigBoxY = termY + 22;
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20, sigBoxY, pageWidth - 40, 60, 2, 2, 'FD');

    // Tentar desenhar a assinatura
    try {
      if (registro.assinaturaUrl && registro.assinaturaUrl.startsWith('data:image')) {
        doc.addImage(registro.assinaturaUrl, 'PNG', 24, sigBoxY + 4, 60, 26);
      }
    } catch (e) {
      console.warn('Não foi possível anexar imagem da assinatura ao PDF:', e);
    }

    doc.setDrawColor(203, 213, 225);
    doc.line(24, sigBoxY + 36, pageWidth - 24, sigBoxY + 36);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Operador Responsável: ${registro.funcionarioResponsavel}`, 24, sigBoxY + 44);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Matrícula Funcional: ${registro.matriculaFuncionario || 'OP-002'}  •  Operador de Cadastro Autenticado`,
      24,
      sigBoxY + 50
    );

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Controle de Registros Secretaria da Agricultura e Secretaria do Turismo', 14, pageHeight - 10);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Desenvolvido por Siolly Technology', pageWidth - 14, pageHeight - 10, { align: 'right' });

    const nomeArquivo = registro.fct && registro.fct !== 'N/A' && registro.fct !== '-' 
      ? `Registro-FCT-${registro.fct}.pdf` 
      : (registro.placa ? `Registro-Placa-${registro.placa}.pdf` : `Registro-${registro.id}.pdf`);
    doc.save(nomeArquivo);
  },

  // ==========================================
  // RELATÓRIO PDF DE ESTATÍSTICAS & MÉTRICAS
  // ==========================================
  construirDocumentoEstatisticas({
    registros,
    secretariaFiltro = 'TODAS',
    periodoRotulo = 'Mês Atual',
    usuario,
    stats,
  }: {
    registros: RegistroVeiculo[];
    secretariaFiltro?: 'TODAS' | Secretaria;
    periodoRotulo?: string;
    usuario?: UsuarioAutenticado | null;
    stats: {
      totalViagens: number;
      emTransito: number;
      finalizados: number;
      totalAgri: number;
      totalTurismo: number;
      pctAgri: number;
      pctTurismo: number;
      topMotoristas: { nome: string; count: number }[];
      topVeiculos: { placa: string; modelo: string; count: number }[];
      topDestinos: { destino: string; count: number }[];
      turnos: { manha: number; tarde: number; noite: number; madrugada: number };
    };
  }): { doc: jsPDF; fileName: string } {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Header Banner Superior Institucional
    const primaryColor: [number, number, number] = [15, 23, 42]; // Slate 900
    const emeraldColor: [number, number, number] = [5, 150, 105]; // Emerald 600
    const matteBrownColor: [number, number, number] = [154, 115, 68]; // Marrom Claro Fosco (#9a7344)

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 30, 'F');

    // Faixa colorida dupla
    doc.setFillColor(...emeraldColor);
    doc.rect(0, 30, pageWidth / 2, 2.5, 'F');
    doc.setFillColor(...matteBrownColor);
    doc.rect(pageWidth / 2, 30, pageWidth / 2, 2.5, 'F');

    // Título e Subtítulo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('RELATÓRIO DE ESTATÍSTICAS & MÉTRICAS DE FROTA', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text('Secretaria da Agricultura  •  Secretaria do Turismo', 14, 18);

    doc.setFontSize(8);
    doc.setTextColor(217, 121, 36);
    doc.text(`Período de Análise: ${periodoRotulo} | Escopo: ${secretariaFiltro === 'TODAS' ? 'Agricultura & Turismo' : secretariaFiltro}`, 14, 25);

    // Emissão à Direita
    const agora = new Date();
    const dataHoraEmissao = agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(`Emissão: ${dataHoraEmissao}`, pageWidth - 14, 12, { align: 'right' });
    if (usuario) {
      doc.text(`Emissor: ${usuario.nome}`, pageWidth - 14, 18, { align: 'right' });
    }

    let currentY = 40;

    // 2. Cartões de Indicadores Gerais (KPIs)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('1. INDICADORES GERAIS DE FLUXO', 14, currentY);
    currentY += 4;

    const kpiWidth = (pageWidth - 28 - 9) / 4;
    const kpiHeight = 22;

    const renderKpiBox = (title: string, value: string, subtitle: string, x: number, colorBg: [number, number, number], colorText: [number, number, number]) => {
      doc.setFillColor(...colorBg);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, currentY, kpiWidth, kpiHeight, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(title.toUpperCase(), x + 4, currentY + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...colorText);
      doc.text(value, x + 4, currentY + 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(subtitle, x + 4, currentY + 19);
    };

    renderKpiBox('Total Viagens', `${stats.totalViagens}`, 'No período', 14, [248, 250, 252], [15, 23, 42]);
    renderKpiBox('Em Trânsito', `${stats.emTransito}`, 'Veículos na rua', 14 + kpiWidth + 3, [254, 243, 199], [180, 83, 9]);
    renderKpiBox('Concluídas', `${stats.finalizados}`, 'Retornos efetuados', 14 + (kpiWidth + 3) * 2, [209, 250, 229], [4, 120, 87]);
    const taxa = stats.totalViagens > 0 ? Math.round((stats.finalizados / stats.totalViagens) * 100) : 100;
    renderKpiBox('Taxa Conclusão', `${taxa}%`, 'Eficiência operacional', 14 + (kpiWidth + 3) * 3, [239, 246, 255], [29, 78, 216]);

    currentY += kpiHeight + 8;

    // 3. Demanda por Secretaria
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('2. DISTRIBUIÇÃO DA DEMANDA POR SECRETARIA', 14, currentY);
    currentY += 4;

    const secBoxWidth = (pageWidth - 28 - 4) / 2;
    const secBoxHeight = 20;

    // Box Agricultura
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(14, currentY, secBoxWidth, secBoxHeight, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(154, 115, 68);
    doc.text('Secretaria da Agricultura', 18, currentY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Total: ${stats.totalAgri} saídas registradas com FCT`, 18, currentY + 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(154, 115, 68);
    doc.text(`${stats.pctAgri}%`, 14 + secBoxWidth - 6, currentY + 12, { align: 'right' });

    // Box Turismo
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(14 + secBoxWidth + 4, currentY, secBoxWidth, secBoxHeight, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(5, 150, 105);
    doc.text('Secretaria do Turismo', 18 + secBoxWidth + 4, currentY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Total: ${stats.totalTurismo} saídas operacionais`, 18 + secBoxWidth + 4, currentY + 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(5, 150, 105);
    doc.text(`${stats.pctTurismo}%`, pageWidth - 20, currentY + 12, { align: 'right' });

    currentY += secBoxHeight + 8;

    // 4. Tabelas de Ranking (Motoristas e Veículos) lado a lado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('3. RANKINGS DE ATIVIDADE & DEMANDA DA FROTA', 14, currentY);
    currentY += 2;

    const motoristasBody = stats.topMotoristas.map((m, idx) => [
      `${idx + 1}º`,
      m.nome,
      `${m.count} ${m.count === 1 ? 'viagem' : 'viagens'}`
    ]);
    if (motoristasBody.length === 0) {
      motoristasBody.push(['-', 'Sem registros', '-']);
    }

    const veiculosBody = stats.topVeiculos.map((v, idx) => [
      `${idx + 1}º`,
      `${v.placa} (${v.modelo})`,
      `${v.count} ${v.count === 1 ? 'saída' : 'saídas'}`
    ]);
    if (veiculosBody.length === 0) {
      veiculosBody.push(['-', 'Sem registros', '-']);
    }

    // Tabela Motoristas (Esquerda)
    autoTable(doc, {
      startY: currentY,
      head: [['Pos.', 'Motorista com Mais Saídas', 'Qtd']],
      body: motoristasBody,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
      },
      margin: { left: 14, right: pageWidth / 2 + 3 },
    });

    // Tabela Veículos (Direita)
    autoTable(doc, {
      startY: currentY,
      head: [['Pos.', 'Veículo / Placa Mais Utilizado', 'Qtd']],
      body: veiculosBody,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
      },
      headStyles: {
        fillColor: [154, 115, 68],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
      },
      margin: { left: pageWidth / 2 + 3, right: 14 },
    });

    // Pega o maior Y após as tabelas
    // @ts-ignore
    const finalY1 = doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY + 45;
    currentY = Math.max(finalY1, currentY + 45) + 8;

    // 5. Destinos e Turnos
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('4. DESTINOS FREQUENTES & TURNOS DE MAIOR MOVIMENTO', 14, currentY);
    currentY += 4;

    // Turnos Box
    const turnoBoxWidth = (pageWidth - 28 - 9) / 4;
    const renderTurnoBox = (label: string, count: number, x: number) => {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, currentY, turnoBoxWidth, 16, 2, 2, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(label, x + 3, currentY + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`${count} saídas`, x + 3, currentY + 12.5);
    };

    renderTurnoBox('Manhã (06h-12h)', stats.turnos.manha, 14);
    renderTurnoBox('Tarde (12h-18h)', stats.turnos.tarde, 14 + turnoBoxWidth + 3);
    renderTurnoBox('Noite (18h-24h)', stats.turnos.noite, 14 + (turnoBoxWidth + 3) * 2);
    renderTurnoBox('Madrugada', stats.turnos.madrugada, 14 + (turnoBoxWidth + 3) * 3);

    currentY += 22;

    // Destinos frequentes em texto estruturado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Principais Destinos Atendidos:', 14, currentY);
    currentY += 4.5;

    const destinosTexto = stats.topDestinos.length > 0
      ? stats.topDestinos.map(d => `${d.destino} (${d.count}x)`).join('  •  ')
      : 'Nenhum destino especificado no período.';
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const splitDestinos = doc.splitTextToSize(destinosTexto, pageWidth - 28);
    doc.text(splitDestinos, 14, currentY);

    // Rodapé em todas as páginas
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Relatório Consolidado de Gestão de Frotas • Secretaria da Agricultura e Secretaria do Turismo', 14, pageHeight - 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Desenvolvido por Siolly Technology', pageWidth - 14, pageHeight - 6.5, { align: 'right' });

    const fileName = `Estatisticas-Frotas-${getLocalDateString()}.pdf`;
    return { doc, fileName };
  },

  gerarPdfEstatisticas(params: {
    registros: RegistroVeiculo[];
    secretariaFiltro?: 'TODAS' | Secretaria;
    periodoRotulo?: string;
    usuario?: UsuarioAutenticado | null;
    stats: any;
  }): void {
    const { doc, fileName } = this.construirDocumentoEstatisticas(params);
    doc.save(fileName);
  },

  obterEstatisticasPdfBlob(params: {
    registros: RegistroVeiculo[];
    secretariaFiltro?: 'TODAS' | Secretaria;
    periodoRotulo?: string;
    usuario?: UsuarioAutenticado | null;
    stats: any;
  }): { blob: Blob; fileName: string } {
    const { doc, fileName } = this.construirDocumentoEstatisticas(params);
    const blob = doc.output('blob');
    return { blob, fileName };
  },

  gerarTextoEstatisticas({
    periodoRotulo = 'Mês Atual',
    secretariaFiltro = 'TODAS',
    usuario,
    stats,
  }: {
    periodoRotulo?: string;
    secretariaFiltro?: 'TODAS' | Secretaria;
    usuario?: UsuarioAutenticado | null;
    stats: any;
  }): string {
    const secTexto = secretariaFiltro === 'TODAS'
      ? 'Secretaria da Agricultura & Secretaria do Turismo'
      : secretariaFiltro;

    let texto = `📊 *PAINEL DE ESTATÍSTICAS & MÉTRICAS DE FROTA*\n`;
    texto += `🏛️ *${secTexto}*\n`;
    texto += `----------------------------------------\n`;
    texto += `📅 *Período:* ${periodoRotulo}\n`;
    texto += `🚗 *Total de Viagens:* ${stats.totalViagens}\n`;
    texto += `⏳ *Em Trânsito (Na rua):* ${stats.emTransito}\n`;
    texto += `✅ *Viagens Concluídas:* ${stats.finalizados}\n`;
    texto += `📈 *Taxa de Conclusão:* ${stats.totalViagens > 0 ? Math.round((stats.finalizados / stats.totalViagens) * 100) : 100}%\n`;
    texto += `----------------------------------------\n`;
    texto += `🏢 *DEMANDA POR SECRETARIA:*\n`;
    texto += `🌾 Agricultura: ${stats.totalAgri} viagens (${stats.pctAgri}%)\n`;
    texto += `✈️ Turismo: ${stats.totalTurismo} viagens (${stats.pctTurismo}%)\n`;
    texto += `----------------------------------------\n`;

    if (stats.topMotoristas && stats.topMotoristas.length > 0) {
      texto += `👤 *TOP MOTORISTAS:*\n`;
      stats.topMotoristas.slice(0, 3).forEach((m: any, idx: number) => {
        texto += `  ${idx + 1}. ${m.nome}: ${m.count} viagens\n`;
      });
      texto += `----------------------------------------\n`;
    }

    if (stats.topVeiculos && stats.topVeiculos.length > 0) {
      texto += `🚙 *VEÍCULOS MAIS UTILIZADOS:*\n`;
      stats.topVeiculos.slice(0, 3).forEach((v: any, idx: number) => {
        texto += `  ${idx + 1}. ${v.placa} (${v.modelo}): ${v.count} saídas\n`;
      });
      texto += `----------------------------------------\n`;
    }

    if (usuario) {
      texto += `👤 *Emissor do Relatório:* ${usuario.nome} (${usuario.matricula})\n`;
    }
    texto += `🕒 *Gerado em:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n`;
    texto += `📄 *PDF Anexo:* Documento detalhado gerado pelo sistema.\n`;
    texto += `Desenvolvido por Siolly Technology`;

    return texto;
  }
};

// Aliases de exportação direta
export const gerarRelatorioGeralPDF = (registros: any[], filtros?: any, usuario?: any) => {
  PdfService.gerarRelatorioDiario({
    registros,
    secretariaFiltro: filtros?.secretaria || 'TODAS',
    dataFiltro: filtros?.data || '',
    usuario,
  });
};


