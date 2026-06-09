import express from "express";
import bodyParser from "body-parser";


const app=express();


app.use(bodyParser.json());

let maintenanceSchedules = [];

// Create a maintenance schedule
app.post('/schedule', async (req, res) => {
    const { vehicleId, serviceType, date } = req.body;

    if (!vehicleId || !serviceType || !date) {
        await log('backend', 'error', 'handler', 'Missing required fields in schedule request');
        return res.status(400).json({ error: 'vehicleId, serviceType, and date are required' });
    }

    const newSchedule = {
        id: maintenanceSchedules.length + 1,
        vehicleId,
        serviceType,
        date,
        status: 'scheduled'
    };

    maintenanceSchedules.push(newSchedule);

    await log('backend', 'info', 'handler', `Maintenance scheduled for vehicle ${vehicleId}`);
    res.status(201).json(newSchedule);
});

// Get all schedules
app.get('/schedules', async (req, res) => {
    await log('backend', 'info', 'handler', 'Fetching all maintenance schedules');
    res.json(maintenanceSchedules);
});


app.patch('/schedule/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const schedule = maintenanceSchedules.find(s => s.id === parseInt(id));

    if (!schedule) {
        await log('backend', 'warn', 'handler', `Schedule with ID ${id} not found`);
        return res.status(404).json({ error: 'Schedule not found' });
    }

    schedule.status = status;
    await log('backend', 'info', 'handler', `Schedule ${id} status updated to ${status}`);
    res.json(schedule);
});

app.listen(port, () => {
    console.log(`Vehicle Maintenance Scheduler running at port ${port}`);
    log('backend', 'info', 'controller', 'Vehicle Maintenance Scheduler service started');
});
