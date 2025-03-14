import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { DatabaseService, Order, UserProfile } from '../lib/database';
import { COLORS, FONTS } from '../constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import CustomHeader from '../components/CustomHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: null,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadUserProfile();
    loadOrders();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await DatabaseService.getUserProfile();
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const userOrders = await DatabaseService.getUserOrders();
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    }
  };

  const handleUpdateProfile = async () => {
    if (!validateProfile()) return;

    try {
      setLoading(true);
      await DatabaseService.updateUserProfile(userProfile);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const validateProfile = () => {
    if (!userProfile.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!userProfile.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!userProfile.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    return true;
  };

  const handleTrackOrder = (orderId: string) => {
    navigation.navigate('OrderTracking', { orderId });
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: async () => {
            try {
              // Clear all authentication data
              await AsyncStorage.removeItem('user');
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('refreshToken');
              
              // Navigate to Auth screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const headerRight = (
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Ionicons name="log-out-outline" size={24} color={COLORS.primary} />
    </TouchableOpacity>
  );

  if (loading && !userProfile.name) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderOrders = () => (
    <ScrollView style={styles.tabContent}>
      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="shopping-outline" size={64} color="#999" />
          <Text style={styles.emptyStateText}>No orders yet</Text>
        </View>
      ) : (
        orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>Order #{order.id}</Text>
              <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.orderItems}>
              <View style={styles.orderItem}>
                <Image source={{ uri: 'placeholder-image' }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle}>Order Details</Text>
                  <Text style={styles.itemPrice}>Status: {order.status}</Text>
                </View>
              </View>
            </View>
            <View style={styles.orderFooter}>
              <Text style={styles.orderTotal}>Payment: {order.paymentMethod}</Text>
              <TouchableOpacity
                style={styles.trackButton}
                onPress={() => handleTrackOrder(order.id)}
              >
                <FontAwesome5 name="shipping-fast" size={16} color="#fff" />
                <Text style={styles.trackButtonText}>Track Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderProfile = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              userProfile.avatar
                ? { uri: userProfile.avatar }
                : require('../assets/default-avatar.png')
            }
            style={styles.avatar}
          />
          {isEditing && (
            <TouchableOpacity style={styles.editAvatarButton}>
              <MaterialIcons name="edit" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.profileForm}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            value={userProfile.name}
            onChangeText={(text) => setUserProfile({ ...userProfile, name: text })}
            editable={isEditing}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            value={userProfile.email}
            onChangeText={(text) => setUserProfile({ ...userProfile, email: text })}
            editable={isEditing}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            value={userProfile.phone}
            onChangeText={(text) => setUserProfile({ ...userProfile, phone: text })}
            editable={isEditing}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            value={userProfile.address}
            onChangeText={(text) => setUserProfile({ ...userProfile, address: text })}
            editable={isEditing}
            multiline
          />
        </View>

        {isEditing ? (
          <View style={styles.editButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleUpdateProfile}
            >
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => setIsEditing(true)}
          >
            <MaterialIcons name="edit" size={20} color="#fff" />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader 
        title="My Profile" 
        rightComponent={headerRight}
      />

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Ionicons
            name="list"
            size={24}
            color={activeTab === 'orders' ? COLORS.primary : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons
            name="person"
            size={24}
            color={activeTab === 'profile' ? COLORS.primary : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'orders' ? renderOrders() : renderProfile()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  logoutButton: {
    padding: 8,
  },
  header: {
    backgroundColor: '#fff',
    padding: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#333',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp('4%'),
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: wp('3.5%'),
    color: '#666',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: '#fff',
    margin: wp('4%'),
    borderRadius: 8,
    padding: wp('4%'),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: wp('3%'),
  },
  orderNumber: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#333',
  },
  orderDate: {
    fontSize: wp('3.5%'),
    color: '#666',
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: wp('3%'),
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: wp('3%'),
  },
  itemImage: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: 4,
  },
  itemDetails: {
    flex: 1,
    marginLeft: wp('3%'),
  },
  itemTitle: {
    fontSize: wp('3.5%'),
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: wp('3.5%'),
    color: COLORS.primary,
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: wp('3%'),
    paddingTop: wp('3%'),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  orderTotal: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#333',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: wp('4%'),
    paddingVertical: wp('2%'),
    borderRadius: 4,
    gap: 8,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: wp('3.5%'),
    fontWeight: '500',
  },
  profileHeader: {
    alignItems: 'center',
    padding: wp('4%'),
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: wp('25%'),
    height: wp('25%'),
    borderRadius: wp('12.5%'),
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
  },
  profileForm: {
    backgroundColor: '#fff',
    margin: wp('4%'),
    padding: wp('4%'),
    borderRadius: 8,
  },
  inputGroup: {
    marginBottom: wp('4%'),
  },
  label: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: wp('3%'),
    fontSize: wp('3.5%'),
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    borderColor: '#eee',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp('3%'),
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp('3%'),
    borderRadius: 4,
    gap: 8,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: wp('3.5%'),
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: wp('4%'),
    color: '#666',
    marginTop: wp('2%'),
  },
});

export default ProfileScreen; 