import { jsPDF } from 'jspdf';
import { CanvasFile } from '@/types/canvas';

export async function exportToPDF(file: CanvasFile) {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(file.title, 10, 10);
  
  // Add content
  doc.setFontSize(12);
  const lines = doc.splitTextToSize(file.content, 180);
  doc.text(lines, 10, 20);
  
  doc.save(`${file.title}.pdf`);
}
