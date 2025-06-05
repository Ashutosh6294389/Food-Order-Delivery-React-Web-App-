import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { db, auth } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useCart } from './CartContext';

const CDN_URL = "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/";

export default function PastOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { clearCart, addToCart, replaceCart } = useCart();

  useEffect(() => {
    let unsubscribe;
    unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setOrders([]);
          setLoading(false);
          return;
        }
        setLoading(true);
        const snap = await getDocs(collection(db, 'orders'));
        const allOrders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const userOrders = allOrders.filter(order => order.userId === user.uid);
        setOrders(userOrders);
        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const handleOrderAgain = (order) => {
    if (!order.items || order.items.length === 0) {
      Alert.alert('No items to reorder.');
      return;
    }
    clearCart();
    // Add all items to cart, respecting restaurantId
    const restId = order.items[0].restaurantId || order.items[0].restaurant_id || order.restaurantId;
    order.items.forEach((item, idx) => {
      if (idx === 0) {
        replaceCart(item, restId);
      } else {
        addToCart(item, restId);
      }
    });
    navigation.navigate('CartScreen');
  };

  if (loading) return (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#ff7043" />
  </View>
);
  if (orders.length === 0) return <Text style={{ margin: 24 }}>No past orders found.</Text>;

  return (
    <ScrollView style={styles.container}>
      {orders.map(order => (
        <View key={order.id} style={styles.orderCard}>
          <Text style={styles.orderDate}>
            {order.createdAt?.toDate?.() ? order.createdAt.toDate().toLocaleString() : 'Unknown date'}
          </Text>
          <Text style={styles.orderTotal}>Total: ₹{order.total?.toFixed(2)}</Text>
          <Text style={styles.orderAddress}>
            {order.address?.houseNo}, {order.address?.area}, {order.address?.address}
          </Text>
          <Text style={styles.orderPayment}>Payment: {order.paymentMethod}</Text>
          <Text style={styles.orderItemsTitle}>Items:</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.orderItemRow}>
              {item.imageId ? (
                <Image
                  source={{ uri: CDN_URL + item.imageId }}
                  style={styles.itemImage}
                />
              ) : null}
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.orderItem}>
                  {item.name} x{item.quantity} - ₹{((item.price || 0) * item.quantity / 100).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.orderAgainButton}
            onPress={() => handleOrderAgain(order)}
          >
            <Text style={styles.orderAgainText}>Order Again</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  orderCard: {
    backgroundColor: '#fff7f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffe0cc',
  },
  orderDate: { fontWeight: 'bold', marginBottom: 4, color: '#ff7043' },
  orderTotal: { fontWeight: 'bold', marginBottom: 4, color: '#43a047' },
  orderAddress: { marginBottom: 4, color: '#555' },
  orderPayment: { marginBottom: 4, color: '#555' },
  orderItemsTitle: { fontWeight: 'bold', marginTop: 8 },
  orderItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  orderItem: { marginLeft: 0, color: '#333', fontSize: 16 },
  itemImage: { width: 40, height: 40, borderRadius: 6, marginRight: 4 },
  orderAgainButton: {
    marginTop: 10,
    backgroundColor: '#ff7043',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  orderAgainText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});