// ==========================================================
// Angle's Surplus Model of Wealth Exchange
//
// Nischal Regmi
// Southasia Institute for History and Philosophy
// 2026
// ==========================================================


// ----------------------------------------------------------
// Agent class
// ----------------------------------------------------------

class Agent {

    constructor(id, initialWealth) {

        this.id = id;
        this.wealth = initialWealth;

    }

}


// ----------------------------------------------------------
// Gini coefficient
// ----------------------------------------------------------

function calculateGini(wealth) {

    let values = [...wealth].sort((a, b) => a - b);

    let total = values.reduce((a, b) => a + b, 0);

    if (total === 0)
        return 0;

    let n = values.length;

    let numerator = 0;

    for (let i = 0; i < n; i++) {

        numerator += (2 * (i + 1) - n - 1) * values[i];

    }

    return numerator / (n * total);

}



// ----------------------------------------------------------
// Histogram
// ----------------------------------------------------------

let histogramChart = null;

function drawHistogram(wealth) {

    if (histogramChart)
        histogramChart.destroy();

    const binWidth = Math.max(
        1,
        Math.ceil(Math.max(...wealth) / 25)
    );

    const maxWealth = Math.max(...wealth);

    const numberOfBins =
        Math.ceil(maxWealth / binWidth) + 1;

    let histogram =
        new Array(numberOfBins).fill(0);

    wealth.forEach(w => {

        histogram[Math.floor(w / binWidth)]++;

    });

    let labels = [];

    for (let i = 0; i < numberOfBins; i++) {

        labels.push(i * binWidth);

    }

    histogramChart = new Chart(

        document.getElementById("histogram"),

        {

            type: "bar",

            data: {

                labels: labels,

                datasets: [{

                    label: "Number of Agents",

                    data: histogram

                }]

            },

            options: {

                responsive: true,

                plugins: {

                    title: {

                        display: true,

                        text: "Final Wealth Distribution"

                    }

                },

                scales: {

                    x: {

                        title: {

                            display: true,

                            text: "Wealth"

                        }

                    },

                    y: {

                        title: {

                            display: true,

                            text: "Number of Agents"

                        }

                    }

                }

            }

        }

    );

}



// ----------------------------------------------------------
// Gini plot
// ----------------------------------------------------------

let giniChart = null;

function drawGini(giniHistory) {

    if (giniChart)
        giniChart.destroy();

    giniChart = new Chart(

        document.getElementById("giniPlot"),

        {

            type: "line",

            data: {

                labels:
                    giniHistory.map((_, i) => i + 1),

                datasets: [{

                    label: "Gini Coefficient",

                    data: giniHistory,

                    fill: false,

                    tension: 0.15

                }]

            },

            options: {

                responsive: true,

                plugins: {

                    title: {

                        display: true,

                        text: "Gini Coefficient vs Iteration"

                    }

                },

                scales: {

                    x: {

                        title: {

                            display: true,

                            text: "Iteration"

                        }

                    },

                    y: {

                        min: 0,

                        max: 1,

                        title: {

                            display: true,

                            text: "Gini Coefficient"

                        }

                    }

                }

            }

        }

    );

}



// ----------------------------------------------------------
// Main simulation
// ----------------------------------------------------------

function runSimulation() {

    const totalAgents =
        Number(document.getElementById("agents").value);

    const totalIterations =
        Number(document.getElementById("iterations").value);

    const initialWealth =
        Number(document.getElementById("wealth").value);

    const fairness =
        Number(document.getElementById("fairness").value);

    const wealthShare =
        Number(document.getElementById("wealthshare").value);


    // -----------------------------------------
    // Create agents
    // -----------------------------------------

    let agents = [];

    for (let i = 0; i < totalAgents; i++) {

        agents.push(
            new Agent(i, initialWealth)
        );

    }


    let giniHistory = [];


    // -----------------------------------------
    // Main simulation loop
    // -----------------------------------------

    for (let tick = 0; tick < totalIterations; tick++) {

        // Random execution order
        agents.sort(() => Math.random() - 0.5);


        for (let agent of agents) {

            if (agent.wealth <= 0)
                continue;


            // Select another random agent

            let other =
                agents[Math.floor(Math.random() * totalAgents)];


            // Coin toss
            // D = 1 means current agent wins

            let D = (Math.random() < fairness) ? 1 : 0;


            // Wealth before exchange

            let wealthA = agent.wealth;
			let wealthB = other.wealth;

			agent.wealth =
				wealthA
				+ D * wealthShare * wealthB
				- (1 - D) * wealthShare * wealthA;

			other.wealth =
				wealthB
				+ (1 - D) * wealthShare * wealthA
				- D * wealthShare * wealthB;

        }


        let wealth =
            agents.map(a => a.wealth);

        giniHistory.push(
            calculateGini(wealth)
        );

    }
	
	    // -----------------------------------------
    // Display Results
    // -----------------------------------------

    let output = "";

    output += "Final Simulation Results\n\n";

    for (let i = 0; i < Math.min(5, agents.length); i++) {

        output +=
            `Agent ${agents[i].id}: Wealth = ${agents[i].wealth.toFixed(2)}\n`;

    }

    // -----------------------------------------
    // Summary statistics
    // -----------------------------------------

    let wealth = agents.map(a => a.wealth);

    let sorted = [...wealth].sort((a, b) => a - b);

    let mean =
        wealth.reduce((a, b) => a + b, 0) / wealth.length;

    let median;

    if (wealth.length % 2 === 0) {

        median =
            (sorted[wealth.length / 2 - 1] +
             sorted[wealth.length / 2]) / 2;

    }
    else {

        median =
            sorted[Math.floor(wealth.length / 2)];

    }

    let minimum = sorted[0];

    let maximum = sorted[sorted.length - 1];

    let variance = wealth.reduce(
        (sum, x) => sum + (x - mean) ** 2,
        0
    ) / wealth.length;

    let stdDev = Math.sqrt(variance);

    let finalGini =
        giniHistory[giniHistory.length - 1];

    output += "\n";

    output += "Summary Statistics\n";
    output += "------------------------------\n";
    output += `Mean Wealth        : ${mean.toFixed(2)}\n`;
    output += `Median Wealth      : ${median.toFixed(2)}\n`;
    output += `Minimum Wealth     : ${minimum.toFixed(2)}\n`;
    output += `Maximum Wealth     : ${maximum.toFixed(2)}\n`;
    output += `Standard Deviation : ${stdDev.toFixed(2)}\n`;
    output += `Final Gini         : ${finalGini.toFixed(4)}\n`;

    document.getElementById("results").textContent = output;

    // -----------------------------------------
    // Draw charts
    // -----------------------------------------

    drawHistogram(wealth);

    drawGini(giniHistory);

}