import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RegistroVeiculo, Secretaria, UsuarioAutenticado } from '../types';

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
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);

        // Thin top divider for footer
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

        // Left text: Title & Nota de Sigilo
        doc.text(
          'Controle de Registros Secretaria da Agricultura e Secretaria do Turismo  •  Senhas e credenciais sigilosas não inclusas',
          14,
          pageHeight - 6.5
        );

        // Center text: Mandated developer attribution!
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(
          '2026 Desenvolvido por Roberto',
          pageWidth / 2,
          pageHeight - 6.5,
          { align: 'center' }
        );

        // Right text: Page
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Página ${currentPage}`,
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
        texto += `   • Operador Responsável: ${r.funcionarioResponsavel} (Matrícula: ${r.matriculaFuncionario || '-'})\n\n`;
      });
    }

    texto += `----------------------------------------\n`;
    texto += `Relatório Oficial de Tráfego e Controle de Frotas\n`;
    texto += `2026 Desenvolvido por Roberto\n`;
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

    // Container 2: Termo de Responsabilidade & Assinatura
    const termY = 172;
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

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Controle de Registros Secretaria da Agricultura e Secretaria do Turismo', 14, pageHeight - 10);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('2026 Desenvolvido por Roberto', pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`Registro-${registro.fct}.pdf`);
  }
};
