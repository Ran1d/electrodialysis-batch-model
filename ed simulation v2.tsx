import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const F = 96485;

function simulateBoth({ I, epsilon, V_L, C0_molL, t_end_min }) {
  const V = V_L / 1000;
  const C0 = C0_molL * 1000;
  const t_end = t_end_min * 60;
  const steps = 300;
  const dt = t_end / steps;

  let C_lin = C0;
  let C_exp = C0;
  const data = [];

  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    data.push({
      time: parseFloat((t / 60).toFixed(2)),
      linear: parseFloat(Math.max(C_lin, 0).toFixed(4)),
      exponential: parseFloat(Math.max(C_exp, 0).toFixed(4)),
    });

    // Linear model: dC/dt = -(I * ε) / (F * V)
    const dC_lin = -(I * epsilon) / (F * V);
    C_lin = Math.max(C_lin + dC_lin * dt, 0);

    // Exponential model: dC/dt = -(I * ε * C/C0) / (F * V)
    const dC_exp = -(I * epsilon * (C_exp / C0)) / (F * V);
    C_exp = Math.max(C_exp + dC_exp * dt, 0);
  }

  const finalLin = data[data.length - 1].linear;
  const finalExp = data[data.length - 1].exponential;

  return {
    data,
    finalLin: finalLin.toFixed(2),
    finalExp: finalExp.toFixed(2),
    removedLin: ((1 - finalLin / C0) * 100).toFixed(1),
    removedExp: ((1 - finalExp / C0) * 100).toFixed(1),
    C0,
  };
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px" }}>
        <p style={{ color: "#94a3b8", margin: 0, fontSize: 11 }}>t = {label} min</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color, margin: "4px 0 0", fontSize: 13, fontWeight: 600 }}>
            {p.name === "linear" ? "Linear" : "Exponential"}: {p.value} mol/m³
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function EDSimulatorV2() {
  const [params, setParams] = useState({
    I: 0.5,
    epsilon: 0.9,
    V_L: 1,
    C0_molL: 0.05,
    t_end_min: 60,
  });
  const [result, setResult] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const [activeTab, setActiveTab] = useState("chart");

  useEffect(() => {
    setResult(simulateBoth(params));
    setAnimKey((k) => k + 1);
  }, [params]);

  const handleChange = (key, val) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) setParams((p) => ({ ...p, [key]: num }));
  };

  const sliders = [
    { key: "I", label: "Current (I)", unit: "A", min: 0.1, max: 5, step: 0.1 },
    { key: "epsilon", label: "Efficiency (ε)", unit: "", min: 0.5, max: 1.0, step: 0.05 },
    { key: "V_L", label: "Volume (V)", unit: "L", min: 0.1, max: 10, step: 0.1 },
    { key: "C0_molL", label: "Initial C₀", unit: "mol/L", min: 0.01, max: 0.6, step: 0.01 },
    { key: "t_end_min", label: "Time", unit: "min", min: 10, max: 180, step: 10 },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070d1a",
      color: "#e2e8f0",
      fontFamily: "'Courier New', monospace",
      padding: "24px 18px",
      boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: "#38bdf8", textTransform: "uppercase", marginBottom: 5 }}>
          Step 2 — Improved Model
        </div>
        <h1 style={{ margin: 0, fontSize: "clamp(16px, 3.5vw, 26px)", fontWeight: 700, color: "#f1f5f9" }}>
          ⚡ ED Model: Linear vs Exponential
        </h1>
        <p style={{ color: "#64748b", fontSize: 11, marginTop: 5, marginBottom: 0 }}>
          Linear: dC/dt = −(Iε)/(FV) &nbsp;|&nbsp; Exponential: dC/dt = −(Iε·C/C₀)/(FV)
        </p>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", display: "grid", gap: 16 }}>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 8 }}>
          {["chart", "comparison", "code"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "7px 16px",
                borderRadius: 6,
                border: "1px solid",
                borderColor: activeTab === tab ? "#38bdf8" : "#1e293b",
                background: activeTab === tab ? "#0c2a3f" : "transparent",
                color: activeTab === tab ? "#38bdf8" : "#475569",
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CHART TAB */}
        {activeTab === "chart" && result && (
          <>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 14px" }}>
              <div style={{ fontSize: 10, color: "#475569", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
                Concentration vs Time
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart key={animKey} data={result.data} margin={{ top: 4, right: 16, left: 0, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="time"
                    stroke="#334155"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    label={{ value: "Time (min)", position: "insideBottom", offset: -10, fill: "#475569", fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#334155"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    label={{ value: "mol/m³", angle: -90, position: "insideLeft", offset: 12, fill: "#475569", fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: "#64748b", paddingTop: 8 }}
                    formatter={(val) => val === "linear" ? "Linear model" : "Exponential model"}
                  />
                  <Line type="monotone" dataKey="linear" stroke="#38bdf8" strokeWidth={2} dot={false} strokeDasharray="6 3" animationDuration={600} />
                  <Line type="monotone" dataKey="exponential" stroke="#f97316" strokeWidth={2.5} dot={false} animationDuration={800} />
                </LineChart>
              </ResponsiveContainer>

              {/* Legend explanation */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                {[
                  { color: "#38bdf8", dash: true, label: "Linear model", sub: "Constant removal rate" },
                  { color: "#f97316", dash: false, label: "Exponential model", sub: "Rate slows as conc. drops" },
                ].map(({ color, dash, label, sub }) => (
                  <div key={label} style={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 2, background: color, flexShrink: 0, borderBottom: dash ? `2px dashed ${color}` : "none", opacity: 0.9 }} />
                    <div>
                      <div style={{ fontSize: 11, color, fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Linear — Final Conc.", value: `${result.finalLin} mol/m³`, sub: `${result.removedLin}% removed`, color: "#38bdf8" },
                { label: "Exponential — Final Conc.", value: `${result.finalExp} mol/m³`, sub: `${result.removedExp}% removed`, color: "#f97316" },
              ].map(({ label, value, sub, color }) => (
                <div key={label} style={{ background: "#0f172a", border: `1px solid #1e293b`, borderRadius: 10, padding: "14px 14px" }}>
                  <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: "clamp(14px, 2.5vw, 20px)", fontWeight: 700, color }}>{value}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{sub}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* COMPARISON TAB */}
        {activeTab === "comparison" && result && (
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 16px" }}>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 3, textTransform: "uppercase", marginBottom: 18 }}>
              Model Comparison
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "clamp(11px, 2vw, 13px)" }}>
              <thead>
                <tr>
                  {["Property", "Linear", "Exponential"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #1e293b", color: "#475569", fontWeight: 600, letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["ODE", "−(Iε)/(FV)", "−(Iε·C/C₀)/(FV)"],
                  ["Shape", "Straight line", "Curved / exponential"],
                  ["Rate at start", "Constant", "Fast (high C)"],
                  ["Rate at end", "Same as start", "Slower (low C)"],
                  ["Realism", "Simplified", "More realistic"],
                  [`Final conc.`, `${result.finalLin} mol/m³`, `${result.finalExp} mol/m³`],
                  ["Salt removed", `${result.removedLin}%`, `${result.removedExp}%`],
                  ["Best for", "First estimates", "Academic reports"],
                ].map(([prop, lin, exp], i) => (
                  <tr key={prop} style={{ background: i % 2 === 0 ? "#020817" : "transparent" }}>
                    <td style={{ padding: "9px 10px", color: "#94a3b8", borderBottom: "1px solid #0f172a" }}>{prop}</td>
                    <td style={{ padding: "9px 10px", color: "#38bdf8", borderBottom: "1px solid #0f172a" }}>{lin}</td>
                    <td style={{ padding: "9px 10px", color: "#f97316", borderBottom: "1px solid #0f172a" }}>{exp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 18, padding: "12px 14px", background: "#020817", borderRadius: 8, border: "1px solid #1e293b" }}>
              <div style={{ fontSize: 10, color: "#f97316", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Why does this matter?</div>
              <p style={{ fontSize: 11, color: "#64748b", margin: 0, lineHeight: 1.8 }}>
                In real ED systems, as salt concentration drops, fewer ions are available to carry charge through the membranes.
                The exponential model captures this: removal slows down near zero, which is physically correct.
                This makes the exponential model significantly better for writing reports and impressing professors.
              </p>
            </div>
          </div>
        )}

        {/* CODE TAB */}
        {activeTab === "code" && (
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 16px" }}>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>
              Python Code — Both Models (copy to Google Colab)
            </div>
            <pre style={{
              background: "#020817",
              border: "1px solid #1e293b",
              borderRadius: 8,
              padding: "16px",
              fontSize: "clamp(9px, 1.8vw, 11.5px)",
              color: "#94a3b8",
              overflowX: "auto",
              margin: 0,
              lineHeight: 1.8,
            }}>
{`import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import solve_ivp

# ── Parameters ──────────────────────────
I       = ${params.I}       # Current (A)
epsilon = ${params.epsilon}    # Current efficiency
F       = 96485        # Faraday constant (C/mol)
V       = ${(params.V_L / 1000).toFixed(4)}      # Volume (m³)
C0      = ${params.C0_molL * 1000}        # Initial conc (mol/m³)
t_end   = ${params.t_end_min * 60}      # Total time (s)
t_eval  = np.linspace(0, t_end, 300)

# ── Model 1: Linear (constant rate) ─────
def dCdt_linear(t, C):
    return -(I * epsilon) / (F * V)

# ── Model 2: Exponential (rate depends on C) ──
def dCdt_exp(t, C):
    return -(I * epsilon * (C[0] / C0)) / (F * V)

# ── Solve both ───────────────────────────
sol_lin = solve_ivp(dCdt_linear, [0, t_end],
                    [C0], t_eval=t_eval)
sol_exp = solve_ivp(dCdt_exp,    [0, t_end],
                    [C0], t_eval=t_eval)

# ── Plot ─────────────────────────────────
fig, ax = plt.subplots(figsize=(9, 5))
ax.plot(sol_lin.t/60, sol_lin.y[0],
        'b--', lw=2, label='Linear model')
ax.plot(sol_exp.t/60, sol_exp.y[0],
        'r-',  lw=2.5, label='Exponential model')
ax.set_xlabel('Time (minutes)')
ax.set_ylabel('Salt concentration (mol/m³)')
ax.set_title('Electrodialysis – Linear vs Exponential')
ax.legend()
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

# ── Results ──────────────────────────────
f_lin = max(sol_lin.y[0][-1], 0)
f_exp = max(sol_exp.y[0][-1], 0)
print("── Linear model ──────────────────")
print(f"  Final conc:   {f_lin:.2f} mol/m³")
print(f"  Salt removed: {(1-f_lin/C0)*100:.1f}%")
print("── Exponential model ─────────────")
print(f"  Final conc:   {f_exp:.2f} mol/m³")
print(f"  Salt removed: {(1-f_exp/C0)*100:.1f}%")`}
            </pre>
          </div>
        )}

        {/* Sliders */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "18px 16px" }}>
          <div style={{ fontSize: 10, color: "#475569", letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>
            Parameters
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
            {sliders.map(({ key, label, unit, min, max, step }) => (
              <div key={key}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", background: "#0c1a2e", padding: "1px 7px", borderRadius: 4, border: "1px solid #1e3a5f" }}>
                    {params[key]} {unit}
                  </span>
                </div>
                <input
                  type="range" min={min} max={max} step={step}
                  value={params[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  style={{ width: "100%", accentColor: "#38bdf8", cursor: "pointer" }}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
