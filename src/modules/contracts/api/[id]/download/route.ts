import { NextRequest } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "fs/promises";
import path from "path";
import { db } from "@/core/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contract = await db.contract.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });

    if (!contract) {
      return new Response("Contract not found", {
        status: 404,
      });
    }

    // ساخت PDF
    const pdfDoc = await PDFDocument.create();

    pdfDoc.registerFontkit(fontkit);

    // فونت پروژه
    const fontPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "Vazirmatn-Regular.woff2"
    );

    const fontBytes = await readFile(fontPath);

    const font = await pdfDoc.embedFont(fontBytes);

    const page = pdfDoc.addPage([595, 842]);

    const { height } = page.getSize();

    let y = height - 50;

    const draw = (text: string, size = 12) => {
      page.drawText(text, {
        x: 50,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
      });

      y -= size + 10;
    };

    draw("قرارداد", 22);

    draw("");

    draw(`شماره قرارداد : ${contract.contractNumber ?? "-"}`);

    draw(
      `کارمند : ${contract.employee.firstName} ${contract.employee.lastName}`
    );

    draw(`نوع قرارداد : ${contract.type}`);

    draw(`تاریخ شروع : ${contract.startDate}`);

    draw(`تاریخ پایان : ${contract.endDate ?? "نامحدود"}`);

    draw("");

    draw("متن قرارداد", 16);

    draw("");

    const lines = (contract.content ?? "متنی ثبت نشده است").split("\n");

    for (const line of lines) {
      page.drawText(line, {
        x: 50,
        y,
        size: 11,
        font,
      });

      y -= 18;

      if (y < 40) {
        const newPage = pdfDoc.addPage([595, 842]);

        y = 800;

        newPage.drawText("", {
          x: 0,
          y: 0,
          size: 1,
          font,
        });
      }
    }

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=contract-${contract.contractNumber}.pdf`,
      },
    });
  } catch (err) {
    console.error(err);

    return new Response("خطا در ساخت PDF", {
      status: 500,
    });
  }
}