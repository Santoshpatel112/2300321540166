const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");
const { log } = require("../logging_middleware/index.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(cors());


let localNotifications = [];

const PRIORITY_WEIGHTS = {
    'Placement': 3,
    'Result': 2,
    'Event': 1
};

app.get("/health", async (req, res) => {
    await log("backend", "info", "route", "Notification health check called");
    res.status(200).json({ success: true, message: "Notification service running" });
});


app.get("/notifications/priority/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        // 1. Fetch from external Test Server API
        let externalNotifications = [];
        try {
            const response = await axios.get(`http://4.224.186.213/evaluation-service/notifications`, {
                headers: {
                    'Authorization': `Bearer ${process.env.LOG_AUTH_TOKEN}`
                }
            });
            externalNotifications = response.data.notifications || [];
        } catch (err) {
            console.error("External API fetch failed, falling back to local data only.");
        }

        // 2. Filter local and external for the specific user
        const userLocal = localNotifications.filter(n => String(n.userId) === String(userId));
        const combined = [...userLocal, ...externalNotifications];

        // 3. Apply Priority Logic: Score = (Weight) * (Recency Factor)
        // Since we don't have a complex decay function, we sort by Weight first, then Timestamp
        const scored = combined.map(n => {
            const weight = PRIORITY_WEIGHTS[n.type] || 0;
            const timestamp = new Date(n.timestamp || n.createdAt || n.Timestamp).getTime();
            return { ...n, score: weight, time: timestamp };
        });

        const sorted = scored.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score; // Higher weight first
            return b.time - a.time; // Then newer first
        });

        // 4. Return Top N
        const topN = sorted.slice(0, limit);

        await log("backend", "info", "handler", `Priority inbox fetched for user ${userId}`);
        res.status(200).json({
            success: true,
            count: topN.length,
            notifications: topN
        });

    } catch (error) {
        await log("backend", "error", "controller", `Priority inbox failed: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post("/notifications", async (req, res) => {
    try {
        const { userId, type, title, message } = req.body;

        if (!userId || !type || !title || !message) {
            await log("backend", "error", "handler", "Missing fields in notification request");
            return res.status(400).json({ error: 'userId, type, title, and message are required' });
        }

        const notification = {
            id: localNotifications.length + 1,
            userId,
            type,
            title,
            message,
            status: "sent",
            createdAt: new Date().toISOString()
        };

        localNotifications.push(notification);

        await log("backend", "info", "handler", `Notification created for user ${userId}`);
        res.status(201).json({ success: true, notification });
    } catch (error) {
        await log("backend", "error", "controller", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, async () => {
    console.log(`Notification app running on port ${PORT}`);
    await log("backend", "info", "service", `Notification app started on ${PORT}`);
});
