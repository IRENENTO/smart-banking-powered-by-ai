import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, typography } from '../theme';
import { APP_CONFIG } from '../constants';

const SplashScreen: React.FC = () => {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.8, duration: 900, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={gradients.navy} style={styles.container}>
      <Animated.View style={[styles.logoWrapper, { opacity }]}> 
        <View style={styles.glow} />
        <Text style={styles.logo}>AI BANK</Text>
      </Animated.View>
      <Text style={styles.tagline}>Smart Banking Powered by AI</Text>
      <Text style={styles.footer}>Loading secure finance experience...</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoWrapper: {
    width: 170,
    height: 170,
    borderRadius: 90,
    backgroundColor: 'rgba(46,229,213,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(46,229,213,0.16)',
  },
  logo: {
    color: colors.dark.text,
    fontSize: typography.h1,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tagline: {
    color: colors.dark.textSecondary,
    fontSize: typography.body,
    marginBottom: 10,
    textAlign: 'center',
  },
  footer: {
    color: colors.dark.textSecondary,
    fontSize: typography.small,
    textAlign: 'center',
    marginTop: 32,
  },
});

export default SplashScreen;
