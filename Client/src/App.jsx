import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Trophy, Leaf, Wallet, Loader2,
  AlertCircle, Sparkles
} from "lucide-react";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
  timeout: 28000
});

/* Skeleton Cards */

const SkeletonCard = () => (
  <div className="flex justify-between items-center p-3 border-b animate-pulse">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded-full bg-gray-300" />
      <div className="h-3 w-24 bg-gray-300 rounded" />
    </div>
    <div className="h-3 w-10 bg-gray-300 rounded" />
  </div>
);

const InsightSkeleton = () => (
  <div className="mt-4 bg-green-50 p-4 rounded-lg animate-pulse">
    <div className="h-3 w-32 bg-gray-300 rounded mb-3" />
    <div className="flex gap-4">
      <div className="h-6 w-20 bg-green-200 rounded" />
      <div className="h-6 w-20 bg-blue-200 rounded" />
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

  const [co2, setCo2] = useState(0);
  const [cost, setCost] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  const resultRef = useRef(null);

  const Slider = ({ label, value, setValue }) => {
    const p = (value - 1) / 9 * 100;
    return (
      <div className="mb-5">
        <label className="flex justify-between text-sm mb-1">
          <span>{label}</span>
          <span className="text-green-600 font-bold">{Math.round(value)}</span>
        </label>
        <div className="relative">
          <div className="absolute top-1/2 w-full h-2 bg-gray-200 rounded" />
          <div className="absolute top-1/2 h-2 bg-green-500 rounded transition-all"
            style={{ width: `${p}%` }} />
          <input type="range"
            min="1" max="10" step="0.01"
            value={value}
            disabled={loading}
            onChange={e => setValue(parseFloat(e.target.value))}
            className="relative w-full appearance-none bg-transparent accent-green-500" />
        </div>
      </div>
    );
  };

  const predict = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/predict", {
        weight_capacity_score: Math.round(weight),
        product_strength_req: Math.round(strength),
        barrier_score: Math.round(barrier),
        reuse_potential_score: Math.round(reuse)
      });
      if (!res.data || res.data.length === 0)
        throw new Error();
      setMaterials(res.data);
      setSelected({ ...res.data[0] });
      setCo2(res.data[0].predicted_co2);
      setCost(res.data[0].predicted_cost);
    } catch {
      setError("AI Prediction Failed");
    }
    setLoading(false);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">

      {/* NAVBAR */}
      <div className="backdrop-blur bg-white/80 shadow px-6 py-3 flex justify-between items-center">
        <h1 className="text-lg font-bold text-green-700">EcoPackAI</h1>
        <span className="flex items-center gap-1 text-xs bg-green-100 px-2 py-1 rounded">
          <Sparkles size={14} /> AI Decision Engine
        </span>
      </div>

      <div className="p-6">

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">

          {/* STEP 1 */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xs uppercase text-gray-400 mb-2">
              Step 1 — Packaging Requirements
            </h2>

            <Slider label="Weight Capacity" value={weight} setValue={setWeight} />
            <Slider label="Strength Requirement" value={strength} setValue={setStrength} />
            <Slider label="Barrier Protection" value={barrier} setValue={setBarrier} />
            <Slider label="Reuse Potential" value={reuse} setValue={setReuse} />

            <button
              onClick={predict}
              disabled={loading}
              className={`w-full py-2 rounded text-white flex justify-center items-center gap-2
              ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>

              {loading ?
                <Loader2 className="animate-spin" size={16} /> :
                "Generate AI Recommendation"}

            </button>
          </div>

          {/* STEP 2 */}
          <div ref={resultRef} className="bg-white p-6 rounded-xl shadow">

            <div className="flex justify-between mb-2">
              <h2 className="text-xs uppercase text-gray-400">
                Step 2 — AI Recommendations
              </h2>
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-xs border px-2 py-1 rounded hover:bg-gray-100">
                {showAll ? "Top 3" : "Show All"}
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto">

              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                materials
                  .slice(0, showAll ? materials.length : 3)
                  .map((m, i) => (

                    <div
                      key={i}
                      onClick={() => {
                        setSelected({ ...m });
                        setCo2(m.predicted_co2);
                        setCost(m.predicted_cost);
                      }}
                      className={`flex justify-between items-center p-3 border-b cursor-pointer
                      hover:bg-gray-50
                      ${selected?.material === m.material ? "bg-green-50" : ""}`}
                    >

                      <div className="flex items-center gap-2">
                        <Trophy
                          className={
                            i === 0
                              ? "text-yellow-500"
                              : i === 1
                                ? "text-gray-400"
                                : "text-orange-500"
                          }
                        />
                        <span className="text-sm">{m.material}</span>
                      </div>

                      <span className="text-xs text-gray-500">
                        Score {m.suitability_score}
                      </span>

                    </div>

                  ))
              )}

            </div>

            {/* STEP 3 */}
            {loading ? (
              <InsightSkeleton />
            ) : selected && (
              <div className="mt-4 bg-green-50 p-4 rounded-lg">

                <h3 className="text-xs uppercase text-gray-400 mb-2">
                  Step 3 — Decision Insight
                </h3>

                <p className="text-sm font-semibold">{selected.material}</p>

                <div className="flex gap-4 mt-2 text-xs">

                  <span className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded">
                    <Leaf size={12} /> CO₂: {selected.predicted_co2}
                  </span>

                  <span className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded">
                    <Wallet size={12} /> Cost: {selected.predicted_cost}
                  </span>

                </div>

              </div>
            )}

          </div>

        </div>

        {/* STEP 4 */}
        <div className="mt-6 bg-white p-6 rounded-xl shadow">

          <h2 className="text-xs uppercase text-gray-400 mb-2">
            Step 4 — Sustainability Impact
          </h2>

          <div className="w-full h-[250px]">

            <ResponsiveContainer>
              <BarChart
                data={[
                  { name: "CO₂", value: co2 },
                  { name: "Cost", value: cost }
                ]}>

                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#16a34a" />

              </BarChart>
            </ResponsiveContainer>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;
