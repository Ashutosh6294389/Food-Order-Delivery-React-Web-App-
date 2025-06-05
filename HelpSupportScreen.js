import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

export default function HelpSupportScreen() {
  const email = 'as6294389@gmail.com';
  const phone = '8968484770';

  return (
    <View style={styles.container}>
      <MaterialIcons name="support-agent" size={64} color="#ff7043" style={{ marginBottom: 20 }} />
      <Text style={styles.title}>Help & Support</Text>
      <Text style={styles.text}>For any issues or support, please contact us:</Text>
      <View style={styles.infoRow}>
        <MaterialIcons name="email" size={24} color="#43a047" />
        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${email}`)}>
          <Text style={styles.infoText}>{email}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.infoRow}>
        <MaterialIcons name="phone" size={24} color="#43a047" />
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${phone}`)}>
          <Text style={styles.infoText}>{phone}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.infoRow}>
        <FontAwesome name="whatsapp" size={24} color="#25D366" />
        <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${phone}`)}>
          <Text style={styles.infoText}>WhatsApp Support: {phone}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.note}>Please email your problem or reach out via phone/WhatsApp.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ff7043', marginBottom: 12 },
  text: { fontSize: 16, color: '#333', marginBottom: 20, textAlign: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoText: { fontSize: 18, color: '#2196F3', marginLeft: 10 },
  note: { marginTop: 24, color: '#888', fontSize: 14, textAlign: 'center' },
});