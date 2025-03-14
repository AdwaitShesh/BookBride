import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import CustomHeader from '../components/CustomHeader';
import { COLORS, FONTS } from '../constants';
import { Ionicons } from '@expo/vector-icons';

const dummyNotifications = [
  {
    id: '1',
    title: 'New Book Listed',
    message: 'A new Engineering book has been listed in your area',
    time: '2 hours ago',
    read: false,
    type: 'new_book',
  },
  {
    id: '2',
    title: 'Price Drop Alert',
    message: 'A book in your wishlist has dropped in price',
    time: '5 hours ago',
    read: false,
    type: 'price_drop',
  },
  {
    id: '3',
    title: 'Order Update',
    message: 'Your order #1234 has been shipped',
    time: '1 day ago',
    read: true,
    type: 'order',
  },
];

const NotificationsScreen = () => {
  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons 
          name={
            item.type === 'new_book' ? 'book' :
            item.type === 'price_drop' ? 'pricetag' : 'cube'
          } 
          size={24} 
          color={COLORS.primary} 
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader 
        title="Notifications" 
        showNotification={false}
      />
      <FlatList
        data={dummyNotifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: wp('4%'),
  },
  notificationItem: {
    flexDirection: 'row',
    padding: wp('4%'),
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: wp('3%'),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unreadNotification: {
    backgroundColor: COLORS.lightGreen,
  },
  iconContainer: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: COLORS.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('4%'),
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 4,
  },
  notificationMessage: {
    ...FONTS.body2,
    color: COLORS.gray,
    marginBottom: 4,
  },
  notificationTime: {
    ...FONTS.caption,
    color: COLORS.gray,
  },
});

export default NotificationsScreen; 