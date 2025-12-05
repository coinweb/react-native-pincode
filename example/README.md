# React Native PIN Code Example

This is an example Expo app to test the `react-native-pincode` component locally.

## Setup

1. First, build the component library:
   ```bash
   cd ..
   yarn build
   ```

2. Install dependencies for the example app:
   ```bash
   cd example
   yarn install
   ```

3. Start the Expo development server:
   ```bash
   yarn start
   ```

4. Run on your device:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan the QR code with Expo Go app on your physical device

## Features

The example app demonstrates:
- **Choose PIN**: Set up a new PIN code
- **Enter PIN**: Enter your PIN code to unlock
- **Delete PIN**: Remove the stored PIN code

## Notes

- The component uses `react-native-keychain` for secure storage
- Touch ID/Face ID is available if configured on your device
- The lock screen activates after 3 failed attempts (configurable)


