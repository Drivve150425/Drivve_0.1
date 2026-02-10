// BackgroundAnimation.js — 3D Mesh Aurora (no new packages)
// deps already in your app: expo-linear-gradient, react-native-svg
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View, StyleSheet, Dimensions, Animated,
  AccessibilityInfo, Appearance, AppState,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

const { width: W } = Dimensions.get("window");
const STRIP_WIDTH = W * 3; // wide strip for visible sweep

const AnimatedLG = Animated.createAnimatedComponent(LinearGradient);
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Tuned palettes
const DAY  = ["#12b981", "#06b6d4", "#3b82f6", "#22c55e"];  // eco blue-green
const NIGHT= ["#0ea5e9", "#6366f1", "#22d3ee", "#0ea5e9"];  // neon ocean

function pickStart() {
  const h = new Date().getHours(); // local hours [web:151]
  return (h < 6 || h >= 19) ? NIGHT : DAY;
}

export default function BackgroundAnimation({
  height = 360,
  intensity = 1.0,       // 0.7 calm, 1.0 default, 1.3 vivid
  sweepDuration = 15000, // gradient sweep
  cycleEvery = 20000,    // palette rotate
  smokeCount = 6,        // smoke puffs
}) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [appState, setAppState] = useState("active");

  // accessibility + lifecycle
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion); // OS pref [web:106]
    const sub = AppState.addEventListener("change", s => setAppState(s)); // pause timers [web:131]
    return () => sub.remove();
  }, []);

  // sliding gradient strips + palette cross‑fade
  const [colorsA, setColorsA] = useState(pickStart());
  const [colorsB, setColorsB] = useState(DAY);
  useEffect(() => {
    const th = Appearance.addChangeListener(() => setColorsA(pickStart())); // theme/time [web:135]
    return () => th.remove();
  }, []);

  const cross = useRef(new Animated.Value(0)).current; // 0=>A, 1=>B
  const gA = useRef(new Animated.Value(0)).current;
  const gB = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) return;
    const loop = v => Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: sweepDuration, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: sweepDuration, useNativeDriver: true }),
    ]));
    const la = loop(gA), lb = loop(gB); la.start(); lb.start();
    return () => { la.stop(); lb.stop(); }; // transforms only [web:109]
  }, [reduceMotion, sweepDuration]);

  useEffect(() => {
    if (reduceMotion || appState !== "active") return;
    const id = setInterval(() => {
      const next = (Math.random() < 0.5) ? DAY : NIGHT;
      setColorsB(next);
      Animated.timing(cross, { toValue: 1, duration: 900, useNativeDriver: true }).start(() => {
        setColorsA(next); cross.setValue(0);
      });
    }, cycleEvery);
    return () => clearInterval(id); // clean timers [web:123][web:130]
  }, [reduceMotion, appState, cycleEvery, cross]);

  const txA = gA.interpolate({ inputRange: [0, 1], outputRange: [-W,  W] }); // visible sweep [web:72]
  const txB = gB.interpolate({ inputRange: [0, 1], outputRange: [ W, -W] });
  const opB = cross;

  // shimmer diagonal band
  const sh = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduceMotion) return;
    const l = Animated.loop(Animated.sequence([
      Animated.timing(sh, { toValue: 1, duration: 7000, useNativeDriver: true }),
      Animated.timing(sh, { toValue: 0, duration: 7000, useNativeDriver: true }),
    ]));
    l.start(); return () => l.stop();
  }, [reduceMotion]);
  const shTx = sh.interpolate({ inputRange: [0, 1], outputRange: [-W, W] });

  // parallax wave layers
  const wavePath =
    "M0,40 C80,10 160,70 240,40 C320,10 400,70 480,40 C560,10 640,70 720,40 C760,25 780,20 800,40 L800,120 L0,120 Z";
  const w1 = useRef(new Animated.Value(0)).current;
  const w2 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduceMotion) return;
    const loop = (v, dur) => Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: -800, duration: dur, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0,    duration:   0, useNativeDriver: true }),
    ]));
    const l1 = loop(w1, 14000), l2 = loop(w2, 20000);
    l1.start(); l2.start(); return () => { l1.stop(); l2.stop(); };
  }, [reduceMotion]);

  // smoke drift
  const puffVals = useMemo(() => Array.from({ length: smokeCount }, () => new Animated.Value(0)), [smokeCount]);
  useEffect(() => {
    if (reduceMotion) return;
    const loops = puffVals.map((v, i) =>
      Animated.loop(Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 6000 + (i * 600) % 3000, delay: (i * 280) % 1200, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]))
    );
    loops.forEach(l => l.start()); return () => loops.forEach(l => l.stop());
  }, [reduceMotion, puffVals]);

  const baseY = height - 120;
  const bandOpacity = 0.14 * intensity;
  const wave1C = "rgba(255,255,255,0.22)";
  const wave2C = "rgba(255,255,255,0.12)";

  return (
    <View pointerEvents="none" style={[styles.root, { height }]}>
      {/* Sliding mesh/aurora*/}
      <AnimatedLG colors={colorsA} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.strip, { width: STRIP_WIDTH, transform: [{ translateX: reduceMotion ? 0 : txA }] }]} />
      <AnimatedLG colors={colorsB} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.strip, { width: STRIP_WIDTH, opacity: reduceMotion ? 0 : opB, transform: [{ translateX: reduceMotion ? 0 : txB }] }]} />

      {/* Diagonal shimmer 
      {!reduceMotion && (
        <Animated.View style={[styles.shimmer, { opacity: bandOpacity, transform: [{ translateX: shTx }] }]}>
          <LinearGradient colors={["transparent", "white", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ width: W * 2, height }} />
        </Animated.View>
      )}
        */}

      {/* Waves */}
      <View style={styles.waves}>
        <Animated.View style={[styles.waveTile, { transform: [{ translateX: w1 }] }]}>
          <Svg width={800} height={120} viewBox="0 0 800 120"><Path d={wavePath} fill={wave1C} /></Svg>
        </Animated.View>
        <Animated.View style={[styles.waveTile, { left: 800, transform: [{ translateX: w1 }] }]}>
          <Svg width={800} height={120} viewBox="0 0 800 120"><Path d={wavePath} fill={wave1C} /></Svg>
        </Animated.View>
        <Animated.View style={[styles.waveTile, { bottom: 8, transform: [{ translateX: w2 }] }]}>
          <Svg width={800} height={120} viewBox="0 0 800 120"><Path d={wavePath} fill={wave2C} /></Svg>
        </Animated.View>
        <Animated.View style={[styles.waveTile, { left: 800, bottom: 8, transform: [{ translateX: w2 }] }]}>
          <Svg width={800} height={120} viewBox="0 0 800 120"><Path d={wavePath} fill={wave2C} /></Svg>
        </Animated.View>
      </View>

      {/* Smoke puffs */}
      {!reduceMotion && puffVals.map((v, i) => {
        const startX = W * 0.2 + (i % 3) * (W * 0.6 / 3);
        const size = 42 + ((i * 11) % 26);
        const tx = v.interpolate({ inputRange: [0, 1], outputRange: [startX, startX + 24 * intensity] });
        const ty = v.interpolate({ inputRange: [0, 1], outputRange: [baseY, baseY - 110 * intensity] });
        const sc = v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.2] });
        const op = v.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });
        return (
          <Animated.View key={`p-${i}`} style={{
            position: "absolute", width: size, height: size, borderRadius: size/2,
            backgroundColor: "rgba(255,255,255,0.8)",
            transform: [{ translateX: tx }, { translateY: ty }, { scale: sc }],
            opacity: op,
          }} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { position: "absolute", left: 0, right: 0, top: 0, overflow: "hidden" }, // header stays tappable [web:92]
  strip: { position: "absolute", left: -Dimensions.get("window").width, top: 0, bottom: 0 },
  shimmer: { position: "absolute", left: -Dimensions.get("window").width, top: 0, bottom: 0, transform: [{ rotate: "-18deg" }] },
  waves:  { position: "absolute", left: 0, right: 0, bottom: 0, height: 120, overflow: "hidden" },
  waveTile:{ position: "absolute", bottom: 0, height: 120, width: 800 },
});
