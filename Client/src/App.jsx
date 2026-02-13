import React, { useState, useRef } from "react";
import axios from "axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

function App() {

  const [weight, setWeight] = useState(5);
  const [strength, setStrength] = useState(5);
  const [barrier, setBarrier] = useState(5);
  const [reuse, setReuse] = useState(5);

  const [materials, setMaterials] = useState([]);
  const [co2, setCo2] = useState(0);
  const [cost, setCost] = useState(0);
  const [loading, setLoading] = useState(false);

  const resultRef = useRef(null);


  // 🔥 Animated Slider
  const Slider = ({ label, value, setValue }) => {

    const percentage = (value - 1) / 9 * 100;

    return (
      <div className="mb-6">

        <label className="flex justify-between mb-1">
          <span>{label}</span>
          <span className="font-bold text-green-600">{value}</span>
        </label>

        <div className="relative">

          <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-300 rounded"></div>

          <div
            className="absolute top-1/2 left-0 h-2 bg-green-500 rounded transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>

          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={value}
            onChange={e => setValue(parseFloat(e.target.value))}
            className="relative w-full appearance-none bg-transparent z-10 accent-green-500"
          />


        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>Low</span>
          <span>High</span>
        </div>

      </div>
    );
  };


  // 🔥 Ranking Bar
  const RankingBar = ({ score, index }) => {

    const percent = score / 5 * 100;

    const colors = [
      "bg-green-600",
      "bg-green-500",
      "bg-green-400"
    ];

    return (
      <div className="w-full bg-gray-200 rounded h-4 mt-2 overflow-hidden">

        <div
          className={`${colors[index]} h-4 transition-all duration-700`}
          style={{ width: `${percent}%` }}
        >
        </div>

      </div>
    );
  };


  // 🔥 Predict
  const predict = async () => {

    setLoading(true);

    let res = await axios.post(
      "http://127.0.0.1:5000/predict",
      {
        weight_capacity_score: Number(weight),
        product_strength_req: Number(strength),
        barrier_score: Number(barrier),
        reuse_potential_score: Number(reuse)
      });

    setMaterials(res.data);
    setCo2(res.data[0].predicted_co2);
    setCost(res.data[0].predicted_cost);
    setLoading(false);

    // Smooth Scroll
    setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth"
      });
    }, 300);

  };
  const CustomTooltip = ({ active, payload }) => {

    if (active && payload && payload.length) {

      return (
        <div className="bg-white p-3 shadow rounded text-sm">

          <p className="font-bold">
            {payload[0].payload.name}
          </p>

          <p>
            Score: {payload[0].value}
          </p>

          <p className="text-green-600">
            {payload[0].payload.info}
          </p>

        </div>
      );
    }

    return null;
  };
  const getCostLabel = (val) => {

    if (val <= 2.8)
      return { text: "Good", color: "text-green-600" };

    if (val <= 3.8)
      return { text: "Moderate", color: "text-yellow-500" };

    return { text: "Poor", color: "text-red-500" };

  };


  const getCO2Label = (val) => {

    if (val <= 55)
      return { text: "Good", color: "text-green-600" };

    if (val <= 70)
      return { text: "Moderate", color: "text-yellow-500" };

    return { text: "Poor", color: "text-red-500" };

  };



  return (

    <div className="bg-gray-100 min-h-screen p-10">

      <h1 className="text-4xl font-bold text-center text-green-700 mb-2">
        EcoPackAI
      </h1>

      <p className="text-center text-gray-600 mb-8">
        AI Based Sustainable Packaging Recommendation System
      </p>

      <div className="grid md:grid-cols-2 gap-10">

        {/* INPUT PANEL */}

        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-bold mb-4 text-green-600">
            Product Requirements
          </h2>

          <Slider label="Weight Capacity Required" value={weight} setValue={setWeight} />
          <Slider label="Product Strength Requirement" value={strength} setValue={setStrength} />
          <Slider label="Barrier Protection Needed" value={barrier} setValue={setBarrier} />
          <Slider label="Reuse Potential" value={reuse} setValue={setReuse} />

          <button
            onClick={predict}
            className="bg-green-500 text-white w-full py-2 rounded hover:bg-green-600 transition-all">

            {loading ? "Predicting..." : "Recommend Packaging"}

          </button>

        </div>

        {/* OUTPUT PANEL */}

        <div className="bg-white p-6 rounded-xl shadow" ref={resultRef}>

          <h2 className="text-xl font-bold mb-4 text-green-600">
            Recommended Materials
          </h2>

          <div className="space-y-6">

            {materials?.map((m, i) => (
              <div
                key={i}
                className={`p-4 rounded shadow transition-all duration-700
${i === 0
                    ? "bg-green-100 ring-4 ring-green-400 animate-pulse"
                    : "bg-gray-50"
                  }`}>

                <div className="flex justify-between">
                  <h3 className="font-bold text-lg">
                    #{i + 1} {m.material}
                  </h3>
                  <span className="text-green-600">
                    Suitability: {m.suitability_score}
                  </span>
                </div>

                <p className="text-sm mt-2">
                  Cost Score: {m.predicted_cost}
                </p>

                <p className="text-sm">
                  CO₂ Score: {m.predicted_co2}
                </p>

                <RankingBar score={m.suitability_score} index={i} />

              </div>
            ))}

          </div>

        </div>

      </div>

      {/* ANALYTICS */}

      <div className="mt-10 bg-white p-6 rounded shadow">

        <h2 className="text-xl font-bold mb-4 text-green-600">
          Sustainability Impact Analysis
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          This chart shows estimated environmental impact and packaging cost
          for the top recommended material. Lower values indicate better
          sustainability and affordability.
        </p>

        <BarChart
          width={500}
          height={300}
          data={[
            {
              name: "Environmental Impact (CO₂)",
              value: co2,
              info: "Lower CO₂ Emission = Environment Friendly"
            },
            {
              name: "Packaging Cost",
              value: cost,
              info: "Lower Cost = Economical Packaging"
            }
          ]}
        >

          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#16a34a" />

        </BarChart>
        <div className="mt-4 flex justify-around">

          <div className="text-center">

            <p className="font-bold">
              Environmental Impact
            </p>

            <p className={`text-lg ${getCO2Label(co2).color}`}>
              {getCO2Label(co2).text}
            </p>

          </div>

          <div className="text-center">

            <p className="font-bold">
              Packaging Cost
            </p>

            <p className={`text-lg ${getCostLabel(cost).color}`}>
              {getCostLabel(cost).text}
            </p>

          </div>

        </div>

        <p className="text-gray-500 text-sm mt-4">

          Environmental Impact Score represents estimated carbon footprint
          generated during packaging production.

          Packaging Cost Score represents material affordability level.

          Lower values indicate better sustainability and cost efficiency.

        </p>

      </div>
</div>
  );
}

export default App;
