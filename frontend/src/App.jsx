import React, { useState } from 'react';
import { Upload, CheckCircle2, RefreshCw, Activity, AlertCircle, Sparkles, BrainCircuit, ShieldCheck, XCircle } from 'lucide-react';

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', image);

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error("Internal Server Error");
      
      const data = await response.json();
      if (data.success === false) {
        throw new Error(data.error);
      }
      setResult(data);
    } catch (err) {
      console.error("Connection Error:", err);
      setError("Unable to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.glowTop}></div>
      <div style={styles.glowBottom}></div>

      <div style={styles.dashboardLayout}>
        <div style={styles.leftPanel}>
          <div style={styles.badge}>
            <Sparkles size={14} color="#6366f1" />
            <span>Deep Learning System v2.5</span>
          </div>
          <h1 style={styles.mainTitle}>Automated Trichoscopy <br/><span style={styles.gradientText}>Analysis System</span></h1>
          <p style={styles.mainSubtitle}>
            An advanced decision-support system utilizing an Optimized EfficientNet-B0 core with built-in Out-of-Distribution (OOD) image filtering.
          </p>
          <div style={styles.featuresList}>
            <div style={styles.featureItem}>
              <BrainCircuit size={20} color="#38bdf8" />
              <div>
                <h4 style={styles.featureTitle}>Convolutional Neural Network</h4>
                <p style={styles.featureDesc}>94.44% max accuracy trained over 765 image matrices.</p>
              </div>
            </div>
            <div style={styles.featureItem}>
              <ShieldCheck size={20} color="#4ade80" />
              <div>
                <h4 style={styles.featureTitle}>Privacy-Preserving Inference</h4>
                <p style={styles.featureDesc}>Runs locally with automatic false-positive rejection filters.</p>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.glassCard}>
            <div style={{
              ...styles.uploadZone,
              borderColor: preview ? '#6366f1' : '#334155',
              backgroundColor: preview ? 'rgba(99, 102, 241, 0.02)' : 'rgba(30, 41, 59, 0.3)'
            }}>
              <input type="file" accept="image/*" onChange={handleImageChange} style={styles.fileInput} />
              {!preview ? (
                <div style={styles.uploadPlaceholder}>
                  <div style={styles.uploadIconCircle}>
                    <Upload size={28} color="#6366f1" />
                  </div>
                  <p style={styles.uploadText}>Drop Trichoscopy Image Here</p>
                  <p style={styles.uploadSubtext}>Click to browse locally (PNG, JPG, JPEG)</p>
                </div>
              ) : (
                <div style={styles.previewWrapper}>
                  <img src={preview} alt="Trichoscopy Preview" style={styles.imagePreview} />
                  <div style={styles.previewOverlay}>✓ Image Matrix Loaded</div>
                </div>
              )}
            </div>

            {error && (
              <div style={styles.errorContainer}>
                <AlertCircle size={18} color="#f87171" />
                <span style={{ color: '#f87171', fontSize: '14px' }}>{error}</span>
              </div>
            )}

            {preview && (
              <button onClick={handleSubmit} disabled={loading} style={styles.submitBtn}>
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Activity size={18} />}
                {loading ? 'Processing Scalp Features...' : 'Execute AI Diagnosis'}
              </button>
            )}

            {result && (
              <div style={styles.resultContainer}>
                <div style={styles.resultHeader}>
                  <div style={{
                    ...styles.successIconCircle,
                    backgroundColor: result.is_valid_alopecia ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                  }}>
                    {result.is_valid_alopecia ? <CheckCircle2 size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />}
                  </div>
                  <h3 style={styles.resultTitle}>Diagnostic Inference</h3>
                </div>

                <div style={{
                  ...styles.diagnosisBadgeCard,
                  borderLeftColor: result.is_valid_alopecia ? '#6366f1' : '#ef4444',
                  backgroundColor: result.is_valid_alopecia ? 'rgba(99, 102, 241, 0.05)' : 'rgba(239, 68, 68, 0.05)'
                }}>
                  <span style={styles.resLabel}>Classified Result</span>
                  <strong style={{
                    ...styles.diagnosisName,
                    color: result.is_valid_alopecia ? '#ffffff' : '#f87171'
                  }}>{result.diagnosis}</strong>
                  {result.message && <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>{result.message}</p>}
                </div>

                <div style={styles.confidenceSection}>
                  <div style={styles.labelRow}>
                    <span style={styles.confText}>AI Confidence Level</span>
                    <strong style={{ color: result.is_valid_alopecia ? '#10b981' : '#f87171', fontSize: '16px' }}>{result.confidence}%</strong>
                  </div>
                  <div style={styles.progressTrack}>
                    <div style={{ ...styles.progressFill, width: `${result.confidence}%`, backgroundColor: result.is_valid_alopecia ? '#10b981' : '#ef4444' }}></div>
                  </div>
                </div>

                <h4 style={styles.breakdownTitle}>Probability Distribution Matrix</h4>
                {Object.entries(result.detailed_analysis).map(([className, percentage]) => {
                  const isMatch = className === result.diagnosis && result.is_valid_alopecia;
                  return (
                    <div key={className} style={styles.breakdownRow}>
                      <div style={styles.labelRow}>
                        <span style={{ ...styles.classNameText, color: isMatch ? '#e2e8f0' : '#94a3b8' }}>{className}</span>
                        <span style={{ ...styles.percentageText, color: isMatch ? '#10b981' : '#cbd5e1' }}>{percentage}%</span>
                      </div>
                      <div style={styles.progressTrackSub}>
                        <div style={{ ...styles.progressFill, width: `${percentage}%`, backgroundColor: isMatch ? '#10b981' : '#3b82f6' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#0b0f19', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden', color: '#f1f5f9' },
  glowTop: { position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' },
  glowBottom: { position: 'absolute', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' },
  dashboardLayout: { maxWidth: '1200px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '60px', alignItems: 'center', zIndex: 10 },
  leftPanel: { paddingRight: '20px' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '6px 14px', borderRadius: '20px', color: '#a5b4fc', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '24px' },
  mainTitle: { fontSize: '42px', fontWeight: '800', lineHeight: '1.2', color: '#ffffff', margin: '0 0 20px 0', letterSpacing: '-0.5px' },
  gradientText: { background: 'linear-gradient(90deg, #6366f1 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  mainSubtitle: { fontSize: '16px', color: '#94a3b8', lineHeight: '1.6', margin: '0 0 40px 0' },
  featuresList: { display: 'flex', flexDirection: 'column', gap: '24px', borderTop: '1px solid #1e293b', paddingTop: '30px' },
  featureItem: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
  featureTitle: { margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', color: '#f1f5f9' },
  featureDesc: { margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.4' },
  rightPanel: { width: '100%' },
  glassCard: { backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '35px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
  uploadZone: { border: '2px dashed', borderRadius: '16px', padding: '30px 20px', textAlign: 'center', position: 'relative', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden' },
  fileInput: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 },
  uploadPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' },
  uploadIconCircle: { width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '4px' },
  uploadText: { color: '#e2e8f0', fontWeight: '600', fontSize: '16px', margin: 0 },
  uploadSubtext: { color: '#64748b', fontSize: '13px', margin: 0 },
  previewWrapper: { position: 'relative', display: 'inline-block', width: '100%' },
  imagePreview: { maxWidth: '100%', maxHeight: '260px', borderRadius: '10px', objectFit: 'contain', border: '1px solid rgba(255,255,255,0.05)' },
  previewOverlay: { marginTop: '12px', color: '#10b981', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' },
  submitBtn: { width: '100%', marginTop: '24px', padding: '15px', backgroundColor: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: 'all 0.2s ease', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)' },
  errorContainer: { marginTop: '16px', padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' },
  resultContainer: { marginTop: '30px', padding: '24px', backgroundColor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '16px', animation: 'fadeIn 0.4s ease-out' },
  resultHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  successIconCircle: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  resultTitle: { margin: 0, color: '#f1f5f9', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  diagnosisBadgeCard: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px', borderLeft: '4px solid', borderRadius: '0 8px 8px 0', marginBottom: '20px' },
  resLabel: { fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' },
  diagnosisName: { fontSize: '22px', fontWeight: '700', letterSpacing: '-0.3px' },
  confidenceSection: { marginBottom: '24px' },
  labelRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', width: '100%' },
  confText: { color: '#94a3b8', fontWeight: '500' },
  progressTrack: { width: '100%', backgroundColor: '#1e293b', height: '8px', borderRadius: '4px', overflow: 'hidden' },
  progressTrackSub: { width: '100%', backgroundColor: '#0f172a', height: '5px', borderRadius: '3px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '4px', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' },
  breakdownTitle: { color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', borderTop: '1px solid #1e293b', paddingTop: '20px', marginBottom: '15px' },
  breakdownRow: { marginBottom: '12px' },
  classNameText: { fontSize: '14px', fontWeight: '500' },
  percentageText: { fontSize: '14px', fontWeight: '600' }
};

export default App;