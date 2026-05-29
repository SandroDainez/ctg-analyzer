"use client";

import { useState, useRef } from "react";
import styles from "./CTGAnalyzer.module.css";

export default function CTGAnalyzer() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [mimeType, setMimeType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
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

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    loadFile(e.dataTransfer.files[0]);
  }

  function clearImage() {
    setImage(null);
    setImageBase64(null);
    setMimeType(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function analyze() {
    if (!imageBase64) return;
    setLoading(true);
    setError(null);
    setResult(null);

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

  const verdictColor = {
    Normal: styles.verdictNormal,
    Suspeito: styles.verdictSuspeito,
    "Patológico": styles.verdictPatologico,
    "Não identificado": styles.verdictNeutro,
  };

  const statusColor = { ok: styles.ok, warn: styles.warn, bad: styles.bad };
  const dotColor = { ok: styles.dotOk, warn: styles.dotWarn, bad: styles.dotBad };

  const params = [
    { key: "fcf_basal", label: "FCF basal" },
    { key: "variabilidade", label: "Variabilidade" },
    { key: "aceleracoes", label: "Acelerações" },
    { key: "desaceleracoes", label: "Desacelerações" },
    { key: "movimentos_fetais", label: "Movimentos fetais" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.badge}>Análise de CTG</div>
          <h1 className={styles.title}>Interpretador de Cardiotocografia</h1>
          <p className={styles.subtitle}>
            Envie uma foto do traçado para análise automática pelos critérios FIGO 2015.
          </p>
        </div>

        {!image ? (
          <div
            className={`${styles.uploadArea} ${dragging ? styles.dragging : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => loadFile(e.target.files[0])}
            />
            <div className={styles.uploadIcon}>↑</div>
            <div className={styles.uploadText}>Clique ou arraste a foto do traçado</div>
            <div className={styles.uploadSub}>JPG, PNG, WEBP — foto do papel ou tela do monitor</div>
          </div>
        ) : (
          <div className={styles.previewWrap}>
            <img src={image} alt="Traçado CTG" className={styles.previewImg} />
            <button className={styles.clearBtn} onClick={clearImage}>✕</button>
          </div>
        )}

        <button
          className={styles.btnAnalyze}
          disabled={!image || loading}
          onClick={analyze}
        >
          {loading ? (
            <><span className={styles.spinner} /> Analisando traçado...</>
          ) : (
            "Analisar traçado"
          )}
        </button>

        {error && <div className={styles.errorBox}>{error}</div>}

        {result && (
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <span className={styles.resultTitle}>Resultado da análise</span>
              <span className={`${styles.verdictBadge} ${verdictColor[result.classificacao] || styles.verdictNeutro}`}>
                {result.classificacao}
              </span>
            </div>

            <div className={styles.resultBody}>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Parâmetros avaliados</div>
                <div className={styles.paramGrid}>
                  {params.map(({ key, label }) => {
                    const p = result.parametros?.[key] || { valor: "—", status: "ok" };
                    return (
                      <div key={key} className={styles.paramCard}>
                        <div className={styles.paramLabel}>{label}</div>
                        <div className={`${styles.paramValue} ${statusColor[p.status] || ""}`}>
                          {p.valor}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {result.achados?.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Achados principais</div>
                  <ul className={styles.findingsList}>
                    {result.achados.map((a, i) => (
                      <li key={i} className={styles.findingItem}>
                        <span className={`${styles.findingDot} ${dotColor[a.tipo] || styles.dotOk}`} />
                        <span>{a.texto}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.section}>
                <div className={styles.sectionTitle}>Conclusão clínica</div>
                <div className={styles.conclusion}>{result.conclusao}</div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.disclaimer}>
          <strong>Aviso clínico:</strong> Esta ferramenta é um auxílio de triagem e não substitui
          a avaliação médica. Decisões clínicas devem sempre ser baseadas na avaliação completa
          por profissional habilitado.
        </div>
      </div>
    </div>
  );
}
