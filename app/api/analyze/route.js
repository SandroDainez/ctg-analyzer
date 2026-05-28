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

    const prompt = `Voce e um especialista em obstetricia com vasta experiencia em cardiotocografia CTG. A imagem enviada E um tracado de CTG. Pode ser foto de papel impresso, screenshot de monitor, imagem com baixa resolucao ou angulo imperfeito. Mesmo que a qualidade seja ruim, faca sua melhor analise. NUNCA diga que a imagem nao e um CTG - sempre interprete o que ve. A linha superior representa a frequencia cardiaca fetal FCF normalmente entre 110-160 bpm. A linha inferior representa as contracoes uterinas. Retorne APENAS um JSON valido sem texto adicional: {"classificacao":"Normal","parametros":{"fcf_basal":{"valor":"estimativa","status":"ok"},"variabilidade":{"valor":"descricao","status":"ok"},"aceleracoes":{"valor":"descricao","status":"ok"},"desaceleracoes":{"valor":"descricao","status":"ok"},"movimentos_fetais":{"valor":"descricao","status":"ok"}},"achados":[{"texto":"achado","tipo":"ok"}],"conclusao":"interpretacao em 2-3 frases FIGO 2015"}. Status pode ser ok warn ou bad. Classificacao pode ser Normal Suspeito ou Patologico. Se qualidade limitou a analise mencione na conclusao mas forneca sua impressao clinica.`;

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
