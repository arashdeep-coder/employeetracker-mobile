# Antigravity Employee Mobile App

A React Native mobile application built with Expo SDK 51 for employee attendance tracking with background GPS updates.

## Features
- **Secure Login**: Phone number + 4-digit PIN authentication.
- **Attendance Management**: Simple "Punch In" and "Punch Out" with GPS capture.
- **Background GPS Tracking**: Updates location every 5 minutes while punched in.
- **History**: View last 30 days of attendance logs.
- **Theme**: Premium Material Design (React Native Paper).

## Tech Stack
- **Framework**: Expo SDK 51 (React Native)
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State**: React Context API
- **UI**: React Native Paper
- **GPS**: Expo Location + Expo Task Manager

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Expo Go app on your physical device (iOS or Android)

### 2. Installation
```bash
# Install dependencies
npm install
```

### 3. Configuration
1. Open `src/constants/config.ts`.
2. Update `API_URL` to your actual Railway backend URL.

### 4. Running the App
```bash
# Start the Expo development server
npm start
```
- Scan the QR code with your phone (Expo Go app for Android, Camera app for iOS).
- Ensure your phone and computer are on the same Wi-Fi network.

## Testing with Seed Data
Use the following credentials (from Phase 1 seed data):
- **Phone**: `9000000001`
- **PIN**: `0000`

## Permissions
The app requests:
- **Foreground Location**: To record punch-in/out.
- **Background Location**: To track updates while the app is minimized.
- **Notifications**: For system tracking indicators.

> [!IMPORTANT]
> Background location tracking only works on physical devices, not in the iOS Simulator or Android Emulator.
