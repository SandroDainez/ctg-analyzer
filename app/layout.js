export const metadata = {
  title: "Analisador de CTG",
  description: "Interpretação de cardiotocografia por IA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: system-ui, sans-serif; background: #f5f5f3; }
          .page { min-height: 100vh; background: #f5f5f3; padding: 2rem 1rem; }
          .container { max-width: 640px; margin: 0 auto; }
          .badge { display: inline-block; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; background: #fff8e1; color: #b45309; border: 1px solid #fde68a; margin-bottom: 10px; }
          .title { font-size: 22px; font-weight: 600; color: #1a1a1a; margin: 0 0 6px; }
          .subtitle { font-size: 14px; color: #666; margin: 0 0 1.5rem; }
          .upload-area { border: 2px dashed #d1d5db; border-radius: 12px; padding: 2.5rem 1rem; text-align: center; cursor: pointer; background: #fff; margin-bottom: 1rem; transition: border-color 0.2s; }
          .upload-area:hover { border-color: #6b7280; }
          .upload-icon { font-size: 28px; color: #9ca3af; margin-bottom: 10px; }
          .upload-text { font-size: 15px; color: #374151; font-weight: 500; }
          .upload-sub { font-size: 12px; color: #9ca3af; margin-top: 4px; }
          .preview-wrap { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; margin-bottom: 1rem; background: #f9fafb; }
          .preview-img { width: 100%; display: block; max-height: 300px; object-fit: contain; }
          .clear-btn { position: absolute; top: 8px; right: 8px; background: white; border: 1px solid #e5e7eb; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; font-size: 13px; color: #6b7280; }
          .btn-analyze { width: 100%; padding: 11px; background: #1a1a1a; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 1rem; }
          .btn-analyze:disabled { background: #d1d5db; cursor: not-allowed; }
          .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; display: inline-block; animation: spin 0.7s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
          .error-box { padding: 12px 14px; background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; border-radius: 8px; font-size: 14px; margin-bottom: 1rem; }
          .result-card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; margin-bottom: 1rem; }
          .result-header { padding: 1rem 1.25rem; border-bottom: 1px solid #e5e7eb; }
          .result-title { font-size: 15px; font-weight: 600; color: #111; }
          .class-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; padding: 1rem 1.25rem; border-bottom: 1px solid #e5e7eb; }
          .class-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
          .class-label { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
          .verdict-badge { font-size: 12px; padding: 4px 10px; border-radius: 20px; font-weight: 500; text-align: center; }
          .v-normal { background: #dcfce7; color: #15803d; }
          .v-suspeito { background: #fef9c3; color: #a16207; }
          .v-patologico { background: #fee2e2; color: #b91c1c; }
          .v-neutro { background: #f3f4f6; color: #6b7280; }
          .result-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem; }
          .section-title { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
          .param-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .param-card { background: #f9fafb; border-radius: 8px; padding: 10px 12px; border: 1px solid #f3f4f6; }
          .param-label { font-size: 12px; color: #6b7280; margin-bottom: 3px; }
          .param-value { font-size: 14px; font-weight: 500; }
          .c-ok { color: #15803d; } .c-warn { color: #a16207; } .c-bad { color: #b91c1c; }
          .findings-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 7px; }
          .finding-item { display: flex; align-items: flex-start; gap: 9px; font-size: 14px; line-height: 1.5; color: #374151; }
          .finding-dot { width: 7px; height: 7px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
          .d-ok { background: #22c55e; } .d-warn { background: #eab308; } .d-bad { background: #ef4444; }
          .conclusion { background: #f9fafb; border-radius: 8px; padding: 12px 14px; font-size: 14px; line-height: 1.7; color: #374151; border: 1px solid #f3f4f6; }
          .disclaimer { font-size: 12px; color: #6b7280; line-height: 1.6; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}