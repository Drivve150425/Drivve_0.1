// import React, { useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { MaterialIcons } from '@expo/vector-icons';
// import { Colors, Typography } from '../constants/Colors';
// import * as Haptics from 'expo-haptics';

// const { width, height } = Dimensions.get('window');

// export default function SuccessAnimation({ visible, onComplete }) {
//   const scaleAnim = useRef(new Animated.Value(0)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const checkmarkScale = useRef(new Animated.Value(0)).current;
//   const textFade = useRef(new Animated.Value(0)).current;
//   const rotateAnim = useRef(new Animated.Value(0)).current;
//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const particleAnims = useRef([...Array(8)].map(() => new Animated.Value(0))).current;
//   const ringScale1 = useRef(new Animated.Value(0)).current;
//   const ringScale2 = useRef(new Animated.Value(0)).current;
//   const ringOpacity = useRef(new Animated.Value(0.8)).current;

//   useEffect(() => {
//     if (visible) {
//       // Trigger haptic feedback
//       if (Platform.OS !== 'web') {
//         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//       }
//       startAnimation();
//     }
//   }, [visible]);

//   const startAnimation = () => {
//     // Start rotating animation for decorative ring
//     Animated.loop(
//       Animated.timing(rotateAnim, {
//         toValue: 1,
//         duration: 3000,
//         useNativeDriver: true,
//       })
//     ).start();

