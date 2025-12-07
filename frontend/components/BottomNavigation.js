import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const NAV_ITEMS = [
  { key: 'home', icon: 'home', label: 'Home' },
  { key: 'myride', icon: 'car-sport', label: 'My Rides' },
  { key: 'plus', icon: 'add-circle', label: 'Drive' },
  { key: 'chat', icon: 'chatbubbles', label: 'Chat' },
  { key: 'alert', icon: 'notifications', label: 'Alerts' }
];

const INDICATOR_SIZE = 36;

const CoolBottomNavigation = ({ activeTab, onNavigate }) => {
  const indicatorX = useRef(new Animated.Value(0)).current;
  const [tabLayouts, setTabLayouts] = useState(Array(NAV_ITEMS.length).fill(null));
  const [barLayout, setBarLayout] = useState(null);

  useEffect(() => {
    // Only animate when all tab layouts and bar layout are set and valid
    if (!barLayout) return;
    if (tabLayouts.some(l => l === null)) return;

    const activeIndex = NAV_ITEMS.findIndex(item => item.key === activeTab);
    const tabLayout = tabLayouts[activeIndex];
    if (!tabLayout) return;
    const { x, width } = tabLayout;

    const tabCenter = x + width / 4.5;
    const indicatorLeft = tabCenter - INDICATOR_SIZE * 4.6;
    Animated.spring(indicatorX, {
      toValue: indicatorLeft,
      useNativeDriver: true,
      friction: 8,
      tension: 90,
    }).start();
  }, [activeTab, tabLayouts, barLayout]);

  // DEBUG LOGGING
  useEffect(() => {
    // Uncomment for debugging layout values
    //console.log('barLayout', barLayout);
    // console.log('tabLayouts', tabLayouts);
  }, [tabLayouts, barLayout]);

  return (
    <View style={styles.outerWrapper}>
      <View
        style={styles.navBar}
        onLayout={e => setBarLayout(e.nativeEvent.layout)}
      >
        {barLayout && tabLayouts.every(l => l) && (
          <Animated.View
            style={[
              styles.indicator,
              {
                transform: [{ translateX: indicatorX }]
              }
            ]}
          />
        )}
        {NAV_ITEMS.map((item, idx) => {
          const isActive = item.key === activeTab;
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.tabButton}
              activeOpacity={0.82}
              onPress={() => onNavigate(item.key)}
              onLayout={e => {
                const { x, width } = e.nativeEvent.layout;
                setTabLayouts(prev => {
                  // Only update layout the first time to avoid bouncing
                  if (prev[idx] && prev[idx].x === x && prev[idx].width === width) return prev;
                  const next = prev.slice();
                  next[idx] = { x, width };
                  return next;
                });
              }}
            >
              <Ionicons
                name={item.icon}
                size={27}
                color={isActive ? Colors.white : Colors.gray}//'#9CA3AF'}
                style={styles.icon}
              />
              <Animated.Text style={[
                styles.label,
                {
                  color: isActive ? Colors.primary : Colors.gray,  //#fff
                  fontWeight: isActive ? 'bold' : '500',
                  opacity: isActive ? 1 : 0.82
                }
              ]}>
                {item.label}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    alignItems: 'center',
    zIndex: 40,
    backgroundColor: Colors.white,
  },
  navBar: {
    width: '95%',
    height: 60,
    marginBottom: Platform.OS === 'ios' ? 35 : 35,
    backgroundColor: Colors.white,
    borderRadius: 36,
    borderWidth: 0.5,
    borderColor: Colors.light,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 2,
    position: 'relative',
    overflow: 'visible',
    shadowColor: Colors.gray,//'#5B6FD8',
    shadowOpacity: .80,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 4 },
    opacity: 0.93,
  },
  indicator: {
    position: 'absolute',
    top: 4.5,
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    backgroundColor: Colors.primary,//'#5B6FD8cc',
    zIndex: 3,
    //shadowColor: Colors.primary,//'#5B6FD8',
    //shadowOpacity: 0.20,
    //shadowRadius: 10,
    //shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    //opacity: 0.93,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 5,
    paddingVertical: 2,
  },
  label: {
    fontSize: 12,
    marginTop: 5,
    letterSpacing: 0.1,
    marginBottom: -10,
  },
  icon: {
    marginBottom: 0,
    marginTop: -5,
  },
});

export default CoolBottomNavigation;
