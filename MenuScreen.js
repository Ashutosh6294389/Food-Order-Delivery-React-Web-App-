import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, Image, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import { useCart } from './CartContext';
import { Alert, Button } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';

const MENU_API = "https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=19.0759837&lng=72.8776559&restaurantId=";
const CDN_URL = "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/";

export default function MenuScreen({ route, navigation }) {
  const { restaurantId } = route.params;
  const [menu, setMenu] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const { cart ,addToCart, replaceCart, restaurantId: cartRestaurantId, removeFromCart} = useCart();
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);

  // Filter menu items by search text
  const filteredMenu = searchText
    ? menu.filter(item =>
        item.name?.toLowerCase().includes(searchText.toLowerCase())
      )
    : menu;

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
        <Text style={styles.appName}>QuickBite</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Home')}>
            <Feather name="home" size={28} color="#ff7043" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowSearch(true)}>
            <Feather name="search" size={28} color="#ff7043" />
          </TouchableOpacity>
         <TouchableOpacity style={styles.iconButton} onPress={() => { setShowCart(true); setShowSearch(false); }}>
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
  }, []);

  const handleAddToCart = (item) => {
  if (!restaurant || !restaurant.id) {
    Alert.alert("Please wait", "Restaurant details are loading.");
    return;
  }
  const result = addToCart(item, restaurant.id); // restaurant.id must match context
  if (result.conflict) {
    console.log('Showing conflict alert');
    Alert.alert(
      "Switch Restaurant?",
      "You can only order from one restaurant at a time.\n\nAdding this item will remove all items from your current cart. Do you want to continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {},
        },
        {
          text: "Okay",
          style: "destructive",
          onPress: () => replaceCart(item, restaurant.id),
        },
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
    <ScrollView style={styles.container}>
      {renderHeader()}

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

      {/* Profile Menu Modal */}
      <Modal
        transparent
        visible={profileMenuVisible}
        animationType="fade"
        onRequestClose={() => setProfileMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setProfileMenuVisible(false)}>
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setProfileMenuVisible(false); /* Add navigation to Past Orders */ }}>
              <Feather name="list" size={20} color="#ff7043" style={{ marginRight: 10 }} />
              <Text style={styles.menuText}>Past Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setProfileMenuVisible(false); /* Add navigation to Help & Support */ }}>
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

      {/* ...existing restaurant and menu rendering code... */}
      {restaurant && (
        <View style={styles.header}>
          <Image
            source={{ uri: CDN_URL + restaurant.cloudinaryImageId }}
            style={styles.restaurantImage}
          />
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantDetails}>{restaurant.cuisines?.join(', ')}</Text>
          <Text style={styles.restaurantDetails}>⭐ {restaurant.avgRating} | {restaurant.areaName}</Text>
        </View>
      )}
      <Text style={styles.menuTitle}>Menu</Text>
      {filteredMenu.length === 0 ? (
        <Text style={styles.menuItem}>No menu items found.</Text>
      ) : (
        <FlatList
          data={filteredMenu}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.menuItemContainer}>
              <Text style={styles.menuItem}>
                {item.name} {item.price ? `- ₹${(item.price / 100).toFixed(2)}` : ''}
              </Text>
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
              {item.imageId ? (
                <Image
                  source={{ uri: CDN_URL + item.imageId }}
                  style={styles.menuImage}
                />
              ) : null}
            </View>
          )}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', padding: 16 },
  restaurantImage: { width: 200, height: 120, borderRadius: 12, marginBottom: 12 },
  restaurantName: { fontSize: 24, fontWeight: 'bold', color: '#ff7043', marginBottom: 4 },
  restaurantDetails: { fontSize: 16, color: '#555', marginBottom: 2 },
  menuTitle: { fontSize: 22, fontWeight: 'bold', margin: 16, color: '#333' },
  menuItemContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 8 },
  menuItem: { fontSize: 18, color: '#333', flex: 1 },
  menuImage: { width: 60, height: 60, borderRadius: 8, marginLeft: 12 },
  counterContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  counterText: { fontSize: 18, marginHorizontal: 6, minWidth: 20, textAlign: 'center' },
  plusButton: { marginLeft: 2 },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff7043',
    letterSpacing: 2,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 40, // for status bar spacing
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
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
});