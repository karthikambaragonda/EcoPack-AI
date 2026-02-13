function predict() {

    let weight = document.getElementById("weight").value;
    let strength = document.getElementById("strength").value;
    let barrier = document.getElementById("barrier").value;
    let reuse = document.getElementById("reuse").value;

    fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            weight_capacity_score: Number(weight),
            product_strength_req: Number(strength),
            barrier_score: Number(barrier),
            reuse_potential_score: Number(reuse)
        })
    })
        .then(res => res.json())
        .then(data => {

            let tbody = document.querySelector("#result tbody");
            tbody.innerHTML = "";

            data.forEach(mat => {

                let row = `<tr>
<td>${mat.material}</td>
<td>${mat.predicted_cost}</td>
<td>${mat.predicted_co2}</td>
<td>${mat.suitability_score}</td>
</tr>`;

                tbody.innerHTML += row;

            });

        });

}
