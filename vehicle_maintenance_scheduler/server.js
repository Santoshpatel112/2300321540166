const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios");
const { log } = require("../logging_middleware/index.js");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;
const BASE_URL =
  process.env.EVALUATION_BASE_URL || "http://4.224.186.213/evaluation-service";

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.LOG_AUTH_TOKEN}`,
    "Content-Type": "application/json",
  };
}

async function fetchDepots() {
  const response = await axios.get(`${BASE_URL}/depots`, {
    headers: authHeaders(),
  });
  return response.data && Array.isArray(response.data.depots)
    ? response.data.depots
    : [];
}

async function fetchVehicles() {
  const response = await axios.get(`${BASE_URL}/vehicles`, {
    headers: authHeaders(),
  });
  return response.data && Array.isArray(response.data.vehicles)
    ? response.data.vehicles
    : [];
}

function normalizeVehicle(item, index) {
  return {
    id:
      item.vehicleId ||
      item.taskId ||
      item.TaskID ||
      item.id ||
      `vehicle-${index + 1}`,
    duration: Number(item.duration || item.Duration || 0),
    impact: Number(item.impact || item.Impact || 0),
  };
}

function normalizeVehicles(vehicles) {
  return vehicles
    .map(normalizeVehicle)
    .filter((vehicle) => vehicle.duration > 0 && vehicle.impact >= 0);
}

function getDepotId(depot, index) {
  return depot.dept || depot.id || depot.Dept || `depot-${index + 1}`;
}

function getMechanicHours(depot) {
  return Number(
    depot.mechanicHours || depot.MechanicHours || depot.mechanicsHours || 0
  );
}

function selectBestVehicles(vehicles, maxHours) {
  const capacity = Math.max(0, Math.floor(maxHours));
  const n = vehicles.length;
  const dp = Array.from({ length: n + 1 }, () =>
    Array(capacity + 1).fill(0)
  );

  for (let i = 1; i <= n; i += 1) {
    const { duration, impact } = vehicles[i - 1];

    for (let hours = 0; hours <= capacity; hours += 1) {
      if (duration <= hours) {
        dp[i][hours] = Math.max(
          dp[i - 1][hours],
          dp[i - 1][hours - duration] + impact
        );
      } else {
        dp[i][hours] = dp[i - 1][hours];
      }
    }
  }

  const selected = [];
  let hours = capacity;

  for (let i = n; i > 0; i -= 1) {
    if (dp[i][hours] !== dp[i - 1][hours]) {
      selected.push(vehicles[i - 1]);
      hours -= vehicles[i - 1].duration;
    }
  }

  selected.reverse();

  return {
    selected,
    totalImpact: selected.reduce((sum, item) => sum + item.impact, 0),
    totalDuration: selected.reduce((sum, item) => sum + item.duration, 0),
  };
}

async function buildPlans() {
  const depots = await fetchDepots();
  const vehiclesRaw = await fetchVehicles();
  const vehicles = normalizeVehicles(vehiclesRaw);

  return depots.map((depot, index) => {
    const mechanicHours = getMechanicHours(depot);
    const best = selectBestVehicles(vehicles, mechanicHours);

    return {
      depotId: getDepotId(depot, index),
      mechanicHours,
      totalImpact: best.totalImpact,
      totalDuration: best.totalDuration,
      selectedVehicles: best.selected,
    };
  });
}

app.get("/health", async (req, res) => {
  await log("backend", "info", "route", "Health endpoint called");
  res.status(200).json({ success: true, message: "Service is running" });
});

app.get("/plan", async (req, res) => {
  try {
    await log("backend", "info", "service", "Maintenance planning started");
    const plans = await buildPlans();
    await log("backend", "info", "controller", "Maintenance planning completed");

    return res.status(200).json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (error) {
    await log(
      "backend",
      "error",
      "controller",
      `Planning failed: ${error.message}`
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate maintenance plan",
      error: error.response ? error.response.data : error.message,
    });
  }
});

app.listen(PORT, async () => {
  console.log(`Vehicle maintenance scheduler running on port ${PORT}`);
  await log(
    "backend",
    "info",
    "service",
    `Scheduler started on port ${PORT}`
  );
});
