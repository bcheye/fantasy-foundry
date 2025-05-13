// === Utilities ===
const rawData = window.leagueData || [];
const gameweeks = [...new Set(rawData.map(r => r["GameweekWinners.gameweek"]))].sort((a, b) => Number(a) - Number(b));

function groupBy(arr, keyFn) {
  return arr.reduce((acc, row) => {
    const key = keyFn(row);
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});
}

// === Color Map for Consistency ===
const entryColors = {};
const getColor = (name) => {
  if (!entryColors[name]) {
    const hue = Object.keys(entryColors).length * 137.508;
    entryColors[name] = `hsl(${hue % 360}, 60%, 65%)`;
  }
  return entryColors[name];
};

// === Dynamic Line Charts: Points and Rank ===
let pointsChart, ranksChart;

function drawFilteredCharts(selectedEntries) {
  const filtered = rawData.filter(r => selectedEntries.includes(r["GameweekWinners.entryName"]));
  const pointsByEntry = groupBy(filtered, r => r["GameweekWinners.entryName"]);

  if (pointsChart) pointsChart.destroy();
  if (ranksChart) ranksChart.destroy();

  // Points Line Chart
  pointsChart = new Chart(document.getElementById('linePoints').getContext('2d'), {
    type: 'line',
    data: {
      labels: gameweeks,
      datasets: Object.entries(pointsByEntry).map(([name, rows]) => ({
        label: name,
        data: gameweeks.map(gw => {
          const found = rows.find(r => r["GameweekWinners.gameweek"] === gw);
          return found ? found["GameweekWinners.points"] : null;
        }),
        tension: 0.3,
        fill: false,
        borderColor: getColor(name),
        backgroundColor: getColor(name),
      }))
    },
    options: {
      spanGaps: true,
      plugins: { title: { display: true, text: 'Points per Gameweek' } },
      scales: {
        y: { title: { display: true, text: 'Points' } },
        x: { title: { display: true, text: 'Gameweek' } }
      }
    }
  });

  // Rank Line Chart
  ranksChart = new Chart(document.getElementById('lineRanks').getContext('2d'), {
    type: 'line',
    data: {
      labels: gameweeks,
      datasets: Object.entries(pointsByEntry).map(([name, rows]) => ({
        label: name,
        data: gameweeks.map(gw => {
          const found = rows.find(r => r["GameweekWinners.gameweek"] === gw);
          return found ? found["GameweekWinners.rank"] : null;
        }),
        tension: 0.3,
        fill: false,
        borderColor: getColor(name),
        backgroundColor: getColor(name),
      }))
    },
    options: {
      spanGaps: true,
      plugins: { title: { display: true, text: 'Rank Over Time (Lower is Better)' } },
      scales: {
        y: { reverse: true, title: { display: true, text: 'Rank' } },
        x: { title: { display: true, text: 'Gameweek' } }
      }
    }
  });
}

