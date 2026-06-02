import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_HISTORY_KEY = '@recent_location_history';
const MAX_HISTORY_ITEMS = 10;

// Get user-specific key
const getUserKey = (phoneNumber) => {
  if (!phoneNumber) return RECENT_HISTORY_KEY;
  // Clean phone number to use as key
  const cleanPhone = phoneNumber.replace(/\s/g, '');
  return `${RECENT_HISTORY_KEY}_${cleanPhone}`;
};

// Save a location to recent history (user-specific)
export const saveToRecentHistory = async (location, phoneNumber) => {
  try {
    if (!phoneNumber) {
      console.warn('No phone number provided for saving recent history');
      return [];
    }
    
    const userKey = getUserKey(phoneNumber);
    const existing = await getRecentHistory(phoneNumber);
    
    // Remove if already exists (to move to top)
    const filtered = existing.filter(item => 
      item.label !== location.label || 
      (item.coordinates && location.coordinates && 
       item.coordinates[0] !== location.coordinates[0] && 
       item.coordinates[1] !== location.coordinates[1])
    );
    
    // Add timestamp for sorting
    const newItem = {
      ...location,
      timestamp: Date.now(),
      searchType: location.searchType || 'general'
    };
    
    // Add new to beginning
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    
    await AsyncStorage.setItem(userKey, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error saving to recent history:', error);
    return [];
  }
};

// Get recent history (user-specific)
export const getRecentHistory = async (phoneNumber) => {
  try {
    if (!phoneNumber) {
      console.warn('No phone number provided for getting recent history');
      return [];
    }
    
    const userKey = getUserKey(phoneNumber);
    const data = await AsyncStorage.getItem(userKey);
    if (data) {
      const parsed = JSON.parse(data);
      // Sort by timestamp (newest first)
      return parsed.sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
  } catch (error) {
    console.error('Error getting recent history:', error);
    return [];
  }
};

// Clear recent history (user-specific)
export const clearRecentHistory = async (phoneNumber) => {
  try {
    if (!phoneNumber) {
      console.warn('No phone number provided for clearing recent history');
      return [];
    }
    
    const userKey = getUserKey(phoneNumber);
    await AsyncStorage.removeItem(userKey);
    return [];
  } catch (error) {
    console.error('Error clearing recent history:', error);
    return [];
  }
};

// Remove specific item from history (user-specific)
export const removeFromRecentHistory = async (index, phoneNumber) => {
  try {
    if (!phoneNumber) {
      console.warn('No phone number provided for removing from recent history');
      return [];
    }
    
    const history = await getRecentHistory(phoneNumber);
    if (index >= 0 && index < history.length) {
      history.splice(index, 1);
      const userKey = getUserKey(phoneNumber);
      await AsyncStorage.setItem(userKey, JSON.stringify(history));
    }
    return history;
  } catch (error) {
    console.error('Error removing from recent history:', error);
    return [];
  }
};

// Get all users' history (for debugging/admin)
export const getAllUsersHistory = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const historyKeys = allKeys.filter(key => key.startsWith(RECENT_HISTORY_KEY));
    const histories = {};
    
    for (const key of historyKeys) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const phoneNumber = key.replace(`${RECENT_HISTORY_KEY}_`, '');
        histories[phoneNumber] = JSON.parse(data);
      }
    }
    return histories;
  } catch (error) {
    console.error('Error getting all users history:', error);
    return {};
  }
};