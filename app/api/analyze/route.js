export const runtime = "edge";

export async function POST(request) {
  try {
    const { image, mimeType } = await request.json();
    if (!image || !mimeType) {
      return Response.json({ error: "Imagem não fornecida." }, { status: 400 });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Chave de API não configurada." }, { status: 500 });
    }

    const prompt = `You are an obstetrics expert analyzing a cardiotocography (CTG) trace. The image IS a CTG trace - always analyze it even if quality is poor. The top line is fetal heart rate (FHR, normal 110-160 bpm), the bottom line is uterine contractions. Return ONLY valid JSON, no extra text: {"classificacao":"Normal","parametros":{"fcf_basal":{"valor":"estimate in bpm","status":"ok"},"variabilidade":{"valor":"description","status":"ok"},"aceleracoes":{"valor":"description","status":"ok"},"desaceleracoes":{"valor":"description","status":"ok"},"movimentos_fetais":{"valor":"description","status":"ok"}},"achados":[{"texto":"finding","tipo":"ok"}],"conclusao":"clinical interpretation 2-3 sentences FIGO 2015"}. Status values: ok, warn, bad. Classificacao values: Normal, Suspeito, Patologico. Write all text fields in Brazilian Portuguese.`;

    const body = {
      model: "gpt-4o",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${image}`, detail: "high" } },
          { type: "text", text: prompt }
        ]
      }]
    };

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body)
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      console.error("OpenAI error:", err);
      return Response.json({ error: "Erro ao chamar a API OpenAI." }, { status: 500 });
    }

    const data = await openaiRes.json();
    const text = data.choices?.[0]?.message?.content || "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return Response.json({ error: "Resposta invalida da IA. Tente novamente." }, { status: 500 });
    }

    let result;
    try {
      result = JSON.parse(match[0]);
    } catch {
      return Response.json({ error: "Erro ao processar resposta. Tente novamente." }, { status: 500 });
    }

    return Response.json(result);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}