import express from "express";
import bodyParser from 'body-parser';
import {log} from '../logging_middleware';

const app = express();
const port = 3002;

app.use(bodyParser.json());

let notifications = [];

// Send a notification
app.post('/send', async (req, res) => {
    const { userId, type, content } = req.body;

    if (!userId || !type || !content) {
        await log('backend', 'error', 'handler', 'Missing fields in notification request');
        return res.status(400).json({ error: 'userId, type, and content are required' });
    }

    const notification = {
        id: notifications.length + 1,
        userId,
        type,
        content,
        status: 'sent',
        timestamp: new Date()
    };

    notifications.push(notification);

    await log('backend', 'info', 'handler', `Notification sent to user ${userId} via ${type}`);
    res.status(201).json(notification);
});

// Get notification history for a user
app.get('/history/:userId', async (req, res) => {
    const { userId } = req.params;
    const userHistory = notifications.filter(n => n.userId === userId);
    
    await log('backend', 'info', 'handler', `Fetching notification history for user ${userId}`);
    res.json(userHistory);
});

app.listen(port, () => {
    console.log(`Notification App BE running at http://localhost:${port}`);
    log('backend', 'info', 'controller', 'Notification App BE service started');
});
