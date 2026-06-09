import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app=express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;
const BASE_URL =
  process.env.EVALUATION_BASE_URL||"http://4.224.186.213/evaluation-service";

const authHeaders = () => ({
  Authorization: `Bearer ${process.env.LOG_AUTH_TOKEN}`,
  "Content-Type": "application/json",
});

async function fetchDepots() {
  const response = await axios.get(`${BASE_URL}/depts`, {
    headers: authHeaders(),
  });
  return response.data?.depts || [];
}

async function fetchVehicles() {
  const response = await axios.get(`${BASE_URL}/vehicles`, {
    headers: authHeaders(),
  });
  return response.data?.vehicles || [];
}

function normalizeVehicles(vehicles) {
  return vehicles.map((item, index) => ({
    id: item.vehicleId || item.taskId || item.TaskID || `vehicle-${index + 1}`,
    duration: Number(item.duration || item.Duration || 0),
    impact: Number(item.impact || item.Impact || 0),
  }));
}

function selectBestVehicles(vehicles, maxHours) {
  const n = vehicles.length;
  const dp = Array.from({ length: n + 1 }, () =>
    Array(maxHours + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    const { duration, impact } = vehicles[i - 1];

    for (let hours = 0; hours <= maxHours; hours++) {
      if (duration <= hours) {
        dp[i][hours] = Math.max(
          dp[i-1][hours],
          dp[i-1][hours - duration] + impact
        );
      } else {
        dp[i][hours] = dp[i - 1][hours];
      }
    }
  }

  const selected = [];
  let hours = maxHours;

  for (let i = n; i > 0; i--) {
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

app.get("/health", async (req, res) => {
  await log("backend", "info", "route", "Health endpoint called");
  res.status(200).json({ success: true, message: "Service is running" });
});

app.get("/plan", async (req, res) => {
  try {
    await log("backend", "info", "service", "Planning started");

    const depots = await fetchDepots();
    const vehiclesRaw = await fetchVehicles();
    const vehicles = normalizeVehicles(vehiclesRaw);

    const result = depots.map((dept) => {
      const hours = Number(dept.mechanicHours || dept.MechanicHours || 0);
      const best = selectBestVehicles(vehicles, hours);

      return {
        dept: dept.dept || dept.id || dept.Dept || "unknown",
        mechanicHours: hours,
        selectedVehicles: best.selected,
        totalImpact: best.totalImpact,
        totalDuration: best.totalDuration,
      };
    });

    await log("backend", "info", "controller", "Planning completed");

    return res.status(200).json({
      success: true,
      count: result.length,
      result,
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
      error: error.response?.data || error.message,
    });
  }
});



app.listen(PORT,()=>{
    console.log(`app listning on port ${PORT}`);
})



