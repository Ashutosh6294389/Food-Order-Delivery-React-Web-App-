# QuickBite - Food Ordering App

QuickBite is a React Native (Expo) application that allows users to browse restaurant menus, add items to a cart, place orders, and view past orders. The app uses Firebase for authentication and Firestore for data storage.

## Purpose

The purpose of QuickBite is to provide a seamless food ordering experience, allowing users to:
- Register and sign in securely
- Browse a list of restaurants and their menus
- Add food items to a cart (one restaurant at a time)
- Place orders with delivery address and payment options
- View and reorder from past orders
- Access help and support

## Features

- **User Authentication:** Register and sign in with email and password.
- **Restaurant Browsing:** View a list of available restaurants.
- **Menu Viewing:** Browse menu items, filter by veg/non-veg, and search.
- **Cart Management:** Add, remove, and update items in your cart.
- **Order Placement:** Enter delivery address, select payment method, and place orders.
- **Order History:** View past orders and reorder with a single tap.
- **Help & Support:** Contact support via email, phone, or WhatsApp.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd Food-Order-Delivery-React-Web-App-
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```
   or
   ```sh
   yarn install
   ```

3. **Start the development server:**
   ```sh
   npm start
   ```
   or
   ```sh
   yarn start --reset-cache
   ```
   or
   ```sh
   expo start
   ```

4. **Run on your device:**
     ```sh
     npm run android
     npm run ios
     npm run web
     ```

## Project Structure

- `App.js` - Main app entry point and navigation
- `HomeScreen.js` - Restaurant list and search
- `MenuScreen.js` - Menu items and cart actions
- `CartScreen.js` - Cart review and order placement
- `PastOrdersScreen.js` - View and reorder past orders
- `RegisterScreen.js` / `SignInScreen.js` - User authentication
- `HelpSupportScreen.js` - Support contact options
- `CartContext.js` - Cart state management
- `firebase.js` - Firebase configuration

## License

See [package.json](package.json) for license information.