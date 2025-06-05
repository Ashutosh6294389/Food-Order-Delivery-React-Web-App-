import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const CartContext = createContext();

// ...existing code...
export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [user, setUser] = useState(null);
  const [cartLoaded, setCartLoaded] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  // Load cart from Firestore when user is set
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        const cartRef = doc(db, 'carts', user.uid);
        const cartSnap = await getDoc(cartRef);
        if (cartSnap.exists()) {
          const data = cartSnap.data();
          setCart(data.cart || []);
          setRestaurantId(data.restaurantId || null);
        } else {
          setCart([]);
          setRestaurantId(null);
        }
        setCartLoaded(true);
      } else {
        setCart([]);
        setRestaurantId(null);
        setCartLoaded(false);
      }
    };
    loadCart();
  }, [user]);

  // Save cart to Firestore whenever cart or restaurantId changes and user is set
  useEffect(() => {
    const saveCart = async () => {
      if (user && cartLoaded) {
        const cartRef = doc(db, 'carts', user.uid);
        await setDoc(cartRef, { cart, restaurantId });
      }
    };
    if (user && cartLoaded) saveCart();
  }, [cart, restaurantId, user, cartLoaded]);

  const addToCart = (item, restId) => {
    if (!cartLoaded) return { conflict: false }; // Ignore until loaded
    if (cart.length > 0 && restaurantId && restaurantId !== restId) {
      return { conflict: true };
    }
    setCart(prev => [...prev, item]);
    setRestaurantId(restId);
    return { conflict: false };
  };

  const removeFromCart = (itemId) => {
    if (!cartLoaded) return;
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === itemId);
      if (idx !== -1) {
        const newCart = [...prev];
        newCart.splice(idx, 1);
        return newCart;
      }
      return prev;
    });
  };

  const replaceCart = (item, restId) => {
    if (!cartLoaded) return;
    setCart([item]);
    setRestaurantId(restId);
  };

  const clearCart = () => {
    setCart([]);
    setRestaurantId(null);
  };

  return (
    <CartContext.Provider value={{ cart, restaurantId, addToCart, replaceCart, clearCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}
// ...existing code...

export function useCart() {
  return useContext(CartContext);
}