// === Entry Filter Initialization ===
let choices;
document.addEventListener("DOMContentLoaded", () => {
  choices = new Choices("#entryFilter", {
    removeItemButton: true,
    placeholderValue: 'Select entries...',
    searchPlaceholderValue: 'Type to search...'
  });

  const grouped = groupBy(rawData, r => r["GameweekWinners.entryName"]);
  const top3 = Object.entries(grouped)
    .map(([name, rows]) => ({ name, total: rows.reduce((sum, r) => sum + r["GameweekWinners.points"], 0) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
    .map(e => e.name);

  choices.setChoiceByValue(top3);
  drawFilteredCharts(top3);

  document.getElementById("applyEntryFilter").addEventListener("click", function () {
    const selected = choices.getValue(true); // get raw values from Choices.js
    if (selected.length) drawFilteredCharts(selected);
  });
});

// === Bar Chart: Gameweek Winners ===
const topScorers = gameweeks.map(gw => {
  const scores = rawData.filter(r => r["GameweekWinners.gameweek"] === gw);
  return scores.reduce((max, r) =>
    r["GameweekWinners.points"] > max.points
      ? { name: r["GameweekWinners.entryName"], points: r["GameweekWinners.points"] }
      : max, { name: "", points: 0 });
});

new Chart(document.getElementById('barWinners').getContext('2d'), {
  type: 'bar',
  data: {
    labels: gameweeks,
    datasets: [{
      label: 'Top Scorer',
      data: topScorers.map(s => s.points),
      backgroundColor: 'rgba(255, 205, 86, 0.7)'
    }]
  },
  options: {
    plugins: {
      title: { display: true, text: 'Gameweek Winners (Top Points)' },
      tooltip: {
        callbacks: {
          label: (ctx) => `${topScorers[ctx.dataIndex].name}: ${ctx.raw} pts`
        }
      }
    },
    scales: {
      y: { beginAtZero: true },
      x: { title: { display: true, text: 'Gameweek' } }
    }
  }
});

// === Heatmap ===
const heatmapData = groupBy(rawData, r => r["GameweekWinners.entryName"]);
new Chart(document.getElementById('heatmap').getContext('2d'), {
  type: 'bar',
  data: {
    labels: gameweeks,
    datasets: Object.entries(heatmapData).map(([name, rows]) => ({
      label: name,
      data: gameweeks.map(gw => {
        const found = rows.find(r => r["GameweekWinners.gameweek"] === gw);
        return found ? found["GameweekWinners.points"] : 0;
      }),
      stack: 'heatmap',
      backgroundColor: getColor(name)
    }))
  },
  options: {
    plugins: { title: { display: true, text: 'Heatmap of Entry Points by Gameweek' } },
    responsive: true,
    scales: {
      x: { stacked: true },
      y: { stacked: true, title: { display: true, text: 'Total Points' } }
    }
  }
});

// === Top-N Leaderboard ===
const topN = 3;
const topNPerGW = groupBy(rawData, r => r["GameweekWinners.gameweek"]);
const leaderboardData = {};

Object.entries(topNPerGW).forEach(([gw, rows]) => {
  rows.sort((a, b) => b["GameweekWinners.points"] - a["GameweekWinners.points"]);
  rows.slice(0, topN).forEach(row => {
    const name = row["GameweekWinners.entryName"];
    if (!leaderboardData[name]) leaderboardData[name] = [];
    leaderboardData[name].push({ gw: parseInt(gw), points: row["GameweekWinners.points"] });
  });
});

new Chart(document.getElementById('topNLeaderboard').getContext('2d'), {
  type: 'line',
  data: {
    labels: gameweeks,
    datasets: Object.entries(leaderboardData).map(([name, scores]) => ({
      label: name,
      data: gameweeks.map(gw => {
        const found = scores.find(s => s.gw === gw);
        return found ? found.points : null;
      }),
      fill: false,
      tension: 0.3,
      borderColor: getColor(name),
      backgroundColor: getColor(name)
    }))
  },
  options: {
    plugins: { title: { display: true, text: 'Top 3 Entries Each Week' } },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Points' } },
      x: { title: { display: true, text: 'Gameweek' } }
    }
  }
});


// === Pagination ===
function paginateTable(tableId, rowsPerPage = 10) {
  const table = document.getElementById(tableId);
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  let currentPage = 1;

  function showPage(page) {
    currentPage = page;
    rows.forEach((row, i) => {
      row.style.display = i >= (page - 1) * rowsPerPage && i < page * rowsPerPage ? "" : "none";
    });
    renderControls();
  }

  function renderControls() {
    let controls = table.nextElementSibling;
    if (!controls || !controls.classList.contains("pagination")) {
      controls = document.createElement("div");
      controls.className = "pagination";
      table.parentNode.insertBefore(controls, table.nextSibling);
    }

    controls.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === currentPage) btn.disabled = true;
      btn.onclick = () => showPage(i);
      controls.appendChild(btn);
    }
  }
  showPage(1);
}


document.addEventListener("DOMContentLoaded", function () {
  paginateTable("standingsTable", 15);
  paginateTable("gameweekTable", 15);
});