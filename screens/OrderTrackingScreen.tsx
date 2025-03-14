import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation, useRoute } from '@react-navigation/native';
import WebView from 'react-native-webview';
import { DatabaseService } from '../lib/database';
import { COLORS } from '../constants';

const { width, height } = Dimensions.get('window');

const OrderTrackingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params as { orderId: string };
  const [order, setOrder] = useState<any>(null);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('');

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      const orderData = await DatabaseService.getOrderById(orderId);
      setOrder(orderData);

      // Generate random tracking data
      const currentDate = new Date();
      const deliveryDate = new Date(currentDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
      setEstimatedDelivery(deliveryDate.toLocaleDateString());

      // Generate random coordinates for demonstration
      const startLocation = { lat: 12.9716, lng: 77.5946 }; // Bangalore
      const endLocation = { lat: 13.0827, lng: 80.2707 }; // Chennai
      const currentLocation = {
        lat: startLocation.lat + (endLocation.lat - startLocation.lat) * Math.random(),
        lng: startLocation.lng + (endLocation.lng - startLocation.lng) * Math.random(),
      };

      setTrackingInfo({
        currentLocation,
        startLocation,
        endLocation,
        status: 'in_transit',
        updates: [
          {
            status: 'Order Placed',
            date: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            time: '10:30 AM',
            location: 'Bangalore Warehouse',
          },
          {
            status: 'Order Processed',
            date: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            time: '2:45 PM',
            location: 'Bangalore Sorting Center',
          },
          {
            status: 'In Transit',
            date: currentDate.toLocaleDateString(),
            time: '9:15 AM',
            location: 'En Route to Destination',
          },
        ],
      });
    } catch (error) {
      console.error('Error loading order details:', error);
    }
  };

  const getMapHtml = () => {
    if (!trackingInfo) return '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
          <style>
            #map { height: 100vh; width: 100vw; }
          </style>
        </head>
        <body style="margin: 0;">
          <div id="map"></div>
          <script>
            const map = L.map('map').setView([${trackingInfo.currentLocation.lat}, ${trackingInfo.currentLocation.lng}], 8);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Add markers
            const startMarker = L.marker([${trackingInfo.startLocation.lat}, ${trackingInfo.startLocation.lng}])
              .addTo(map)
              .bindPopup('Pickup Location');

            const currentMarker = L.marker([${trackingInfo.currentLocation.lat}, ${trackingInfo.currentLocation.lng}])
              .addTo(map)
              .bindPopup('Current Location');

            const endMarker = L.marker([${trackingInfo.endLocation.lat}, ${trackingInfo.endLocation.lng}])
              .addTo(map)
              .bindPopup('Delivery Location');

            // Draw route line
            const routePoints = [
              [${trackingInfo.startLocation.lat}, ${trackingInfo.startLocation.lng}],
              [${trackingInfo.currentLocation.lat}, ${trackingInfo.currentLocation.lng}],
              [${trackingInfo.endLocation.lat}, ${trackingInfo.endLocation.lng}]
            ];
            
            const routeLine = L.polyline(routePoints, {color: '#00796b'}).addTo(map);
            map.fitBounds(routeLine.getBounds());
          </script>
        </body>
      </html>
    `;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'order placed':
        return '#4caf50';
      case 'order processed':
        return '#2196f3';
      case 'in transit':
        return '#ff9800';
      case 'delivered':
        return '#4caf50';
      default:
        return '#666';
    }
  };

  if (!order || !trackingInfo) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00796b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          source={{ html: getMapHtml() }}
          style={styles.map}
        />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.deliveryInfo}>
          <View style={styles.estimatedDelivery}>
            <Text style={styles.estimatedDeliveryLabel}>Estimated Delivery</Text>
            <Text style={styles.estimatedDeliveryDate}>{estimatedDelivery}</Text>
          </View>

          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>Order #{orderId}</Text>
            <Text style={styles.orderStatus}>
              {trackingInfo.status === 'in_transit' ? 'In Transit' : trackingInfo.status}
            </Text>
          </View>
        </View>

        <View style={styles.timeline}>
          {trackingInfo.updates.map((update: any, index: number) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineDot,
                    { backgroundColor: getStatusColor(update.status) },
                  ]}
                />
                {index < trackingInfo.updates.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>{update.status}</Text>
                <Text style={styles.timelineLocation}>{update.location}</Text>
                <Text style={styles.timelineDateTime}>
                  {update.date} at {update.time}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#333',
    marginLeft: wp('4%'),
  },
  mapContainer: {
    height: height * 0.4,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  deliveryInfo: {
    backgroundColor: '#fff',
    padding: wp('4%'),
    marginBottom: 8,
  },
  estimatedDelivery: {
    marginBottom: wp('4%'),
  },
  estimatedDeliveryLabel: {
    fontSize: wp('3.5%'),
    color: '#666',
  },
  estimatedDeliveryDate: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#333',
  },
  orderStatus: {
    fontSize: wp('3.5%'),
    color: COLORS.primary,
    fontWeight: '500',
  },
  timeline: {
    backgroundColor: '#fff',
    padding: wp('4%'),
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: wp('4%'),
  },
  timelineLeft: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    marginLeft: wp('4%'),
  },
  timelineStatus: {
    fontSize: wp('3.5%'),
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  timelineLocation: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: 2,
  },
  timelineDateTime: {
    fontSize: wp('3%'),
    color: '#999',
  },
});

export default OrderTrackingScreen; 