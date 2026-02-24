import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY tidak dikonfigurasi" },
      { status: 500 }
    );
  }

  let body: { text: string; studentNames: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON tidak sah" }, { status: 400 });
  }

  const { text, studentNames } = body;
  if (!text || !text.trim()) {
    return NextResponse.json(
      { error: "Teks arahan tidak boleh kosong" },
      { status: 400 }
    );
  }
  if (!studentNames || studentNames.length === 0) {
    return NextResponse.json(
      { error: "Senarai murid tidak boleh kosong" },
      { status: 400 }
    );
  }

  const prompt = `Kamu adalah pembantu guru sekolah rendah Malaysia. Guru memberikan arahan dalam Bahasa Melayu tentang penetapan Tahap Penguasaan (TP) murid. TP bernilai 1 hingga 6.

Senarai penuh nama murid dalam kelas:
${studentNames.map((n, i) => `${i + 1}. ${n}`).join("\n")}

Arahan guru:
"${text}"

Tugas kamu:
1. Kenal pasti nama murid yang disebut dalam arahan dan padankan dengan senarai penuh di atas (gunakan padanan separa nama — contoh "Adni" padankan dengan "ADNI HASYA BINTI ADNAN SHAFEEQ").
2. Tentukan TP (1-6) untuk setiap murid yang disebut nama.
3. Jika guru menyebut "yang lain", "semua", "selebihnya", atau ungkapan umum, tentukan defaultTp untuk murid yang tidak disebut nama secara khusus.
4. Jika tiada ungkapan umum, set defaultTp kepada null.

Balas dalam format JSON sahaja:
{
  "assignments": [
    { "name": "nama separa yang guru sebut", "tp": <nombor 1-6> }
  ],
  "defaultTp": <nombor 1-6 atau null>
}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", res.status, errText);
      return NextResponse.json(
        { error: "Gemini API gagal", details: errText },
        { status: 502 }
      );
    }

    const data = await res.json();
    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let parsed: { assignments: { name: string; tp: number }[]; defaultTp: number | null };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.error("JSON parse gagal:", rawText);
      return NextResponse.json(
        { error: "Respons AI bukan JSON yang sah", raw: rawText },
        { status: 422 }
      );
    }

    // Validate structure
    if (!Array.isArray(parsed.assignments)) {
      return NextResponse.json(
        { error: "Format respons AI tidak sah", raw: rawText },
        { status: 422 }
      );
    }

    // Clamp TP values to 1-6
    parsed.assignments = parsed.assignments
      .filter((a) => a.name && typeof a.tp === "number")
      .map((a) => ({
        name: a.name,
        tp: Math.max(1, Math.min(6, Math.round(a.tp))),
      }));

    if (parsed.defaultTp !== null && parsed.defaultTp !== undefined) {
      parsed.defaultTp = Math.max(1, Math.min(6, Math.round(parsed.defaultTp)));
    } else {
      parsed.defaultTp = null;
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { error: "Gemini API timeout (15s)" },
        { status: 504 }
      );
    }
    console.error("AI-TP error:", err);
    return NextResponse.json(
      { error: "Ralat dalaman" },
      { status: 500 }
    );
  }
}
