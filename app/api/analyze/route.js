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

    const prompt = `Você é um especialista em obstetrícia analisando um traçado de cardiotocografia (CTG).
Analise a imagem fornecida e retorne APENAS um JSON válido com a seguinte estrutura, sem nenhum texto adicional:

{
  "classificacao": "Normal" | "Suspeito" | "Patológico" | "Não identificado",
  "parametros": {
    "fcf_basal": { "valor": "string com bpm ou nao visivel", "status": "ok" | "warn" | "bad" },
    "variabilidade": { "valor": "string descritiva", "status": "ok" | "warn" | "bad" },
    "aceleracoes": { "valor": "string descritiva", "status": "ok" | "warn" | "bad" },
    "desaceleracoes": { "valor": "string descritiva", "status": "ok" | "warn" | "bad" },
    "movimentos_fetais": { "valor": "string ou nao visivel", "status": "ok" | "warn" | "bad" }
  },
  "achados": [
    { "texto": "descricao do achado", "tipo": "ok" | "warn" | "bad" }
  ],
  "conclusao": "Texto de conclusao clinica em 2-3 frases com interpretacao segundo criterios FIGO 2015."
}

Se a imagem nao for um tracado de CTG, defina classificacao como Nao identificado e explique na conclusao.
Retorne SOMENTE o JSON, sem markdown, sem explicacoes extras.`;

    const body = {
      model: "gpt-4o",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${image}`,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    };

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      console.error("OpenAI error:", err);
      return Response.json({ error: "Erro ao chamar a API OpenAI." }, { status: 500 });
    }

    const data = await openaiRes.json();
    const text = data.choices?.[0]?.message?.content || "";
    const clean = text.replace(/```json|```/g, "").trim();

    let result;
    try {
      result = JSON.parse(clean);
    } catch {
      return Response.json({ error: "Resposta invalida da IA. Tente novamente." }, { status: 500 });
    }

    return Response.json(result);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
