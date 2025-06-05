import React, { useState, useEffect, use } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, TextInput, FlatList, ActivityIndicator, Image } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useCart } from './CartContext';
import { signOut } from 'firebase/auth';
import { db, auth } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

const CDN_URL = "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/";
const IMG_URL = "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/";
const LOGO_URL = "https://static.vecteezy.com/system/resources/previews/008/687/818/non_2x/food-delivery-logo-free-vector.jpg";
const MENU_API = "https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=19.0759837&lng=72.8776559&restaurantId=";
const SWIGGY_API_URL = "https://www.swiggy.com/dapi/restaurants/list/v5?lat=19.0759837&lng=72.8776559&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING";

export default function HomeScreen({ navigation }) {
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const {cart}=useCart();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'restaurants'));
      const fetchedRestaurants = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRestaurants(fetchedRestaurants);
    } catch (e) {
      setRestaurants([]);
    }
    setLoading(false);
  };

  // Filter restaurants by search text
  const filteredResults = searchText
    ? restaurants.filter(item =>
        item.name?.toLowerCase().includes(searchText.toLowerCase())
      )
    : restaurants;

  // Header rendering logic
  const renderHeader = () => {
    if (showSearch) {
      return (
        <View style={styles.header}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search restaurants or food..."
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          <TouchableOpacity style={styles.profileButton} onPress={() => setShowSearch(false)}>
            <Ionicons name="close" size={28} color="#ff7043" />
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.header}>
        <Text style={styles.appName}>QuickBite</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => { setShowSearch(true); setShowCart(false); }}>
            <Feather name="search" size={28} color="#ff7043" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
                setShowSearch(false);
                setShowCart(false);
                setSearchText("");
                navigation.navigate('Home');
            }}>
            <Feather name="home" size={28} color="#ff7043" />
            </TouchableOpacity>
            <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('CartScreen')}
          >
            <Ionicons name="cart-outline" size={28} color="#ff7043" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => setProfileMenuVisible(true)}>
          <MaterialIcons name="account-circle" size={32} color="#ff7043" />
        </TouchableOpacity>
      </View>
    );
  };

  // Main content rendering logic
  let mainContent;
  if (loading) {
   mainContent = (
    <View style={{ alignItems: 'center', marginTop: 40 }}>
      <Image source={require('./assets/logo.png')} style={{ width: 80, height: 80, marginBottom: 16 }} />
      <ActivityIndicator size="large" color="#ff7043" />
    </View>
  );
  } else if (showCart) {
        const groupedCart = groupCartItems(cart);
        mainContent = (
            <View>
            <Text style={styles.title}>Your Cart</Text>
            {groupedCart.length === 0 ? (
                <Text style={styles.resultText}>Your cart is empty.</Text>
            ) : (
                groupedCart.map(item => (
                <View key={item.id} style={styles.resultItem}>
                    <Text style={styles.resultText}>{item.name} x{item.quantity}</Text>
                </View>
                ))
            )}
            </View>
        );
        } else {
    mainContent = (
      <FlatList
        data={filteredResults}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={({ item }) => (
            <TouchableOpacity
                style={[styles.resultItem, { flex: 1 }]}
                onPress={() => navigation.navigate('MenuScreen', { restaurantId: item.id })}
            >
                <Image
                  source={{ uri: item.imageUrl || (item.cloudinaryImageId ? CDN_URL + item.cloudinaryImageId : IMG_URL) }}
                  style={{ width: 100, height: 100, borderRadius: 8, marginBottom: 8 }}
                  resizeMode="cover"
                />
                <Text style={styles.resultText}>
                  [{item.name}]
                </Text>
                <Text style={{ color: '#888', fontSize: 14 }}>{item.cuisines?.join(', ')}</Text>
                <Text style={{ color: '#888', fontSize: 14 }}>⭐ {item.avgRating}</Text>
              </TouchableOpacity>
            )}
        ListEmptyComponent={<Text style={styles.resultText}>No results found.</Text>}
      />
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

      {/* Profile Menu Modal */}
      <Modal
        transparent
        visible={profileMenuVisible}
        animationType="fade"
        onRequestClose={() => setProfileMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setProfileMenuVisible(false)}>
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setProfileMenuVisible(false);
                setTimeout(() => navigation.navigate('PastOrders'), 300); // Delay to allow modal to close
              }}
            >
              <Feather name="list" size={20} color="#ff7043" style={{ marginRight: 10 }} />
              <Text style={styles.menuText}>Past Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { 
                setProfileMenuVisible(false); 
                setTimeout(() => navigation.navigate('HelpSupport'), 300);
                /* Add navigation to Help & Support */ }}>
              <Feather name="help-circle" size={20} color="#ff7043" style={{ marginRight: 10 }} />
              <Text style={styles.menuText}>Help & Support</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.menuItem}
                onPress={async () => {
                    await signOut(auth);
                    navigation.reset({
                    index: 0,
                    routes: [{ name: 'SignIn' }],
                    });
                }}
                >
                <MaterialIcons name="logout" size={20} color="#ff7043" style={{ marginRight: 10 }} />
                <Text style={styles.menuText}>Sign Out</Text>
                </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Main Content */}
      <View style={{ flex: 1, width: '100%' }}>
        {mainContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff7043',
    letterSpacing: 2,
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2,
  },
  iconButton: {
    marginHorizontal: 8,
  },
  profileButton: {
    marginLeft: 8,
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 12,
  },
  title: { fontSize: 24, margin: 20, color: '#333', textAlign: 'center' },
  resultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 18,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 60,
    marginRight: 16,
    paddingVertical: 8,
    width: 200,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  resultItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    margin: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    borderRadius: 8,
    // Optionally, remove borderBottom if you want card style:
    // borderBottomWidth: 0,
    // elevation: 2,
  },
});

// Group cart items by id and show quantity:
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

// ...inside your mainContent rendering logic...
