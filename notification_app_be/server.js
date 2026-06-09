import express from "express";
import bodyParser from 'body-parser';
import {log} from '../logging_middleware';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(cors());

const notifications = [];

app.get("/health", async (req, res) => {
  await log("backend", "info", "route", "Notification health check called");
  res.status(200).json({ success: true, message: "Notification service running" });
});

app.post("/notifications", async (req, res) => {
  try {
    const { userId, type, title, message } = req.body;

    if (!userId || !type || !title || !message) {
      await log("backend", "warn", "handler", "Missing notification fields");
      return res.status(400).json({
        success: false,
        message: "userId, type, title and message are required",
      });
    }

    const notification = {
      id: notifications.length + 1,
      userId,
      type,
      title,
      message,
      status: "sent",
      createdAt: new Date().toISOString(),
    };

    notifications.push(notification);

    await log(
      "backend",
      "info",
      "service",
      `Notification sent to user ${userId}`
    );

    res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    await log("backend", "error", "controller", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to send notification",
    });
  }
});

app.get("/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userNotifications = notifications.filter(
      (item) => String(item.userId) === String(userId)
    );

    await log(
      "backend",
      "info",
      "service",
      `Fetched notifications for user ${userId}`
    );

    res.status(200).json({
      success: true,
      notifications: userNotifications,
    });
  } catch (error) {
    await log("backend", "error", "controller", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
});

app.listen(PORT, async () => {
  console.log(`Notification app running on port ${PORT}`);
  await log("backend", "info", "service", `Notification app started on ${PORT}`);
});