# MiniPhotoVault

A mobile photo management application built with React Native that allows users to capture photos with the device camera and manage a personal photo gallery with cloud storage integration.

## Features

- **Camera Capture** – Take photos directly from your device camera
- **Photo Gallery** – Browse and manage your captured photos
- **Cloud Storage** – Automatic image upload and storage via Cloudinary
- **EXIF Data** – Extract and preserve photo metadata (location, timestamp, device info)
- **Image Optimization** – Automatic image resizing for efficient storage
- **Permissions Management** – Proper handling of camera and file system permissions

## Prerequisites

- Node.js >= 22.11.0
- npm or Yarn
- Android SDK (for Android builds) or Xcode (for iOS builds)
- Ruby & CocoaPods (for iOS builds)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. For iOS, install CocoaPods dependencies:
   ```bash
   bundle install
   bundle exec pod install
   ```

## Running the App

### Development

Start the Metro bundler:
```bash
npm start
```

### Android

```bash
npm run android
```

### iOS

```bash
npm run ios
```

## Project Structure

```
src/
├── screens/          # Screen components (Camera, Gallery)
├── components/       # Reusable UI components
├── services/         # Business logic (Cloudinary, EXIF, permissions)
├── navigation/       # Navigation setup
└── theme/            # Colors and styling
```

## Technologies

- **React Native** 0.85.0 – Cross-platform mobile development
- **React Navigation** – Tab-based navigation
- **Vision Camera** – Camera functionality
- **Cloudinary** – Cloud storage and image management
- **TypeScript** – Type-safe development


For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
