import React, { useState, useRef } from "react";
import axios from "axios";
import { Trophy } from "lucide-react";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts";

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
  const [toast, setToast] = useState("");
  const [showAll, setShowAll] = useState(false);

  const resultRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const getCO2Label = (v) => v <= 55 ? { text: "Good 🟢", color: "text-green-600" } :
    v <= 70 ? { text: "Moderate 🟡", color: "text-yellow-500" } :
      { text: "Poor 🔴", color: "text-red-500" };

  const getCostLabel = (v) => v <= 2.8 ? { text: "Good 🟢", color: "text-green-600" } :
    v <= 3.8 ? { text: "Moderate 🟡", color: "text-yellow-500" } :
      { text: "Poor 🔴", color: "text-red-500" };

  const getConfidence = (s) => Math.min(100, Math.round(s * 20));

  const Slider = ({ label, value, setValue }) => {
    const p = (value - 1) / 9 * 100;
    return (
      <div className="mb-6">
        <label className="flex justify-between mb-1 text-sm md:text-base">
          <span>{label}</span>
          <span className="font-bold text-green-600">
            {Math.round(value)}
          </span>
        </label>
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-300 rounded" />
          <div className="absolute top-1/2 left-0 h-2 bg-green-500 rounded transition-all duration-300"
            style={{ width: `${p}%` }} />
          <input
            type="range"
            min="1"
            max="10"
            step="0.01"
            value={value}
            onChange={e => setValue(parseFloat(e.target.value))}
            className="relative w-full appearance-none bg-transparent z-10 accent-green-500"
          />
        </div>
      </div>
    );
  };

  const RankingBar = ({ score, index }) => {
    const percent = score / 5 * 100;
    const c = ["bg-green-600", "bg-green-500", "bg-green-400"];
    return (
      <div className="w-full bg-gray-200 rounded h-3 mt-2 overflow-hidden">
        <div className={`${c[index]} h-3 transition-all duration-700`}
          style={{ width: `${percent}%` }} />
      </div>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 shadow rounded text-xs md:text-sm">
          <p className="font-bold">
            {payload[0].payload.name}
          </p>
          <p>Score: {payload[0].value}</p>
          <p className="text-green-600">
            {payload[0].payload.info}
          </p>
        </div>
      );
    }
    return null;
  };

  const predict = async () => {
    setLoading(true);
    try {
      let res = await axios.post(
        "http://127.0.0.1:5000/predict",
        {
          weight_capacity_score: Math.round(weight),
          product_strength_req: Math.round(strength),
          barrier_score: Math.round(barrier),
          reuse_potential_score: Math.round(reuse)
        });

      if (!res.data || res.data.length === 0) {
        showToast("Prediction Failed ❌");
        setLoading(false);
        return;
      }

      setMaterials(res.data);
      setSelected(res.data[0]);   // AUTO SELECT TOP MATERIAL
      setCo2(res.data[0]?.predicted_co2 || 0);
      setCost(res.data[0]?.predicted_cost || 0);

      showToast("Recommendation Generated ✅");

    } catch {
      showToast("AI Server Error ❌");
    }
    setLoading(false);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };
  const getCO2Impact = (val) => {
    return val <= 55 ? "Low Emission Packaging" :
      val <= 70 ? "Moderate Emission" :
        "High Emission";
  };


  return (

    <div className="bg-gray-100 min-h-screen p-4 md:p-10">

      {toast && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
          {toast}
        </div>
      )}

      <h1 className="text-2xl md:text-4xl font-bold text-center text-green-700 mb-4">
        EcoPackAI
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* INPUT PANEL */}

        <div className="bg-white p-4 md:p-6 rounded-xl shadow">

          <h2 className="text-lg md:text-xl font-bold mb-4 text-green-600">
            Product Requirements
          </h2>

          <Slider label="Weight Capacity" value={weight} setValue={setWeight} />
          <Slider label="Strength Requirement" value={strength} setValue={setStrength} />
          <Slider label="Barrier Protection" value={barrier} setValue={setBarrier} />
          <Slider label="Reuse Potential" value={reuse} setValue={setReuse} />

          <button
            onClick={predict}
            disabled={loading}
            className={`w-full py-2 rounded text-white
${loading ? "bg-gray-400" :
                "bg-green-500 hover:bg-green-600 active:scale-95 transition-all"}`}>
            {loading ? "Predicting..." : "Recommend Packaging"}
          </button>

        </div>

        {/* OUTPUT PANEL */}

        <div
          ref={resultRef}
          className="bg-white p-4 md:p-6 rounded-xl shadow lg:sticky lg:top-5">

          <button
            onClick={() => setShowAll(!showAll)}
            className="mb-3 text-xs md:text-sm bg-blue-500 text-white px-3 py-1 rounded">
            {showAll ? "Show Top 3" : "Show All"}
          </button>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto">

            {(materials?.slice(0, showAll ? materials.length : 3)).map((m, i) => (
              <div
                key={i}
                onClick={() => {
                  setSelected(m);
                  setCo2(m.predicted_co2);
                  setCost(m.predicted_cost);
                }}
                className={`p-3 rounded shadow cursor-pointer
transition-all duration-700
${selected?.material === m.material ? "" :
                  i === 0 -1 ? "bg-grey-100 ring-4 ring-green-400" :
                      "bg-green-100 hover:scale-100"}`}>

                <h3 className="flex items-center gap-2 font-bold text-sm md:text-lg">

                  {/* <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Rank {i + 1}
                  </span> */}
                  <Trophy
                    className={i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-orange-500" :"text-[#16a34a]"} />
                  {m.material}

                </h3>


                {/* <p className="text-xs">
                  Suitability: {m.suitability_score}
                </p> */}

                {/* <p className="text-xs text-blue-600">
                  AI Confidence: {getConfidence(m.suitability_score)}%
                </p> */}

                {/* <RankingBar score={m.suitability_score} index={i} /> */}

              </div>
            ))}

          </div>
 <br />
          {/* 🔥 DETAILS BOX */}
          {materials.length > 0 && (
            <div className="bg-green-50 border border-green-400
p-3 rounded mb-4 text-sm">
             
              <b>AI Recommended Material:</b>
              <><br/></>
              <span className="text-green-700 font-bold ml-2">
                {materials[0]?.material}
              </span>

              <p className="text-xs text-gray-600 mt-1">
                Best balance between sustainability and cost efficiency.
              </p>

            </div>
          )}

          {selected && (
            <div className="mt-6 bg-blue-50 p-4 rounded-xl shadow border border-blue-300">

              <h3 className="font-bold text-lg mb-3 text-blue-600">
                Material Details
              </h3>

              <p><b>Material:</b> {selected.material}</p>
              <p><b>Predicted CO₂ Score:</b> {selected.predicted_co2}</p>
              <p><b>Predicted Cost Score:</b> {selected.predicted_cost}</p>
              <p><b>Suitability Score:</b> {selected.suitability_score}</p>
              <p className="text-xs text-gray-600">
                Impact: {getCO2Impact(selected.predicted_co2)}
              </p>

              {/* <RankingBar score={selected.suitability_score} index={0} /> */}

            </div>
          )}

        </div>

      </div>

      {/* GRAPH */}

      <div className="mt-6 bg-white p-4 rounded shadow">

        <h2 className="text-lg font-bold mb-4 text-green-600">
          Sustainability Impact
        </h2>

        <div className="w-full h-[250px]">

          <ResponsiveContainer>

            <BarChart
              data={[
                { name: "CO₂ Impact", value: co2, info: "Lower = Sustainable" },
                { name: "Cost", value: cost, info: "Lower = Affordable" }
              ]}>

              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#16a34a" />

            </BarChart>

          </ResponsiveContainer>

        </div>

        <div className="mt-4 flex justify-around">

          <div className="text-center">
            <p className="font-bold">Environmental Impact</p>
            <p className={`${getCO2Label(co2).color}`}>
              {getCO2Label(co2).text}
            </p>
          </div>

          <div className="text-center">
            <p className="font-bold">Packaging Cost</p>
            <p className={`${getCostLabel(cost).color}`}>
              {getCostLabel(cost).text}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default App;
