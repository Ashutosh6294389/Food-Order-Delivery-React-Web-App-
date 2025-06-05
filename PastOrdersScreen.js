import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';
import { db, auth } from './firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

export default function PastOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!auth.currentUser) return;
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) return <Text style={{ margin: 24 }}>Loading...</Text>;

  if (orders.length === 0) return <Text style={{ margin: 24 }}>No past orders found.</Text>;

  return (
    <ScrollView style={styles.container}>
      {orders.map(order => (
        <View key={order.id} style={styles.orderCard}>
          <Text style={styles.orderDate}>
            {order.createdAt?.toDate().toLocaleString() || 'Unknown date'}
          </Text>
          <Text style={styles.orderTotal}>Total: ₹{order.total?.toFixed(2)}</Text>
          <Text style={styles.orderAddress}>
            {order.address?.houseNo}, {order.address?.area}, {order.address?.address}
          </Text>
          <Text style={styles.orderPayment}>Payment: {order.paymentMethod}</Text>
          <Text style={styles.orderItemsTitle}>Items:</Text>
          {order.items.map((item, idx) => (
            <Text key={idx} style={styles.orderItem}>
              {item.name} x{item.quantity} - ₹{((item.price || 0) * item.quantity / 100).toFixed(2)}
            </Text>
          ))}
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
  orderItem: { marginLeft: 8, color: '#333' },
});