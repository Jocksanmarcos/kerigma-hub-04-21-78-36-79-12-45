import React from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Table } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface UniversalExportProps {
  data: any[];
  filename: string;
  title?: string;
  columns?: { key: string; header: string; width?: number }[];
}

export const UniversalExport: React.FC<UniversalExportProps> = ({ 
  data, 
  filename, 
  title,
  columns 
}) => {
  const { toast } = useToast();

  const exportToExcel = () => {
    try {
      const processedData = data.map(item => {
        if (columns) {
          const row: any = {};
          columns.forEach(col => {
            row[col.header] = item[col.key] || '';
          });
          return row;
        }
        return item;
      });

      const ws = XLSX.utils.json_to_sheet(processedData);
      
      if (columns) {
        const colWidths = columns.map(col => ({ 
          wch: col.width || Math.max(col.header.length, 15) 
        }));
        ws['!cols'] = colWidths;
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, title || 'Dados');
      
      XLSX.writeFile(wb, `${filename}.xlsx`);
      
      toast({
        title: "Exportação realizada!",
        description: `Arquivo ${filename}.xlsx baixado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao gerar o arquivo Excel.",
        variant: "destructive",
      });
    }
  };

  const generatePDF = async () => {
    try {
      // Import dinâmico do pdfmake
      const pdfMake = await import('pdfmake/build/pdfmake');
      const pdfFonts = await import('pdfmake/build/vfs_fonts');
      
      pdfMake.default.vfs = pdfFonts.default.pdfMake.vfs;

      const tableHeaders = columns ? 
        columns.map(col => ({ text: col.header, style: 'tableHeader' })) :
        Object.keys(data[0] || {}).map(key => ({ text: key, style: 'tableHeader' }));

      const tableBody = [
        tableHeaders,
        ...data.map(item => 
          columns ? 
            columns.map(col => (item[col.key] || '').toString()) :
            Object.values(item).map(val => (val || '').toString())
        )
      ];

      const docDefinition = {
        content: [
          { text: title || filename, style: 'header' },
          { text: `Gerado em: ${new Date().toLocaleString()}`, style: 'subheader' },
          {
            table: {
              headerRows: 1,
              widths: Array(tableHeaders.length).fill('*'),
              body: tableBody
            },
            layout: 'lightHorizontalLines'
          }
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10]
          },
          subheader: {
            fontSize: 12,
            margin: [0, 0, 0, 20]
          },
          tableHeader: {
            bold: true,
            fontSize: 10,
            color: 'black'
          }
        },
        pageSize: 'A4',
        pageOrientation: 'landscape',
        defaultStyle: {
          fontSize: 8
        }
      };

      pdfMake.default.createPdf(docDefinition).download(`${filename}.pdf`);
      
      toast({
        title: "PDF gerado!",
        description: `Arquivo ${filename}.pdf baixado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o arquivo PDF.",
        variant: "destructive",
      });
    }
  };

  if (!data || data.length === 0) {
    return (
      <Button variant="outline" disabled>
        <Download className="h-4 w-4 mr-2" />
        Exportar (sem dados)
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel}>
          <Table className="h-4 w-4 mr-2" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={generatePDF}>
          <FileText className="h-4 w-4 mr-2" />
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};