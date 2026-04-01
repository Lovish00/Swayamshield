import pool from '../config/db.js';

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DOCTOR_DAILY_APPOINTMENT_LIMIT = parseInt(process.env.DOCTOR_DAILY_APPOINTMENT_LIMIT || '20', 10);

function getTodayDateTimeString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Reusable booking validator to enforce core scheduling business rules.
export async function validateAppointmentBooking(req, res, next) {
  try {
    const { doctor_id, date, time } = req.body;
    const patientId = req.user.id;
    
    // Get patient email for debugging
    const patientInfo = await pool.query('SELECT email, full_name FROM users WHERE id = $1', [patientId]);
    const patientEmail = patientInfo.rows[0]?.email || 'unknown';
    const patientName = patientInfo.rows[0]?.full_name || 'unknown';

    console.log(`🔍 Appointment Validation - Patient ID: ${patientId} (${patientEmail}/${patientName}), Date: ${date}, Time: ${time}, Doctor: ${doctor_id}`);

    if (!DATE_ONLY_REGEX.test(date)) {
      return res.status(400).json({ error: 'Invalid appointment date format. Use YYYY-MM-DD.' });
    }

    if (date < getTodayDateString()) {
      return res.status(400).json({ error: 'Appointments cannot be booked for past dates.' });
    }

    // Check if booking for today with past time
    if (date === getTodayDateString()) {
      const currentTime = getTodayDateTimeString();
      if (time < currentTime) {
        return res.status(400).json({ error: 'Cannot book appointments for past times on the same day.' });
      }
    }

    const existingPatientSlot = await pool.query(
      `
        SELECT id, patient_id
        FROM appointments
        WHERE patient_id = $1
          AND date = $2
          AND time = $3
          AND status != 'cancelled'
        LIMIT 1
      `,
      [patientId, date, time]
    );

    if (existingPatientSlot.rows.length > 0) {
      console.log(`❌ SAME Patient ${patientId} (${patientEmail}) already has appointment at ${date} ${time}`);
      return res.status(409).json({ error: 'You already have an appointment scheduled at this time.' });
    }

    // Check if this time slot is booked by ANY patient for the same doctor
    const slotBooked = await pool.query(
      `
        SELECT a.id, a.patient_id, u.email, u.full_name
        FROM appointments a
        JOIN users u ON a.patient_id = u.id
        WHERE a.doctor_id = $1
          AND a.date = $2
          AND a.time = $3
          AND a.status != 'cancelled'
        LIMIT 1
      `,
      [doctor_id, date, time]
    );

    if (slotBooked.rows.length > 0) {
      const bookedByPatientId = slotBooked.rows[0].patient_id;
      const bookedByEmail = slotBooked.rows[0].email;
      const bookedByName = slotBooked.rows[0].full_name;
      
      console.log(`❌ DIFFERENT Patient ${bookedByPatientId} (${bookedByEmail}/${bookedByName}) has appointment at ${date} ${time}. Current patient: ${patientId} (${patientEmail})`);
      
      if (bookedByPatientId === patientId) {
        return res.status(409).json({ error: 'You already have an appointment scheduled at this time.' });
      } else {
        return res.status(409).json({ error: 'This time slot is already booked by another patient. Please select a different time.' });
      }
    }

    const dailyCount = await pool.query(
      `
        SELECT COUNT(*)::int AS count
        FROM appointments
        WHERE doctor_id = $1
          AND date = $2
          AND status != 'cancelled'
      `,
      [doctor_id, date]
    );

    if (dailyCount.rows[0].count >= DOCTOR_DAILY_APPOINTMENT_LIMIT) {
      return res.status(409).json({ error: 'Doctor is fully booked for this date. Please select another date.' });
    }

    next();
  } catch (err) {
    console.error('Appointment validation error:', err);
    res.status(500).json({ error: 'Failed to validate appointment.' });
  }
}
