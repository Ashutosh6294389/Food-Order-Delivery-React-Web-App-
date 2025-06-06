import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, Platform } from 'react-native';
import { useCart } from './CartContext';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Do NOT import react-native-maps at the top! (breaks web)

function groupCartItems(cart) {
  const map = {};
  cart.forEach(item => {
    if (!map[item.id]) {
      map[item.id] = { ...item, quantity: 1 };
    } else {
      map[item.id].quantity += 1;
    }
  });
  return Object.values(map);
}


export default function CartScreen({ navigation }) {
  const { cart, addToCart, removeFromCart, clearCart, restaurantId } = useCart();
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [area, setArea] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [locationError, setLocationError] = useState('');
  const [MapViewComponent, setMapViewComponent] = useState(null);
  const [MarkerComponent, setMarkerComponent] = useState(null);

  const groupedCart = groupCartItems(cart);

  const total = groupedCart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0) / 100;

  useEffect(() => {
    (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
        let addr = await Location.reverseGeocodeAsync(loc.coords);
        if (addr && addr.length > 0) {
        setAddress(`${addr[0].name || ''}, ${addr[0].street || ''}, ${addr[0].city || ''}`);
        }
    })();

    // Dynamically import MapView and Marker only on native
    if (Platform.OS !== 'web') {
        import('react-native-maps').then((maps) => {
        setMapViewComponent(() => maps.default);
        setMarkerComponent(() => maps.Marker);
        });
    }
    }, []);

  const handlePlaceOrder = async () => {

  if (Platform.OS !== 'web' && !location) {
    Alert.alert('Location required', 'Please allow location access for delivery.');
    return;
  }
  if (!houseNo.trim() || !area.trim()) {
    Alert.alert('Please enter your house number and area.');
    return;
  }
  try {
    await addDoc(collection(db, 'orders'), {
      userId: auth.currentUser.uid,
      items: groupedCart,
      total,
      address: {
        houseNo,
        area,
        landmark,
        address,
        location,
      },
      paymentMethod,
      createdAt: serverTimestamp(),
    });
    clearCart();
    Alert.alert('Order Placed!', 'Your order has been placed successfully.', [
      { text: 'OK', onPress: () => navigation.navigate('Home') }
    ]);
  } catch (e) {
    console.log('Order Failed', e);
    Alert.alert('Order Failed', 'Could not place order. Please try again.');
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Cart</Text>
      {groupedCart.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty.</Text>
      ) : (
        <>
          {/* Map and location details */}
          <Text style={styles.sectionTitle}>Delivery Location</Text>
          {/* Hide the map component */}
          {/* 
          {Platform.OS !== 'web' && location && MapViewComponent && MarkerComponent ? (
            <MapViewComponent
                style={styles.map}
                initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
                }}
                showsUserLocation
                scrollEnabled={false}
                zoomEnabled={false}
            >
                <MarkerComponent coordinate={location} />
            </MapViewComponent>
            ) : (
            <Text style={{ color: 'red', marginBottom: 8 }}>
                {locationError || (Platform.OS === 'web' ? 'Map not supported on web.' : 'Fetching location...')}
            </Text>
            )}
          */}
          {/* Optionally, show nothing or a simple message */}
          {/* <Text style={{ color: '#888', marginBottom: 8 }}>Map is hidden.</Text> */}
          <TextInput
            style={styles.input}
            placeholder="House / Flat No."
            value={houseNo}
            onChangeText={setHouseNo}
          />
          <TextInput
            style={styles.input}
            placeholder="Area / Locality"
            value={area}
            onChangeText={setArea}
          />
          <TextInput
            style={styles.input}
            placeholder="Landmark (optional)"
            value={landmark}
            onChangeText={setLandmark}
          />
          <TextInput
            style={styles.input}
            placeholder="Address (auto-filled, you can edit)"
            value={address}
            onChangeText={setAddress}
          />

          {/* Cart Items */}
          {groupedCart.map((item, idx) => (
            <View key={item.id} style={styles.itemCard}>
              {item.imageId ? (
                <Image
                  source={{ uri: `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/${item.imageId}` }}
                  style={styles.itemImage}
                />
              ) : null}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.itemDesc}>{item.description}</Text>
                ) : null}
                <Text style={styles.itemPrice}>₹{((item.price || 0) / 100).toFixed(2)}</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.id)}
                    style={styles.qtyBtn}
                  >
                    <Ionicons name="remove-circle" size={28} color="#ff7043" />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => addToCart(item, restaurantId)}
                    style={styles.qtyBtn}
                  >
                    <Ionicons name="add-circle" size={28} color="#43a047" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemTotal}>
                  Total: ₹{(((item.price || 0) * item.quantity) / 100).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
          <View style={styles.divider} />
          <Text style={styles.total}>Total: ₹{total.toFixed(2)}</Text>
          <Text style={styles.sectionTitle}>Choose your payment option</Text>
          <View style={styles.paymentRow}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'upi' && styles.selectedPayment
              ]}
              onPress={() => setPaymentMethod('upi')}
            >
              <Text style={[
                styles.paymentText,
                paymentMethod === 'upi' && styles.selectedPaymentText
              ]}>
                UPI
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'cod' && styles.selectedPayment
              ]}
              onPress={() => setPaymentMethod('cod')}
            >
              <Text style={[
                styles.paymentText,
                paymentMethod === 'cod' && styles.selectedPaymentText
              ]}>
                Cash on Delivery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'card' && styles.selectedPayment
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <Text style={[
                styles.paymentText,
                paymentMethod === 'card' && styles.selectedPaymentText
              ]}>
                Credit/Debit Card
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
            <Text style={styles.placeOrderText}>Place Order</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#ff7043' },
  empty: { fontSize: 18, color: '#888', textAlign: 'center', marginTop: 40 },
  map: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff7f0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffe0cc',
    shadowColor: '#ff7043',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: { width: 80, height: 80, borderRadius: 8 },
  itemName: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  itemDesc: { color: '#666', fontSize: 14, fontWeight: 'bold', marginVertical: 2 },
  itemPrice: { color: '#ff7043', fontWeight: 'bold', fontSize: 16 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyBtn: { marginHorizontal: 4 },
  qtyText: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 8 },
  itemTotal: { marginTop: 4, fontWeight: 'bold', color: '#388e3c' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
  total: { fontSize: 20, fontWeight: 'bold', color: '#43a047', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, marginTop: 12 },
  paymentRow: { flexDirection: 'row', marginBottom: 16 },
  paymentOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#43a047',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedPayment: {
    backgroundColor: '#43a047',
  },
  paymentText: {
    color: '#43a047',
    fontWeight: 'bold',
  },
  placeOrderButton: {
    backgroundColor: '#43a047',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  placeOrderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  paymentRow: {
  flexDirection: 'row',
  marginBottom: 16,
  justifyContent: 'space-between',
},
paymentOption: {
  flex: 1,
  borderWidth: 1,
  borderColor: '#43a047',
  borderRadius: 8,
  padding: 12,
  marginHorizontal: 4,
  alignItems: 'center',
  backgroundColor: '#fff',
},
selectedPayment: {
  backgroundColor: '#43a047',
  borderColor: '#388e3c',
},
paymentText: {
  color: '#43a047',
  fontWeight: 'bold',
  fontSize: 16,
},
selectedPaymentText: {
  color: '#fff',
},
});