//     // Pulse animation
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnim, {
//           toValue: 1.05,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseAnim, {
//           toValue: 1,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();

//     // Expanding rings animation
//     Animated.parallel([
//       Animated.sequence([
//         Animated.timing(ringScale1, {
//           toValue: 1.5,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//       ]),
//       Animated.sequence([
//         Animated.delay(200),
//         Animated.timing(ringScale2, {
//           toValue: 1.8,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//       ]),
//       Animated.timing(ringOpacity, {
//         toValue: 0,
//         duration: 1000,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     // Particle animations
//     particleAnims.forEach((anim, index) => {
//       Animated.timing(anim, {
//         toValue: 1,
//         duration: 1500,
//         delay: index * 100,
//         useNativeDriver: true,
//       }).start();
//     });

//     // Main sequence of animations - TEXT NOW APPEARS AT THE START
//     Animated.parallel([
//       // Background fade in
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 250,
//         useNativeDriver: true,
//       }),
//       // Scale in container
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         tension: 80,
//         friction: 6,
//         useNativeDriver: true,
//       }),
//       // ✅ TEXT APPEARS IMMEDIATELY
//       Animated.timing(textFade, {
//         toValue: 1,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//       // Checkmark animation (starts parallel with text)
//       Animated.spring(checkmarkScale, {
//         toValue: 1,
//         tension: 100,
//         friction: 5,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     // Wait then fade out
//     setTimeout(() => {
//       Animated.parallel([
//         Animated.timing(fadeAnim, {
//           toValue: 0,
//           duration: 300,
//           useNativeDriver: true,
//         }),
//         Animated.timing(scaleAnim, {
//           toValue: 0.8,
//           duration: 300,
//           useNativeDriver: true,
//         }),
//       ]).start(() => {
//         if (onComplete) {
//           onComplete();
//         }
//       });
//     }, 2500);
//   };

//   if (!visible) return null;

//   const rotation = rotateAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '360deg'],
//   });

//   return (
//     <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
//       {/* Background blur effect simulation */}
//       <View style={styles.blurBackground} />

//       {/* Main container - properly centered */}
//       <View style={styles.centerContainer}>
//         <Animated.View
//           style={[
//             styles.container,
//             {
//               transform: [{ scale: scaleAnim }],
//             },
//           ]}
//         >
//           {/* Gradient Card Background */}
//           <LinearGradient
//             colors={['#FFFFFF', '#F0F9FF']}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={styles.gradientCard}
//           >
//             {/* Centered content wrapper */}
//             <View style={styles.contentWrapper}>
//               {/* Rotating decorative ring - centered */}
//               <View style={styles.animationArea}>
//                 <Animated.View
//                   style={[
//                     styles.decorativeRing,
//                     {
//                       transform: [{ rotate: rotation }],
//                     },
//                   ]}
//                 >
//                   <View style={styles.dashedRing} />
//                 </Animated.View>

//                 {/* Expanding rings - centered */}
//                 <Animated.View
//                   style={[
//                     styles.expandingRing,
//                     {
//                       transform: [{ scale: ringScale1 }],
//                       opacity: ringOpacity,
//                     },
//                   ]}
//                 />
//                 <Animated.View
//                   style={[
//                     styles.expandingRing,
//                     styles.expandingRing2,
//                     {
//                       transform: [{ scale: ringScale2 }],
//                       opacity: ringOpacity.interpolate({
//                         inputRange: [0, 0.8],
//                         outputRange: [0, 0.5],
//                       }),
//                     },
//                   ]}
//                 />

//                 {/* Success Circle with Gradient - centered */}
//                 <View style={styles.successCircleContainer}>
//                   <LinearGradient
//                     colors={['#10B981', '#059669']}
//                     start={{ x: 0, y: 0 }}
//                     end={{ x: 1, y: 1 }}
//                     style={styles.successCircle}
//                   >
//                     {/* Animated Checkmark */}
//                     <Animated.View
//                       style={[
//                         styles.checkmarkContainer,
//                         {
//                           transform: [
//                             { scale: checkmarkScale },
//                             {
//                               rotate: checkmarkScale.interpolate({
//                                 inputRange: [0, 1],
//                                 outputRange: ['-45deg', '0deg'],
//                               }),
//                             },
//                           ],
//                         },
//                       ]}
//                     >
//                       <MaterialIcons name="check" size={60} color="#FFFFFF" />
//                     </Animated.View>
//                   </LinearGradient>

//                   {/* Glow effect */}
//                   <View style={styles.glowEffect} />
//                 </View>
//               </View>

//               {/* Success Text - NOW APPEARS AT START */}
//               <Animated.View
//                 style={[
//                   styles.textContainer,
//                   {
//                     opacity: textFade,
//                     transform: [{ scale: pulseAnim }],
//                   },
//                 ]}
//               >
//                 <Text style={styles.successTitle}>Verified!</Text>
//                 <Text style={styles.successMessage}>OTP verification successful</Text>
//               </Animated.View>
//             </View>

//             {/* Success badge */}
//             <View style={styles.badge}>
//               <LinearGradient
//                 colors={['#34D399', '#10B981']}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//                 style={styles.badgeGradient}
//               >
//                 <MaterialIcons name="verified" size={24} color="#FFFFFF" />
//               </LinearGradient>
//             </View>
//           </LinearGradient>
//         </Animated.View>

//         {/* Floating particles - centered relative to card */}
//         <View style={styles.particlesContainer}>
//           {particleAnims.map((anim, index) => (
//             <Animated.View
//               key={index}
//               style={[
//                 styles.particle,
//                 {
//                   left: `${(index * 12) + 10}%`,
//                   transform: [
//                     {
//                       translateY: anim.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [0, -200],
//                       }),
//                     },
//                     {
//                       scale: anim.interpolate({
//                         inputRange: [0, 0.5, 1],
//                         outputRange: [0, 1, 0.5],
//                       }),
//                     },
//                   ],
//                   opacity: anim.interpolate({
//                     inputRange: [0, 0.3, 0.7, 1],
//                     outputRange: [0, 1, 0.5, 0],
//                   }),
//                 },
//               ]}
//             >
//               <View style={styles.particleDot} />
//             </Animated.View>
//           ))}
//         </View>
//       </View>
//     </Animated.View>
//   );
// }

// const styles = StyleSheet.create({
//   overlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//     zIndex: 1000,
//   },
//   blurBackground: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0, 0, 0, 0.3)',
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   container: {
//     width: '100%',
//     maxWidth: 380,
//     alignItems: 'center',
//   },
//   gradientCard: {
//     width: '100%',
//     borderRadius: 32,
//     paddingVertical: 50,
//     paddingHorizontal: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#10B981',
//     shadowOffset: {
//       width: 0,
//       height: 20,
//     },
//     shadowOpacity: 0.4,
//     shadowRadius: 30,
//     elevation: 25,
//     borderWidth: 2,
//     borderColor: 'rgba(16, 185, 129, 0.2)',
//   },
//   contentWrapper: {
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   animationArea: {
//     width: 160,
//     height: 160,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 30,
//     position: 'relative',
//   },
//   decorativeRing: {
//     position: 'absolute',
//     width: 160,
//     height: 160,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   dashedRing: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 80,
//     borderWidth: 3,
//     borderColor: '#10B981',
//     borderStyle: 'dashed',
//     opacity: 0.3,
//   },
//   expandingRing: {
//     position: 'absolute',
//     width: 110,
//     height: 110,
//     borderRadius: 55,
//     borderWidth: 3,
//     borderColor: '#10B981',
//   },
//   expandingRing2: {
//     borderWidth: 2,
//   },
//   successCircleContainer: {
//     width: 120,
//     height: 120,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   successCircle: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 60,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#10B981',
//     shadowOffset: {
//       width: 0,
//       height: 10,
//     },
//     shadowOpacity: 0.5,
//     shadowRadius: 20,
//     elevation: 15,
//   },
//   glowEffect: {
//     position: 'absolute',
//     width: 140,
//     height: 140,
//     borderRadius: 70,
//     backgroundColor: '#10B981',
//     opacity: 0.2,
//     zIndex: -1,
//   },
//   checkmarkContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   textContainer: {
//     alignItems: 'center',
//     width: '100%',
//   },
//   successTitle: {
//     ...Typography.h1,
//     fontSize: 36,
//     fontWeight: '900',
//     color: '#10B981',
//     marginBottom: 10,
//     textAlign: 'center',
//     letterSpacing: 1,
//   },
//   successMessage: {
//     ...Typography.body1,
//     fontSize: 16,
//     color: '#6B7280',
//     textAlign: 'center',
//     fontWeight: '500',
//   },
//   badge: {
//     position: 'absolute',
//     top: -15,
//     right: -15,
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     overflow: 'hidden',
//     shadowColor: '#10B981',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.4,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   badgeGradient: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   particlesContainer: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   particle: {
//     position: 'absolute',
//     bottom: '50%',
//   },
//   particleDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#10B981',
//     shadowColor: '#10B981',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.8,
//     shadowRadius: 4,
//     elevation: 5,
//   },
// });
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants/Colors';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function SuccessAnimation({ visible, onComplete, type = 'ride' }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const particleAnims = useRef([...Array(8)].map(() => new Animated.Value(0))).current;
  const ringScale1 = useRef(new Animated.Value(0)).current;
  const ringScale2 = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0.8)).current;

  // Different content based on type
  const getContent = () => {
    if (type === 'ride') {
      return {
        title: 'Ride Posted!',
        message: 'Your ride has been posted successfully',
        icon: 'check',
      colors: ['#10B981', '#059669'],
        iconColor: '#FFFFFF'
      };
    }
    return {
      title: 'Verified!',
      message: 'OTP verification successful',
      icon: 'check',
      colors: ['#10B981', '#059669'],
      iconColor: '#FFFFFF'
    };
  };

  const content = getContent();

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      startAnimation();
    }
  }, [visible]);

  const startAnimation = () => {
    // Start rotating animation for decorative ring
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Expanding rings animation
    Animated.parallel([
      Animated.sequence([
        Animated.timing(ringScale1, {
          toValue: 1.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(ringScale2, {
          toValue: 1.8,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(ringOpacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Particle animations
    particleAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 1500,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });

    // Main sequence of animations
    Animated.parallel([
      // Background fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      // Scale in container
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
      // TEXT APPEARS IMMEDIATELY
      Animated.timing(textFade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // Checkmark animation
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Wait then fade out
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onComplete) {
          onComplete();
        }
      });
    }, 2500);
  };

  if (!visible) return null;

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      {/* Background blur effect simulation */}
      <View style={styles.blurBackground} />

      {/* Main container - properly centered */}
      <View style={styles.centerContainer}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Gradient Card Background */}
          <LinearGradient
            colors={['#FFFFFF', '#FFF7ED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            {/* Centered content wrapper */}
            <View style={styles.contentWrapper}>
              {/* Rotating decorative ring - centered */}
              <View style={styles.animationArea}>
                <Animated.View
                  style={[
                    styles.decorativeRing,
                    {
                      transform: [{ rotate: rotation }],
                      borderColor: content.colors[0],
                    },
                  ]}
                >
                  <View style={[styles.dashedRing, { borderColor: content.colors[0] }]} />
                </Animated.View>

                {/* Expanding rings - centered */}
                <Animated.View
                  style={[
                    styles.expandingRing,
                    {
                      transform: [{ scale: ringScale1 }],
                      opacity: ringOpacity,
                      borderColor: content.colors[0],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.expandingRing,
                    styles.expandingRing2,
                    {
                      transform: [{ scale: ringScale2 }],
                      opacity: ringOpacity.interpolate({
                        inputRange: [0, 0.8],
                        outputRange: [0, 0.5],
                      }),
                      borderColor: content.colors[0],
                    },
                  ]}
                />

                {/* Success Circle with Gradient - centered */}
                <View style={styles.successCircleContainer}>
                  <LinearGradient
                    colors={content.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.successCircle}
                  >
                    {/* Animated Checkmark */}
                    <Animated.View
                      style={[
                        styles.checkmarkContainer,
                        {
                          transform: [
                            { scale: checkmarkScale },
                            {
                              rotate: checkmarkScale.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['-45deg', '0deg'],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <MaterialIcons name={content.icon} size={60} color={content.iconColor} />
                    </Animated.View>
                  </LinearGradient>

                  {/* Glow effect */}
                  <View style={[styles.glowEffect, { backgroundColor: content.colors[0], opacity: 0.2 }]} />
                </View>
              </View>

              {/* Success Text */}
              <Animated.View
                style={[
                  styles.textContainer,
                  {
                    opacity: textFade,
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Text style={[styles.successTitle, { color: content.colors[0] }]}>{content.title}</Text>
                <Text style={styles.successMessage}>{content.message}</Text>
              </Animated.View>
            </View>

            {/* Success badge */}
            <View style={styles.badge}>
              <LinearGradient
                colors={content.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.badgeGradient}
              >
                <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
              </LinearGradient>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Floating particles - centered relative to card */}
        <View style={styles.particlesContainer}>
          {particleAnims.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  left: `${(index * 12) + 10}%`,
                  transform: [
                    {
                      translateY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -200],
                      }),
                    },
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 1, 0.5],
                      }),
                    },
                  ],
                  opacity: anim.interpolate({
                    inputRange: [0, 0.3, 0.7, 1],
                    outputRange: [0, 1, 0.5, 0],
                  }),
                },
              ]}
            >
              <View style={[styles.particleDot, { backgroundColor: content.colors[0] }]} />
            </Animated.View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10000,
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  gradientCard: {
    width: '100%',
    borderRadius: 32,
    paddingVertical: 50,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 25,
    borderWidth: 2,
    borderColor: 'rgba(237, 113, 23, 0.2)',
  },
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationArea: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  decorativeRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashedRing: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    borderWidth: 3,
    borderStyle: 'dashed',
    opacity: 0.3,
  },
  expandingRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
  },
  expandingRing2: {
    borderWidth: 2,
  },
  successCircleContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  successCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ED7117',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  glowEffect: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    zIndex: -1,
  },
  checkmarkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1,
  },
  successMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: -15,
    right: -15,
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#ED7117',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    bottom: '50%',
  },
  particleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: '#ED7117',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
});