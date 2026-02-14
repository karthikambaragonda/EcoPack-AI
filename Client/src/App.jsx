import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Trophy, Leaf, Wallet, Loader2,
  AlertCircle, Sparkles, BarChart3, Package
} from "lucide-react";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell
} from "recharts";

const api = axios.create({
  baseURL: "https://ecopack-ai.azurewebsites.net",
  timeout: 28000
});

/* Skeleton Cards - Modernized */
const SkeletonCard = () => (
  <div className="flex justify-between items-center p-4 border-b border-slate-100 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-200" />
      <div className="h-4 w-32 rounded bg-slate-200" />
    </div>
    <div className="h-4 w-12 rounded bg-slate-200" />
  </div>
);

const InsightSkeleton = () => (
  <div className="mt-6 bg-emerald-50/50 border border-emerald-100 p-5 rounded-xl animate-pulse">
    <div className="h-4 w-32 rounded bg-emerald-200/50 mb-4" />
    <div className="flex gap-3">
      <div className="h-8 w-24 rounded bg-emerald-200/50" />
      <div className="h-8 w-24 rounded bg-emerald-200/50" />
    </div>
  </div>
);

function App() {
  const [weight, setWeight] = useState(5);
  const [strength, setStrength] = useState(5);
  const [barrier, setBarrier] = useState(5);
  const [reuse, setReuse] = useState(5);

  const [materials, setMaterials] = useState([]);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const [co2, setCo2] = useState(0);
  const [cost, setCost] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  const resultRef = useRef(null);

  // Modern Slider Component
  const Slider = ({ label, value, setValue }) => {
    const p = ((value - 1) / 9) * 100;
    return (
      <div className="mb-6 group">
        <label className="flex justify-between text-sm font-medium text-slate-700 mb-2 group-hover:text-emerald-700 transition-colors">
          <span>{label}</span>
          <span className="bg-slate-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold font-mono">
            {Math.round(value)} / 10
          </span>
        </label>
        <div className="relative h-6 flex items-center">
          <div className="absolute w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-150 ease-out"
              style={{ width: `${p}%` }}
            />
          </div>
          <input
            type="range"
            min="1" max="10" step="0.01"
            value={value}
            disabled={loading}
            onChange={(e) => setValue(parseFloat(e.target.value))}
            className="absolute w-full h-full opacity-0 cursor-pointer z-10"
          />
          {/* Custom Thumb Visual */}
          <div
            className="absolute h-5 w-5 bg-white border-2 border-emerald-500 rounded-full shadow-md transition-all duration-150 pointer-events-none"
            style={{ left: `calc(${p}% - 10px)` }}
          />
        </div>
      </div>
    );
  };

  const predict = async () => {
    setError("");
    setLoading(true);
    setRevealed(false);

    try {
      const res = await api.post("/predict", {
        weight_capacity_score: Math.round(weight),
        product_strength_req: Math.round(strength),
        barrier_score: Math.round(barrier),
        reuse_potential_score: Math.round(reuse)
      });

      if (!res.data || res.data.length === 0) throw new Error();

      setMaterials(res.data);
      setSelected({ ...res.data[0] });
      setCo2(res.data[0].predicted_co2);
      setCost(res.data[0].predicted_cost);
    } catch {
      setError("AI Prediction Failed. Please check the connection.");
    }

    setLoading(false);
    setTimeout(() => {
      setRevealed(true);
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-xl">
          <p className="font-semibold mb-1">{label}</p>
          <p className="text-emerald-400">Value: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 selection:bg-emerald-100">

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-1.5 rounded-lg shadow-sm">
              <Package size={20} />
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
              EcoPack<span className="font-light">AI</span>
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full shadow-sm">
            <Sparkles size={14} className="text-emerald-500" />
            Decision Engine Active
          </span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} className="shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">

          {/* LEFT COLUMN: INPUTS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">1</span>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Packaging Requirements
                </h2>
              </div>

              <Slider label="Weight Capacity" value={weight} setValue={setWeight} />
              <Slider label="Strength Requirement" value={strength} setValue={setStrength} />
              <Slider label="Barrier Protection" value={barrier} setValue={setBarrier} />
              <Slider label="Reuse Potential" value={reuse} setValue={setReuse} />

              <div className="mt-8">
                <button
                  onClick={predict}
                  disabled={loading}
                  className={`
                    w-full py-3.5 rounded-xl text-white font-semibold shadow-lg shadow-emerald-500/20
                    flex justify-center items-center gap-2 transition-all duration-300
                    active:scale-[0.98]
                    ${loading
                      ? "bg-slate-300 cursor-not-allowed shadow-none"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl hover:shadow-emerald-500/30"}
                  `}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span className="text-slate-500">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      Generate Recommendation
                      <Sparkles size={16} className="opacity-80" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Visual Decorative Element for Desktop */}
            <div className="hidden lg:block bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50 p-6 rounded-2xl">
              <p className="text-sm text-emerald-800/80 leading-relaxed text-center italic">
                "Optimizing packaging materials can reduce carbon footprint by up to 40% while maintaining product integrity."
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="lg:col-span-7 space-y-6">

            {/* STEP 2: LIST */}
            <div ref={resultRef} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">2</span>
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    AI Recommendations
                  </h2>
                </div>
                {materials.length > 0 && (
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-xs font-medium text-slate-500 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-colors border border-slate-200 hover:border-emerald-200"
                  >
                    {showAll ? "Show Top 3" : "View All Matches"}
                  </button>
                )}
              </div>

              {/* SCROLLABLE CONTAINER: ADDED max-h and overflow */}
              <div className="max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  <div className="space-y-4">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materials
                      .slice(0, showAll ? materials.length : 3)
                      .map((m, i) => {
                        const isSelected = selected?.material === m.material;
                        return (
                          <div
                            key={i}
                            onClick={() => {
                              setSelected({ ...m });
                              setCo2(m.predicted_co2);
                              setCost(m.predicted_cost);
                            }}
                            className={`
                              group relative flex justify-between items-center p-4 rounded-xl cursor-pointer border transition-all duration-200
                              ${isSelected
                                ? "bg-emerald-50/60 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20"
                                : "bg-white border-slate-100 hover:border-emerald-200 hover:bg-slate-50"}
                            `}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center shadow-sm
                                ${i === 0 ? "bg-yellow-100 text-yellow-600" :
                                  i === 1 ? "bg-slate-100 text-slate-500" :
                                    "bg-orange-50 text-orange-500"}
                              `}>
                                <Trophy size={18} />
                              </div>
                              <div>
                                <h3 className={`font-semibold text-sm ${isSelected ? "text-emerald-900" : "text-slate-700"}`}>
                                  {m.material}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">Match Confidence</p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className={`text-lg font-bold ${isSelected ? "text-emerald-600" : "text-slate-600"}`}>
                                {m.suitability_score}%
                              </span>
                            </div>

                            {/* Active Indicator Bar */}
                            {isSelected && (
                              <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-r-full" />
                            )}
                          </div>
                        );
                      })}
                    {materials.length === 0 && !loading && (
                      <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                        Adjust parameters to generate results
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* STEP 3: INSIGHT */}
              {loading ? (
                <InsightSkeleton />
              ) : selected && (
                <div className="mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-5 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/50 text-emerald-600 text-xs font-bold">3</span>
                    <h3 className="text-xs font-bold uppercase text-emerald-800/60 tracking-wider">
                      Decision Impact
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-emerald-100/50 shadow-sm flex items-center gap-3">
                      <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                        <Leaf size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">CO₂ Emissions</p>
                        <p className="text-sm font-bold text-slate-800">{selected.predicted_co2} <span className="text-xs font-normal text-slate-400">kg/unit</span></p>
                      </div>
                    </div>

                    <div className="flex-1 bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-emerald-100/50 shadow-sm flex items-center gap-3">
                      <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                        <Wallet size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Est. Cost</p>
                        <p className="text-sm font-bold text-slate-800">${selected.predicted_cost} <span className="text-xs font-normal text-slate-400">/unit</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 4: CHART (Full Width) */}
          <div className="lg:col-span-12">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">4</span>
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Sustainability Analysis
                  </h2>
                </div>
                <BarChart3 className="text-slate-300" size={20} />
              </div>

              <div className="w-full h-[300px]">
                <ResponsiveContainer>
                  <BarChart
                    data={[
                      { name: "CO₂ Impact", value: co2, color: "#10b981" }, // emerald-500
                      { name: "Cost Factor", value: cost, color: "#3b82f6" } // blue-500
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barSize={60}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {
                        [
                          { name: "CO₂ Impact", value: co2 },
                          { name: "Cost Factor", value: cost }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#3b82f6"} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;