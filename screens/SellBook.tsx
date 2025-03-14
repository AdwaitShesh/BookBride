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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomHeader from '../components/CustomHeader';

type RootStackParamList = {
  MainTabs: undefined;
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
    category: 'Engineering' as const,
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

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter book title');
      return false;
    }
    if (!formData.author.trim()) {
      Alert.alert('Error', 'Please enter author name');
      return false;
    }
    if (!formData.price.trim()) {
      Alert.alert('Error', 'Please enter price');
      return false;
    }
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Please enter location');
      return false;
    }
    if (!formData.sellerName.trim()) {
      Alert.alert('Error', 'Please enter seller name');
      return false;
    }
    if (!image) {
      Alert.alert('Error', 'Please upload a book image');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Create a new book object with timestamp-based ID
      const newBook = {
        id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: '',
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.price) * 1.5, // Set original price 50% higher
        category: formData.category,
        condition: formData.condition,
        location: formData.location.trim(),
        imageUrl: image,
        image: { uri: image },
        sellerName: formData.sellerName.trim(),
        postedDate: new Date().toISOString(),
        rating: 0,
        reviews: 0
      };
      
      // Add to global books pool
      await DatabaseService.addBook(newBook);
      
      Alert.alert(
        'Success',
        'Your book has been listed successfully!',
        [{ 
          text: 'OK', 
          onPress: () => {
            // Reset form
            setFormData({
              title: '',
              author: '',
              price: '',
              location: '',
              sellerName: '',
              condition: 'Good',
              category: 'Engineering'
            });
            setImage(null);
            // Navigate to Home tab in MainTabs
            navigation.reset({
              index: 0,
              routes: [{ 
                name: 'MainTabs',
                params: { screen: 'Home' }
              }],
            });
          }
        }]
      );
    } catch (error) {
      console.error('Error submitting book:', error);
      Alert.alert('Error', 'Failed to list your book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Engineering',
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil',
    'Chemical',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader 
        title="Sell Book" 
        onBack={() => navigation.goBack()} 
      />
      <KeyboardAwareScrollView
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    formData.category === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, category })}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      formData.category === category && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: wp('4%'),
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
  categoryContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  categoryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: wp('4%'),
    paddingVertical: wp('2%'),
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonActive: {
    backgroundColor: '#00796b',
    borderColor: '#00796b',
  },
  categoryButtonText: {
    color: '#666',
    fontSize: wp('3.2%'),
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default SellBook; 