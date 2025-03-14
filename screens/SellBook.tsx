import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { DatabaseService } from '../lib/database';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  SellBook: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'SellBook'>;

const SellBook = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    location: '',
    sellerName: '',
    condition: 'Good' as const,
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('Error', 'Please upload a book image');
      return;
    }

    if (!formData.title || !formData.author || !formData.price || !formData.location || !formData.sellerName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      await DatabaseService.addBook({
        title: formData.title,
        author: formData.author,
        price: parseFloat(formData.price),
        location: formData.location,
        sellerName: formData.sellerName,
        condition: formData.condition,
        imageUrl: image,
      });

      Alert.alert('Success', 'Book listed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Home');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to list book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00796b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sell Your Book</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Image Upload Section */}
        <TouchableOpacity style={styles.imageUploadContainer} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <MaterialIcons name="add-photo-alternate" size={40} color="#00796b" />
              <Text style={styles.uploadText}>Upload Book Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Book Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter book title"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Author</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter author name"
              value={formData.author}
              onChangeText={(text) => setFormData({ ...formData, author: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter selling price"
              keyboardType="numeric"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your location"
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Seller Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={formData.sellerName}
              onChangeText={(text) => setFormData({ ...formData, sellerName: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Condition</Text>
            <View style={styles.conditionButtons}>
              {['Like New', 'Good', 'Fair'].map((condition) => (
                <TouchableOpacity
                  key={condition}
                  style={[
                    styles.conditionButton,
                    formData.condition === condition && styles.conditionButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, condition })}
                >
                  <Text
                    style={[
                      styles.conditionButtonText,
                      formData.condition === condition && styles.conditionButtonTextActive,
                    ]}
                  >
                    {condition}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <FontAwesome5 name="check" size={16} color="#fff" style={styles.submitIcon} />
              <Text style={styles.submitButtonText}>List Book</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    fontWeight: 'bold',
    color: '#333',
    marginLeft: wp('2%'),
  },
  content: {
    flex: 1,
  },
  imageUploadContainer: {
    margin: wp('4%'),
    height: hp('25%'),
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  uploadText: {
    marginTop: 8,
    fontSize: wp('3.5%'),
    color: '#00796b',
  },
  formContainer: {
    padding: wp('4%'),
  },
  inputGroup: {
    marginBottom: hp('2%'),
  },
  label: {
    fontSize: wp('3.5%'),
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    padding: wp('3%'),
    borderRadius: 8,
    fontSize: wp('3.5%'),
    borderWidth: 1,
    borderColor: '#ddd',
  },
  conditionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  conditionButton: {
    flex: 1,
    padding: wp('3%'),
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  conditionButtonActive: {
    backgroundColor: '#00796b',
    borderColor: '#00796b',
  },
  conditionButtonText: {
    textAlign: 'center',
    color: '#666',
    fontSize: wp('3.2%'),
  },
  conditionButtonTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#00796b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp('4%'),
    margin: wp('4%'),
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
});

export default SellBook; 