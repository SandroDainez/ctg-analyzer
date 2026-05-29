"use client";
import { useState, useRef } from "react";

export default function CTGAnalyzer() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [mimeType, setMimeType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  function loadFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      setImageBase64(e.target.result.split(",")[1]);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImage(null); setImageBase64(null); setMimeType(null);
    setResult(null); setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function analyze() {
    if (!imageBase64) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64, mimeType }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.classificacao) throw new Error("Resposta incompleta. Tente novamente.");
      setResult(data);
    } catch (err) {
      setError(err.message || "Erro ao analisar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function verdictClass(v) {
    if (!v) return "verdict-badge v-neutro";
    const s = v.toLowerCase();
    if (s.includes("normal") || s.includes("category i") || s.includes("categoria i")) return "verdict-badge v-normal";
    if (s.includes("suspeito") || s.includes("category ii") || s.includes("categoria ii")) return "verdict-badge v-suspeito";
    if (s.includes("patol") || s.includes("category iii") || s.includes("categoria iii")) return "verdict-badge v-patologico";
    return "verdict-badge v-neutro";
  }

  const params = [
    { key: "fcf_basal", label: "FCF basal" },
    { key: "variabilidade", label: "Variabilidade" },
    { key: "aceleracoes", label: "Acelerações" },
    { key: "desaceleracoes", label: "Desacelerações" },
    { key: "movimentos_fetais", label: "Movimentos fetais" },
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="badge">Análise de CTG</div>
        <h1 className="title">Interpretador de Cardiotocografia</h1>
        <p className="subtitle">Análise automática pelos critérios FIGO 2015, ACOG 2023 e FEBRASGO.</p>

        {!image ? (
          <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => loadFile(e.target.files[0])} />
            <div className="upload-icon">↑</div>
            <div className="upload-text">Clique ou arraste a foto do traçado</div>
            <div className="upload-sub">JPG, PNG, WEBP — foto do papel ou tela do monitor</div>
          </div>
        ) : (
          <div className="preview-wrap">
            <img src={image} alt="CTG" className="preview-img" />
            <button className="clear-btn" onClick={clearImage}>✕</button>
          </div>
        )}

        <button className="btn-analyze" disabled={!image || loading} onClick={analyze}>
          {loading ? <><span className="spinner" /> Analisando...</> : "Analisar traçado"}
        </button>

        {error && <div className="error-box">{error}</div>}

        {result && (
          <div className="result-card">
            <div className="result-header">
              <span className="result-title">Resultado da análise</span>
            </div>
            <div className="class-grid">
              <div className="class-item">
                <div className="class-label">FIGO 2015</div>
                <span className={verdictClass(result.classificacao)}>{result.classificacao}</span>
              </div>
              <div className="class-item">
                <div className="class-label">ACOG 2023</div>
                <span className={verdictClass(result.classificacao_acog)}>{result.classificacao_acog || "—"}</span>
              </div>
              <div className="class-item">
                <div className="class-label">FEBRASGO</div>
                <span className={verdictClass(result.classificacao_febrasgo)}>{result.classificacao_febrasgo || "—"}</span>
              </div>
            </div>
            <div className="result-body">
              <div>
                <div className="section-title">Parâmetros avaliados</div>
                <div className="param-grid">
                  {params.map(({ key, label }) => {
                    const p = result.parametros?.[key] || { valor: "—", status: "ok" };
                    return (
                      <div key={key} className="param-card">
                        <div className="param-label">{label}</div>
                        <div className={`param-value c-${p.status}`}>{p.valor}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {result.achados?.length > 0 && (
                <div>
                  <div className="section-title">Achados principais</div>
                  <ul className="findings-list">
                    {result.achados.map((a, i) => (
                      <li key={i} className="finding-item">
                        <span className={`finding-dot d-${a.tipo}`} />
                        <span>{a.texto}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <div className="section-title">Conclusão clínica</div>
                <div className="conclusion">{result.conclusao}</div>
              </div>
            </div>
          </div>
        )}

        <div className="disclaimer">
          <strong>Aviso clínico:</strong> Esta ferramenta é um auxílio de triagem e não substitui a avaliação médica.
        </div>
      </div>
    </div>
  );
}