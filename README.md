# ZoltMoney React Native App

A premium, industry-level React Native application for ZoltMoney, featuring a robust architecture, secure biometric authentication, and multi-language support.

## 🚀 Key Features

- **Standardized UI/UX**: Built with a custom HSL-based Design System (`Theme.ts`) and Atomic Design principles.
- **Full Localization**: Integrated with `react-i18next` for seamless multi-language support (currently supporting English).
- **Secure Authentication**: 
    - Phone & Email OTP verification.
    - **Secure Enclave**: Sensitive tokens stored via `react-native-keychain`.
    - Biometric re-authentication gate on app resume.
- **Professional Architecture**:
    - Modularized Navigation (`AppNavigator.tsx`).
    - Global `ErrorBoundary` for crash resilience.
    - Centralized `Logger` utility.
- **OTA Updates**: Integrated with **Stallion** for instant over-the-air deployments.
- **Customer Support**: Integrated **Intercom** SDK for in-app chat.

## 🛠️ Tech Stack

- **Framework**: React Native (0.84.1)
- **Language**: TypeScript
- **Navigation**: React Navigation (v7)
- **State/Storage**: AsyncStorage + React Native Keychain
- **Styling**: Vanilla CSS with HSL Tokens
- **API**: Axios with specialized clients (Polaris, Castor, Carina)
- **OTA**: Stallion

## 📦 Getting Started

### Prerequisites

- Node.js (>= 22.11.0)
- React Native Environment Setup (iOS/Android)
- `.env` file (see `.env.example`)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize CocoaPods (iOS only):
   ```bash
   cd ios && pod install && cd ..
   ```

### Running Locally

```bash
# Start Metro Bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 🔐 Environment Variables

Create a `.env` file in the root directory. Required keys:

- `POLARIS_BASE_URL`: Auth/User service API
- `CASTOR_BASE_URL`: Wallet/DFNS service API
- `CARINA_BASE_URL`: Transfer/Rates service API
- `X_API_KEY_1`: Standard API Key
- `X_API_KEY_2`: Secondary API Key
- `STALLION_PROJECT_ID`: ID for OTA deployment
- `STALLION_CI_TOKEN`: Token for Stallion CLI
- `INTERCOM_APP_ID`: Intercom App ID
- `INTERCOM_IOS_API_KEY`: Intercom iOS Key
- `INTERCOM_ANDROID_API_KEY`: Intercom Android Key

## 🏗️ Architecture Overview

### Atomic Design
- **Atoms**: `Typography`, `Button`, `Input`.
- **Organisms**: `ErrorBoundary`.
- **Screens**: Located in `src/screens`.

### Security
- **Authentication**: JWT-based tokens stored in Keychain.
- **401 Interceptor**: Automatic logout on token expiry implemented in `src/api/client.ts`.
- **Nonce Generation**: `x-nonce-id` JWT generated per-request for API security.

## 🚀 Deployment (Stallion)

The app is set up for OTA updates via Stallion.

```bash
# Push update to main bucket
npx stallion-cli push -b main -p <STALLION_PROJECT_ID> -t <STALLION_CI_TOKEN>
```

## 🧪 Quality Control

- **Linting**: `npm run lint`
- **Testing**: `npm test`
- **Type Check**: `npx tsc`

---
*Built with ❤️ by the ZoltMoney Team.*
