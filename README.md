# FoodOrderingApp

A React Native app for browsing restaurant menus, adding items to a cart, and placing orders.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
   or
   ```sh
   yarn install
   ```

2. **Start the development server:**
   ```sh
   npm start
   ```
   or
   ```sh
   expo start
   ```

3. **Run on your device:**
   - Scan the QR code in the Expo DevTools with the Expo Go app.
   - Or run on an emulator:
     ```sh
     npm run android
     npm run ios
     npm run web
     ```

## Project Structure

- `App.js` - Entry point
- `MenuScreen.js` - Menu and cart logic
- `CartContext.js` - Cart state management
- `RegisterScreen.js`, `SignInScreen.js`, `HomeScreen.js` - User flows
- `firebase.js` - Firebase configuration

## Scripts

- `npm start` - Start Expo dev server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser

## License

See [package.json](package.json) for license info.
