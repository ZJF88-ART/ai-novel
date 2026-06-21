import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

export async function GET() {
  return Response.json({ status: "ok" });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { chapters, title } = body;
    
    if (!chapters || !chapters.length) {
      return Response.json({ error: "no chapters" }, { status: 400 });
    }

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: "SimSun", size: 24 },
          },
        },
      },
      sections: [],
    });

    // Title section
    doc.addSection({
      children: [
        new Paragraph({
          text: title || "AI Novel Studio",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "AI Novel Studio - " + chapters.length + " chapters",
              size: 22,
              color: "888888",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
      ],
    });

    // Each chapter as a new section
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      const chTitle = ch.title || ("Chapter " + (i + 1));
      let content = ch.content || "";

      if (content.startsWith("# ")) {
        const lines = content.split("\n");
        content = lines.slice(1).join("\n");
      }

      const sumIdx = content.indexOf("\u3010\u672c\u7ae0\u6458\u8981\u3011");
      if (sumIdx > 0) content = content.substring(0, sumIdx);
      const sumIdx2 = content.indexOf("\u3010\u6458\u8981\u3011");
      if (sumIdx2 > 0) content = content.substring(0, sumIdx2);

      const children = [
        new Paragraph({
          text: chTitle,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),
      ];

      const paragraphs = content.split("\n\n").filter(p => p.trim());
      for (const pt of paragraphs) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: pt.trim(),
                font: "SimSun",
                size: 24,
              }),
            ],
            indent: { firstLine: 480 },
            spacing: { after: 120 },
          })
        );
      }

      doc.addSection({ children });
    }

    const buffer = await Packer.toBuffer(doc);

    const filename = encodeURIComponent((title || "novel")) + ".docx";
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": "attachment; filename=\"" + filename + "\"",
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return Response.json({ error: "Export failed: " + err.message }, { status: 500 });
  }
}
