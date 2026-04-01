# SwayamShield Data Storage Guide

## 📋 Overview
All data entered in any panel is now automatically stored in the PostgreSQL database. Here's what each panel saves:

## 🏥 Patient Portal Data Storage

### 📅 Appointments Panel
- **Table**: `appointments`
- **Data Stored**: 
  - Patient ID, Doctor ID, Hospital ID
  - Appointment date, time, type
  - Notes, telemedicine link
  - Status (scheduled, completed, cancelled)
- **API**: `appointmentAPI.book()`

### 🏥 Health Records Panel  
- **Table**: `health_records`
- **Data Stored**:
  - Patient ID, record type (visit, lab, prescription, etc.)
  - Title, doctor name, date, notes
  - File attachments (if any)
- **API**: `healthRecordAPI.add()`

### 💊 Prescriptions Panel
- **Table**: `prescriptions`
- **Data Stored**:
  - Patient ID, Doctor ID, Hospital ID
  - Medicine name, dosage, notes
  - Prescription dates, active status
  - Hospital review status
- **API**: `prescriptionAPI.add()`

### 🚨 Emergency Panel
- **Table**: `emergency_bookings`
- **Data Stored**:
  - Patient ID (if logged in), Hospital ID
  - GPS coordinates (lat, lng)
  - ETA minutes, status
  - Booking timestamp
- **API**: `emergencyAPI.book()`

### 🩺 Symptom Checker Panel
- **Table**: `symptom_analyses`
- **Data Stored**:
  - Patient ID, symptoms text
  - AI analysis result, severity
  - Recommendations
  - Analysis timestamp
- **API**: `symptomAPI.analyze()`

### 📊 Vitals Panel
- **Table**: `vitals`
- **Data Stored**:
  - Patient ID, recorded by (staff)
  - Temperature, blood pressure, heart rate
  - Oxygen saturation, weight, height, BMI
  - Notes, recorded timestamp
- **API**: `vitalAPI.add()`

## 👨‍⚕️ Doctor Portal Data Storage

### 📋 Appointment Management
- **Table**: `appointments`
- **Data Updated**: Status changes, notes, telemedicine links
- **API**: `appointmentAPI.updateStatus()`

### 💊 Prescription Management
- **Table**: `prescriptions`
- **Data Stored**: All prescription details, patient medications
- **API**: `prescriptionAPI.add()`, `prescriptionAPI.toggle()`

### ⭐ Reviews Management
- **Table**: `reviews`
- **Data Stored**: Patient ratings and comments for doctors
- **API**: `reviewAPI.submit()`, `reviewAPI.forDoctor()`

## 🏢 Hospital Centre Portal Data Storage

### 🚑 Ambulance Request Queue
- **Table**: `ambulance_requests`, `ambulance_request_hospitals`
- **Data Stored**: Emergency requests, hospital responses, dispatch status
- **API**: `ambulanceAPI.queue()`, `ambulanceAPI.accept()`, `ambulanceAPI.dispatch()`

### 🏥 Hospital Overview
- **Table**: `hospitals`, `hospital_blood_inventory`
- **Data Updated**: Bed counts, ambulance availability, blood inventory
- **API**: `ambulanceAPI.updateBlood()`

### 💊 Prescription Review Queue
- **Table**: `prescriptions`
- **Data Updated**: Review status, verification details, hospital notes
- **API**: `prescriptionAPI.hospitalQueue()`, `prescriptionAPI.hospitalReview()`

## 🔧 Admin Portal Data Storage

### 📊 Platform Analytics
- **Table**: `activity_logs`
- **Data Stored**: All user actions, system events, audit trail
- **API**: `adminAPI.activity()`, `adminAPI.stats()`

### 👥 User Management
- **Table**: `users`
- **Data Updated**: User profiles, roles, account status
- **API**: `adminAPI.users()`

### 🏥 Hospital Records
- **Table**: `hospitals`, `doctors`, `appointments`
- **Data Accessed**: Hospital performance metrics, doctor availability
- **API**: `adminAPI.stats()`, `hospitalAPI.list()`

## 📱 Notification System

### 🔔 Real-time Notifications
- **Table**: `notifications`
- **Data Stored**: 
  - User ID, title, message
  - Notification type (emergency, appointment, etc.)
  - Read status, timestamp
- **API**: `notificationAPI.list()`, `notificationAPI.markRead()`

## 🔐 Data Security & Privacy

- **Authentication**: JWT-based secure login
- **Authorization**: Role-based access control
- **Data Encryption**: Passwords hashed with bcrypt
- **Audit Trail**: All actions logged in `activity_logs`
- **Data Integrity**: Foreign key constraints ensure data consistency

## 🚀 Real-time Features

- **Emergency Tracking**: Live ambulance dispatch updates
- **Appointment Status**: Real-time booking confirmations
- **Notifications**: Instant alerts for critical events
- **Activity Monitoring**: Live dashboard updates

## 📊 Database Schema Summary

| Table | Records | Purpose |
|-------|---------|---------|
| users | 6 | User accounts and profiles |
| hospitals | 25 | Hospital information and services |
| doctors | 12 | Doctor profiles and schedules |
| appointments | 0+ | Patient appointment bookings |
| health_records | 0+ | Patient medical history |
| prescriptions | 0+ | Medication prescriptions |
| emergency_bookings | 2+ | Emergency ambulance requests |
| vitals | 0+ | Patient vital signs |
| reviews | 0+ | Doctor and hospital reviews |
| notifications | 0+ | User notifications |
| activity_logs | 0+ | System audit trail |
| symptom_analyses | 0+ | AI symptom checker results |

---

**✅ All panels now store data automatically in the database!**
