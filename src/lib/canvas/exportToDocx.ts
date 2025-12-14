import { Document, Paragraph, TextRun, Packer } from 'docx';
import { saveAs } from 'file-saver';
import { CanvasFile } from '@/types/canvas';

export async function exportToDocx(file: CanvasFile) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: file.title,
                bold: true,
                size: 32,
              }),
            ],
          }),
          ...file.content.split('\n').map(
            (line) =>
              new Paragraph({
                children: [new TextRun(line)],
              })
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${file.title}.docx`);
}
