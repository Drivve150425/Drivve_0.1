// import React, { useRef, useEffect, useState } from 'react';
// import { View, TouchableOpacity, Animated, StyleSheet, Platform } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { Colors } from '../constants/Colors';

// const NAV_ITEMS = [
//   { key: 'home', icon: 'home', label: 'Home' },
//   { key: 'myride', icon: 'car-sport', label: 'My Rides' },
//   { key: 'chat', icon: 'chatbubbles', label: 'Chat' },
//   { key: 'alert', icon: 'notifications', label: 'Alerts' }
// ];

// const INDICATOR_SIZE = 38;

// const CoolBottomNavigation = ({ activeTab, onNavigate, unreadCount = 0 }) => {
//   const indicatorX = useRef(new Animated.Value(0)).current;
//   const [tabLayouts, setTabLayouts] = useState(Array(NAV_ITEMS.length).fill(null));
//   const [barLayout, setBarLayout] = useState(null);

//   useEffect(() => {
//     // Only animate when all tab layouts and bar layout are set and valid
//     if (!barLayout) return;
//     if (tabLayouts.some(l => l === null)) return;

//     const activeIndex = NAV_ITEMS.findIndex(item => item.key === activeTab);
//     const tabLayout = tabLayouts[activeIndex];
//     if (!tabLayout) return;
//     const { x, width } = tabLayout;

//     const tabCenter = x + width / 3;
//     const indicatorLeft = tabCenter - INDICATOR_SIZE * 4.5;
//     Animated.spring(indicatorX, {
//       toValue: indicatorLeft,
//       useNativeDriver: true,
//       friction: 8,
//       tension: 90,
//     }).start();
//   }, [activeTab, tabLayouts, barLayout]);

//   // DEBUG LOGGING
//   useEffect(() => {
//     // Uncomment for debugging layout values
//     //console.log('barLayout', barLayout);
//     // console.log('tabLayouts', tabLayouts);
//   }, [tabLayouts, barLayout]);

//   return (
//     <View style={styles.outerWrapper}>
//       <View
//         style={styles.navBar}
//         onLayout={e => setBarLayout(e.nativeEvent.layout)}
//       >
//         {barLayout && tabLayouts.every(l => l) && (
//           <Animated.View
//             style={[
//               styles.indicator,
//               {
//                 transform: [{ translateX: indicatorX }]
//               }
//             ]}
//           />
//         )}
//         {NAV_ITEMS.map((item, idx) => {
//           const isActive = item.key === activeTab;
//           return (
//             <TouchableOpacity
//               key={item.key}
//               style={styles.tabButton}
//               activeOpacity={0.82}
//               onPress={() => onNavigate(item.key)}
//               onLayout={e => {
//                 const { x, width } = e.nativeEvent.layout;
//                 setTabLayouts(prev => {
//                   // Only update layout the first time to avoid bouncing
//                   if (prev[idx] && prev[idx].x === x && prev[idx].width === width) return prev;
//                   const next = prev.slice();
//                   next[idx] = { x, width };
//                   return next;
//                 });
//               }}
//             >
//               {/* <Ionicons
//                 name={item.icon}
//                 size={27}
//                 color={isActive ? Colors.white : Colors.gray}//'#9CA3AF'}
//                 style={styles.icon}
//               /> */}
//               <View style={{ position: 'relative' }}>
//   <Ionicons
//     name={item.icon}
//     size={27}
//     color={isActive ? Colors.white : Colors.gray}
//     style={styles.icon}
//   />

//   {item.key === 'alert' && unreadCount > 0 && (
//     <View style={styles.badge}>
//       <Animated.Text style={styles.badgeText}>
//         {unreadCount > 9 ? '9+' : unreadCount}
//       </Animated.Text>
//     </View>
//   )}
// </View>

//               <Animated.Text style={[
//                 styles.label,
//                 {
//                   color: isActive ? Colors.primary : Colors.gray,  //#fff
//                   fontWeight: isActive ? 'bold' : '500',
//                   opacity: isActive ? 1 : 0.82
//                 }
//               ]}>
//                 {item.label}
//               </Animated.Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   outerWrapper: {
//     position: 'absolute',
//     bottom: 0, left: 0, right: 0,
//     alignItems: 'center',
//     zIndex: 40,
//     backgroundColor: Colors.white,
//   },
//   navBar: {
//     width: '95%',
//     height: 60,
//     marginBottom: Platform.OS === 'ios' ? 35 : 35,
//     backgroundColor: Colors.white,
//     borderRadius: 36,
//     borderWidth: 0.5,
//     borderColor: Colors.light,
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     paddingHorizontal: 2,
//     position: 'relative',
//     overflow: 'visible',
//     shadowColor: Colors.gray,//'#5B6FD8',
//     shadowOpacity: .80,
//     shadowRadius: 2,
//     shadowOffset: { width: 0, height: 4 },
//     opacity: 0.93,
//   },
//   indicator: {
//     position: 'absolute',
//     top: 4.5,
//     width: INDICATOR_SIZE,
//     height: INDICATOR_SIZE,
//     borderRadius: INDICATOR_SIZE / 2,
//     backgroundColor: Colors.primary,//'#5B6FD8cc',
//     zIndex: 3,
//     //shadowColor: Colors.primary,//'#5B6FD8',
//     //shadowOpacity: 0.20,
//     //shadowRadius: 10,
//     //shadowOffset: { width: 0, height: 4 },
//     elevation: 2,
//     //opacity: 0.93,
//   },
//   tabButton: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     height: '100%',
//     zIndex: 5,
//     paddingVertical: 2,
//   },
//   label: {
//     fontSize: 12,
//     marginTop: 5,
//     letterSpacing: 0.1,
//     marginBottom: -10,
//   },
//   icon: {
//     marginBottom: 0,
//     marginTop: -5,
//   },
//   badge: {
//   position: 'absolute',
//   top: -6,
//   right: -10,
//   minWidth: 16,
//   height: 16,
//   borderRadius: 8,
//   backgroundColor: '#ff3b30',
//   justifyContent: 'center',
//   alignItems: 'center',
//   paddingHorizontal: 3,
//   zIndex: 10,
// },
// badgeText: {
//   color: '#fff',
//   fontSize: 9,
//   fontWeight: 'bold',
// },

