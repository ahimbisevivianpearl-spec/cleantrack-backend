const mysql = require("mysql2/promise");
require("dotenv").config();

// A connection pool lets the app reuse database connections efficiently.
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cleantrack_uganda",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
const express = require('express');
const router = express.Router();
const { createSchedule, getSchedules, deleteSchedule } = require('../controllers/schedulesController');

router.post('/', createSchedule);
router.get('/:userId', getSchedules);
router.delete('/:id', deleteSchedule);

module.exports = router;

const db = require('../db');

exports.createSchedule = async (req, res) => {
  const { user_id, frequency, day_of_week, time } = req.body;
  try {
    await db.query(
      "INSERT INTO pickup_schedules (user_id, frequency, day_of_week, time) VALUES (?,?,?,?)",
      [user_id, frequency, day_of_week, time]
    );
    res.status(201).json({ message: "Schedule created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSchedules = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM pickup_schedules WHERE user_id = ?", [req.params.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    await db.query("DELETE FROM pickup_schedules WHERE id = ?", [req.params.id]);
    res.json({ message: "Schedule deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getHistory = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM pickups WHERE user_id = ? AND completed_at IS NOT NULL",
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
router.get('/history/:userId', pickupsController.getHistory);

const nodemailer = require('nodemailer');
const twilio = require('twilio');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

exports.sendEmail = async (to, subject, text) => {
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
};

exports.sendSMS = async (to, text) => {
  await client.messages.create({ body: text, from: process.env.TWILIO_PHONE, to });
};
const notificationService = require('../services/notificationService');

exports.schedulePickup = async (req, res) => {
  const { user_id, date, time, email, phone } = req.body;
  try {
    await db.query("INSERT INTO pickups (user_id, date, time) VALUES (?,?,?)", [user_id, date, time]);
    await notificationService.sendEmail(email, "Pickup Scheduled", `Your pickup is scheduled for ${date} at ${time}`);
    await notificationService.sendSMS(phone, `Pickup scheduled for ${date} at ${time}`);
    res.status(201).json({ message: "Pickup scheduled and notifications sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
import React, { useState } from 'react';
import axios from 'axios';

export default function RecurringPickupForm({ userId }) {
  const [frequency, setFrequency] = useState('weekly');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/schedules', { user_id: userId, frequency, day_of_week: dayOfWeek, time });
    alert('Recurring pickup scheduled!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Recurring Pickup</h3>
      <label>Frequency:</label>
      <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>

      <label>Day of Week:</label>
      <input type="text" value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} />

      <label>Time:</label>
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

      <button type="submit">Save Schedule</button>
    </form>
  );
}
import React, { useState } from 'react';
import axios from 'axios';

export default function NotificationSettings({ userId }) {
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const saveSettings = async () => {
    await axios.post('/api/users/notifications', { user_id: userId, emailEnabled, smsEnabled });
    alert('Notification settings updated!');
  };

  return (
    <div>
      <h3>Notification Settings</h3>
      <label>
        <input type="checkbox" checked={emailEnabled} onChange={() => setEmailEnabled(!emailEnabled)} />
        Email Notifications
      </label>
      <label>
        <input type="checkbox" checked={smsEnabled} onChange={() => setSmsEnabled(!smsEnabled)} />
        SMS Notifications
      </label>
      <button onClick={saveSettings}>Save</button>
    </div>
  );
}
import React, { useState } from 'react';
import axios from 'axios';

export default function NotificationSettings({ userId }) {
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const saveSettings = async () => {
    await axios.post('/api/users/notifications', { user_id: userId, emailEnabled, smsEnabled });
    alert('Notification settings updated!');
  };

  return (
    <div>
      <h3>Notification Settings</h3>
      <label>
        <input type="checkbox" checked={emailEnabled} onChange={() => setEmailEnabled(!emailEnabled)} />
        Email Notifications
      </label>
      <label>
        <input type="checkbox" checked={smsEnabled} onChange={() => setSmsEnabled(!smsEnabled)} />
        SMS Notifications
      </label>
      <button onClick={saveSettings}>Save</button>
    </div>
  );
}
import React, { useState } from 'react';
import axios from 'axios';

export default function NotificationSettings({ userId }) {
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const saveSettings = async () => {
    await axios.post('/api/users/notifications', { user_id: userId, emailEnabled, smsEnabled });
    alert('Notification settings updated!');
  };

  return (
    <div>
      <h3>Notification Settings</h3>
      <label>
        <input type="checkbox" checked={emailEnabled} onChange={() => setEmailEnabled(!emailEnabled)} />
        Email Notifications
      </label>
      <label>
        <input type="checkbox" checked={smsEnabled} onChange={() => setSmsEnabled(!smsEnabled)} />
        SMS Notifications
      </label>
      <button onClick={saveSettings}>Save</button>
    </div>
  );
}
vimport React, { useState } from 'react';
import axios from 'axios';

export default function NotificationSettings({ userId }) {
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const saveSettings = async () => {
    await axios.post('/api/users/notifications', { user_id: userId, emailEnabled, smsEnabled });
    alert('Notification settings updated!');
  };

  return (
    <div>
      <h3>Notification Settings</h3>
      <label>
        <input type="checkbox" checked={emailEnabled} onChange={() => setEmailEnabled(!emailEnabled)} />
        Email Notifications
      </label>
      <label>
        <input type="checkbox" checked={smsEnabled} onChange={() => setSmsEnabled(!smsEnabled)} />
        SMS Notifications
      </label>
      <button onClick={saveSettings}>Save</button>
    </div>
  );
}
