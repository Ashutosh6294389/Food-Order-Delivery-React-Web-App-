import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, Image, StyleSheet, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import { useCart } from './CartContext';
import { Alert, Button } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';

const MENU_API = "https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=19.0759837&lng=72.8776559&restaurantId=";
const CDN_URL = "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/";

export default function MenuScreen({ route, navigation }) {
  const { restaurantId } = route.params;
  const [menu, setMenu] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, replaceCart, restaurantId: cartRestaurantId, removeFromCart } = useCart();
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [vegFilter, setVegFilter] = useState('all');

  // Filter menu items by search text
  const filteredMenu = menu.filter(item => {
    const matchesSearch = searchText
      ? item.name?.toLowerCase().includes(searchText.toLowerCase())
      : true;
    let matchesVeg = true;
    if (vegFilter === 'veg') {
      matchesVeg = item.isVeg === 1;
    } else if (vegFilter === 'nonveg') {
      matchesVeg = item.isVeg !== 1; // treat undefined/null/0 as non-veg
    }
    return matchesSearch && matchesVeg;
  });

  // Header rendering logic
  const renderHeader = () => {
    if (showSearch) {
      return (
        <View style={styles.header}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search menu..."
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
        <Text 
        style={styles.appName}
        numberOfLines={1} 
        ellipsizeMode="tail"
        >
          QuickBite
          </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Home')}>
            <Feather name="home" size={28} color="#ff7043" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowSearch(true)}>
            <Feather name="search" size={28} color="#ff7043" />
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

  useEffect(() => {
    fetchMenu();
    // eslint-disable-next-line
  }, []);

  const handleAddToCart = (item) => {
    if (!restaurant || !restaurant.id) {
      Alert.alert("Please wait", "Restaurant details are loading.");
      return;
    }
    const result = addToCart(item, restaurant.id);
    if (result.conflict) {
      Alert.alert(
        "Switch Restaurant?",
        "You can only order from one restaurant at a time.\n\nAdding this item will remove all items from your current cart. Do you want to continue?",
        [
          { text: "Cancel", style: "cancel", onPress: () => {} },
          { text: "Okay", style: "destructive", onPress: () => replaceCart(item, restaurant.id) },
        ],
        { cancelable: true }
      );
    }
  };

  const getItemCount = (itemId) => {
    return cart.filter(i => i.id === itemId).length;
  };

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const response = await fetch(MENU_API + restaurantId);
      const json = await response.json();
      // Extract restaurant info and menu items
      const info = json?.data?.cards?.find(card => card.card?.card?.info)?.card?.card?.info;
      setRestaurant(info);

      // Find the menu section with itemCards
      const menuCards = json?.data?.cards?.find(card => card.groupedCard)?.groupedCard?.cardGroupMap?.REGULAR?.cards || [];
      let items = [];
      menuCards.forEach(card => {
        const itemCards = card.card?.card?.itemCards;
        if (itemCards) {
          items = items.concat(itemCards.map(ic => ic.card.info));
        }
      });
      setMenu(items);
    } catch (e) {
      setMenu([]);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Image source={require('./assets/logo.png')} style={{ width: 80, height: 80, marginBottom: 16 }} />
        <ActivityIndicator size="large" color="#ff7043" />
      </View>
    );
  }

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

  return (
    <View style={{ flex: 1 }}>
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
                setTimeout(() => navigation.navigate('PastOrders'), 300);
              }}
            >
              <Feather name="list" size={20} color="#ff7043" style={{ marginRight: 10 }} />
              <Text style={styles.menuText}>Past Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => {
              setProfileMenuVisible(false);
              setTimeout(() => navigation.navigate('HelpSupport'), 300);
            }}>
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

      {/* Cart Modal */}
      <Modal
        transparent
        visible={showCart}
        animationType="slide"
        onRequestClose={() => setShowCart(false)}
      >
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setShowCart(false)}>
          <View style={{ backgroundColor: '#fff', marginTop: 100, marginHorizontal: 20, borderRadius: 12, padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Your Cart</Text>
            {cart.length === 0 ? (
              <Text>Your cart is empty.</Text>
            ) : (
              groupCartItems(cart).map(item => (
                <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 6 }}>
                  <Text style={{ flex: 1 }}>{item.name}</Text>
                  <Text style={{ marginHorizontal: 8 }}>x{item.quantity}</Text>
                  <Text>₹{((item.price || 0) * item.quantity / 100).toFixed(2)}</Text>
                </View>
              ))
            )}
            <Button title="Close" onPress={() => setShowCart(false)} />
          </View>
        </Pressable>
      </Modal>

      <FlatList
        data={filteredMenu}
        keyExtractor={(item, index) => `${item.id || 'item'}-${index}`}
        ListHeaderComponent={
          <View>
            {renderHeader()}
            {restaurant && (
              <View style={styles.restaurantHeader}>
                <Image
                  source={{ uri: CDN_URL + restaurant.cloudinaryImageId }}
                  style={styles.restaurantImage}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <Text style={styles.restaurantDetails}>{restaurant.cuisines?.join(', ')}</Text>
                  <Text style={styles.restaurantDetails}>⭐ {restaurant.avgRating} | {restaurant.areaName}</Text>
                  {restaurant.sla?.lastMileTravel && (
                    <Text style={styles.restaurantDetails}>
                      Distance: {restaurant.sla.lastMileTravel} km
                    </Text>
                  )}
                </View>
              </View>
            )}
            <Text style={styles.menuTitle}>Menu</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: vegFilter === 'all' ? '#ff7043' : '#fff',
                  borderColor: '#ff7043',
                  borderWidth: 1,
                  borderRadius: 20,
                  paddingVertical: 6,
                  paddingHorizontal: 16,
                  marginHorizontal: 4,
                }}
                onPress={() => setVegFilter('all')}
              >
                <Text style={{ color: vegFilter === 'all' ? '#fff' : '#ff7043', fontWeight: 'bold' }}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: vegFilter === 'veg' ? '#43a047' : '#fff',
                  borderColor: '#43a047',
                  borderWidth: 1,
                  borderRadius: 20,
                  paddingVertical: 6,
                  paddingHorizontal: 16,
                  marginHorizontal: 4,
                }}
                onPress={() => setVegFilter('veg')}
              >
                <Text style={{ color: vegFilter === 'veg' ? '#fff' : '#43a047', fontWeight: 'bold' }}>Veg</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: vegFilter === 'nonveg' ? '#b71c1c' : '#fff',
                  borderColor: '#b71c1c',
                  borderWidth: 1,
                  borderRadius: 20,
                  paddingVertical: 6,
                  paddingHorizontal: 16,
                  marginHorizontal: 4,
                }}
                onPress={() => setVegFilter('nonveg')}
              >
                <Text style={{ color: vegFilter === 'nonveg' ? '#fff' : '#b71c1c', fontWeight: 'bold' }}>Non-Veg</Text>
              </TouchableOpacity>
            </View>
            {filteredMenu.length === 0 && (
              <Text style={styles.menuItem}>No menu items found.</Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.menuItemContainer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuItemName}>
                {'\u2022'}{' '}
                {item.name
                  ? item.name.charAt(0).toUpperCase() + item.name.slice(1)
                  : ''}
              </Text>
              {item.price ? (
                <Text style={{ color: '#ff7043', fontWeight: 'bold' }}>
                  ₹{(item.price / 100).toFixed(2)}
                </Text>
              ) : null}
              {item.description ? (
                <Text style={{ color: '#666', fontSize: 14, fontWeight: 'bold' }}>
                  {item.description}
                </Text>
              ) : null}
              {item.ratings?.aggregatedRating?.rating ? (
                <Text style={{ color: '#388e3c', fontWeight: 'bold', marginBottom: 2 }}>
                  ⭐ {item.ratings.aggregatedRating.rating}
                </Text>
              ) : null}
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  onPress={() => removeFromCart(item.id)}
                  style={styles.plusButton}
                  disabled={getItemCount(item.id) === 0}
                >
                  <Ionicons name="remove-circle" size={28} color={getItemCount(item.id) === 0 ? "#ccc" : "#ff7043"} />
                </TouchableOpacity>
                <Text style={styles.counterText}>{getItemCount(item.id)}</Text>
                <TouchableOpacity onPress={() => handleAddToCart(item)} style={styles.plusButton}>
                  <Ionicons name="add-circle" size={28} color="#ff7043" />
                </TouchableOpacity>
              </View>
            </View>
            {item.imageId ? (
              <Image
                source={{ uri: CDN_URL + item.imageId }}
                style={styles.menuImage}
              />
            ) : null}
          </View>
        )}
        contentContainerStyle={styles.container}
      />

      {cart.length > 0 && (
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('CartScreen')}
          activeOpacity={0.8}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', paddingBottom: 100 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  restaurantImage: { width: 200, height: 120, borderRadius: 12, marginBottom: 12 },
  restaurantName: { fontSize: 24, fontWeight: 'bold', color: '#ff7043', marginBottom: 4 },
  restaurantDetails: { fontSize: 16, color: '#555', marginBottom: 2 },
  menuTitle: { fontSize: 22, fontWeight: 'bold', margin: 16, color: '#333' },
  menuItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff7f0',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffe0cc',
    shadowColor: '#ff7043',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
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
  menuImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginLeft: 12
  },
  counterContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  counterText: { fontSize: 18, marginHorizontal: 6, minWidth: 20, textAlign: 'center' },
  plusButton: { marginLeft: 2 },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff7043',
    letterSpacing: 2,
    flex: 1,
    flexShrink: 1, // Prevents wrapping
    minWidth: 0,   // Allows shrinking
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
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
  checkoutButton: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#43a047',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 28,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 100,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
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
  menuItemName: {
    fontWeight: 'bold',
    color: '#111',
    fontSize: 18,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
});