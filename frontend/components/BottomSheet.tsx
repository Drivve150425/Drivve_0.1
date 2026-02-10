// components/BottomSheet.tsx
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, View } from 'react-native';

const { height: H } = Dimensions.get('window');

export type BottomSheetRef = {
  expand: () => void;
  collapse: () => void;
  isExpanded: () => boolean;
};

type Props = {
  collapsedHeight?: number;
  expandedHeight?: number;
  onChange?: (expanded: boolean) => void;
  children: React.ReactNode;
};

const BottomSheet = forwardRef<BottomSheetRef, Props>(function BottomSheet(
  {
    collapsedHeight = 300,
    expandedHeight = Math.round(H * 0.72),
    onChange,
    children,
  },
  ref
) {
  const maxY = useMemo(() => H - expandedHeight, [expandedHeight]); // expanded position (higher)
  const minY = useMemo(() => H - collapsedHeight, [collapsedHeight]); // collapsed position (lower)

  const translateY = useRef(new Animated.Value(minY)).current;
  const lastY = useRef(minY);

  const setExpanded = (to: number) => {
    lastY.current = to;
    onChange?.(to === maxY);
    Animated.spring(translateY, {
      toValue: to,
      useNativeDriver: true,
      damping: 22,
      stiffness: 240,
      mass: 0.9,
    }).start();
  };

  const expand = () => setExpanded(maxY);
  const collapse = () => setExpanded(minY);

  useImperativeHandle(ref, () => ({
    expand,
    collapse,
    isExpanded: () => lastY.current === maxY,
  }));

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
      onPanResponderMove: (_, g) => {
        const next = Math.min(minY, Math.max(maxY, lastY.current + g.dy));
        translateY.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy < -40) return expand();
        if (g.dy > 40) return collapse();

        const mid = (minY + maxY) / 2;
        const current = (translateY as any)._value ?? lastY.current;
        setExpanded(current < mid ? maxY : minY);
      },
    })
  ).current;

  return (
    <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
      <View style={styles.handleArea} {...panResponder.panHandlers}>
        <View style={styles.handle} />
      </View>
      {children}
    </Animated.View>
  );
});

export default BottomSheet;

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
    elevation: 14,
    overflow: 'hidden',
  },
  handleArea: { height: 26, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 44, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' },
});