// });

// export default CoolBottomNavigation;
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
  Text,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Image } from 'react-native';

import {
  scale,
  verticalScale,
  moderateScale
} from 'react-native-size-matters';

const NAV_ITEMS = [
  { key: 'home', icon: 'home', label: 'Home' },
  { key: 'myride', icon: 'car-sport', label: 'My Rides' },
  { key: 'chat', icon: 'chatbubbles', label: 'Chat' },
  // { key: 'alert', icon: 'notifications', label: 'Alerts' },
  { key: 'profile', icon: 'person', label: 'Profile' }

];

const BottomNavigation = ({
  activeTab,
  onNavigate,
  unreadCount = 0,
  profileImage,
  navigation
}) => {
  const { isAuthenticated, user } = useAuth() || { isAuthenticated: false, user: {} };

  const indicatorX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  const INDICATOR_SIZE = scale(28);

  /**
   * Move indicator
   */
 useEffect(() => {
  if (!containerWidth) return;

  const activeIndex = NAV_ITEMS.findIndex(
    item => item.key === activeTab
  );

  const tabWidth = containerWidth / NAV_ITEMS.length;

  const left =
    tabWidth * activeIndex +
    tabWidth / 2 -
    INDICATOR_SIZE / 2;

  Animated.spring(indicatorX, {
    toValue: left,
    useNativeDriver: false,
    friction: 8,
    tension: 90,
  }).start();

}, [activeTab, containerWidth]);

  return (
    <View style={styles.wrapper}>

      <View
        style={styles.navBar}
        onLayout={(e) =>
          setContainerWidth(e.nativeEvent.layout.width)
        }
      >

        {/* Indicator */}
        {containerWidth > 0 && (
          <Animated.View
            style={[
              styles.indicator,
              {
                width: INDICATOR_SIZE,
                height: INDICATOR_SIZE,
                borderRadius: INDICATOR_SIZE / 2,
                left: indicatorX,
              }
            ]}
          />
        )}

        {NAV_ITEMS.map(item => {

          const isActive = item.key === activeTab;

          return (
            <TouchableOpacity
              key={item.key}
              style={styles.tabButton}
              activeOpacity={0.85}
              onPress={() => onNavigate?.(item.key)}
            >

              <View style={styles.iconContainer}>
                {item.key === 'profile' && profileImage ? (

  <Image
    source={{ uri: profileImage }}
    style={[
      styles.profileDp,
      {
        borderColor: isActive
          ? Colors.primary
          : 'transparent'
      }
    ]}
  />

) : (

  <Ionicons
    name={item.icon}
    size={moderateScale(22)}
    color={isActive ? Colors.white : Colors.gray}
  />

)}


                {/* {item.key === 'alert' && unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )} */}
              </View>

              <Text
                style={[
                  styles.label,
                  {
                    color: isActive
                      ? Colors.primary
                      : Colors.gray,
                    fontWeight: isActive ? '600' : '400',
                  }
                ]}
              >
                {item.label}
              </Text>

            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default BottomNavigation;


/* ================= STYLES ================= */

const styles = StyleSheet.create({

  // wrapper: {
  //   position: 'absolute',
  //   bottom: verticalScale(18),
  //   width: '100%',
  //   alignItems: 'center',
  //   //zIndex: 50,
  //   backgroundColor: '#ffffff',//Colors.white,
  //   borderRadius: moderateScale(100),
  //   //paddingBottom: verticalScale(10),
  //   //paddingTop: verticalScale(2),
  //   },

 navBar: {
    height: verticalScale(56),
    position: 'absolute',
    bottom: verticalScale(18),
    backgroundColor: Platform.OS === 'ios' ? '#ffffffc5' : '#c2bfbf80',//'#dfdada38' ,//'#ffffffc5' , //Colors.white,
    borderRadius: moderateScale(40),
    borderColor: Platform.OS === 'ios' ? Colors.gray : '#c2bfbf95',
    flexDirection: 'row',
    width: '92%',
    maxWidth: 620, // prevents tablet stretching
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 0, // remove extra padding
    shadowColor: Colors.gray,//'#5B6FD8',
    shadowOpacity: .80,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    opacity: 0.93,
    position: 'relative',
    overflow: 'visible',
  },

  indicator: {
    position: 'absolute',
    top: verticalScale(8),
    backgroundColor: Colors.primary,
    zIndex: 1,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(6),
    zIndex: 5,
  },

  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  label: {
    marginTop: verticalScale(4),
    fontSize: moderateScale(11),
    letterSpacing: 0.3,
  },

  badge: {
    position: 'absolute',
    top: verticalScale(-5),
    right: scale(-10),

    minWidth: scale(18),
    height: scale(18),
    borderRadius: scale(9),

    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1.5,
    borderColor: Colors.white,
  },

  badgeText: {
    color: '#fff',
    fontSize: moderateScale(9),
    fontWeight: 'bold',
  },
  profileDp: {
    width: scale(26),
    height: scale(22),
    borderRadius: scale(13),

    borderWidth: 2,
  },

});
