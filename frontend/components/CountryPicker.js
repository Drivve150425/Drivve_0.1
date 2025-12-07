import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import { Colors } from '../constants/Colors';
import { countries } from '../constants/CountryData';

const { height } = Dimensions.get('window');

export default function CountryPicker({ 
  visible, 
  onClose, 
  onSelect, 
  selectedCountry 
}) {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dial.includes(searchQuery)
  );

  const handleSelect = (country) => {
    onSelect(country);
    onClose();
    setSearchQuery('');
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Country</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Search country or code"
          placeholderTextColor={Colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <ScrollView style={styles.countriesList}>
          {filteredCountries.map((country) => (
            <TouchableOpacity
              key={country.code}
              style={[
                styles.countryItem,
                selectedCountry?.code === country.code && styles.selectedCountry
              ]}
              onPress={() => handleSelect(country)}
            >
              <Text style={styles.flag}>{country.flag}</Text>
              <View style={styles.countryInfo}>
                <Text style={styles.countryName}>{country.name}</Text>
                <Text style={styles.countryCode}>{country.dial}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 18,
    color: Colors.gray,
  },
  searchInput: {
    margin: 20,
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 10,
    fontSize: 16,
    color: Colors.dark,
  },
  countriesList: {
    paddingHorizontal: 20,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedCountry: {
    backgroundColor: Colors.light,
  },
  flag: {
    fontSize: 24,
    marginRight: 15,
    alignItems: 'center',
  },
  countryInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countryName: {
    fontSize: 16,
    color: Colors.dark,
    fontWeight: '500',
  },
  countryCode: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
});
