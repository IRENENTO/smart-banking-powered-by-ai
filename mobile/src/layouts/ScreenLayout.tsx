import React from 'react';
import { View, StyleSheet, ScrollView, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme';

type ScreenLayoutProps = ViewProps & {
  children: React.ReactNode;
  noScroll?: boolean;
};

const ScreenLayout: React.FC<ScreenLayoutProps> = ({ children, noScroll, style, ...props }) => (
  <LinearGradient colors={gradients.navy} style={[styles.container, style]}>
    {noScroll ? (
      <View style={styles.content} {...props}>
        {children}
      </View>
    ) : (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} {...props}>
        {children}
      </ScrollView>
    )}
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    minHeight: '100%',
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 24,
  },
});

export default ScreenLayout;
