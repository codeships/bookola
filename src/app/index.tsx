import { router } from 'expo-router';
import React from 'react';
import AppIntroSlider from 'react-native-app-intro-slider';
import { Image, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/shared/app-button';
import { useAppTheme } from '@/lib/theme/use-app-theme';

type Slide = {
  key: string;
  title: string;
  text: string;
  image: number;
  backgroundColor: string;
};

const slides: Slide[] = [
  {
    key: 'discover',
    title: 'Read Smarter',
    text: 'Curated books, notes, and audio in one premium space designed for calm focus.',
    image: require('../../assets/images/learn.png'),
    backgroundColor: '#F5F9FF',
  },
  {
    key: 'listen',
    title: 'Listen Anywhere',
    text: 'Move from page to audio with a seamless flow that keeps your momentum alive.',
    image: require('../../assets/images/edu.png'),
    backgroundColor: '#FFF8EC',
  },
  {
    key: 'grow',
    title: 'Built Around You',
    text: 'Track progress, save highlights, and get AI-powered recommendations that actually fit.',
    image: require('../../assets/images/road.png'),
    backgroundColor: '#EFFBF4',
  },
];

export default function App() {
  const { colors } = useAppTheme();

  const renderItem = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <View style={[styles.orb, styles.orbOne]} />
      <View style={[styles.orb, styles.orbTwo]} />
      <View style={styles.heroCard}>
        <View style={styles.imageHalo} />
        <Image source={item.image} style={styles.image} resizeMode="contain" />
      </View>
      <Text style={[styles.kicker, { color: colors.mutedText }]}>BOOKOLA</Text>
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.text, { color: colors.mutedText }]}>{item.text}</Text>
    </View>
  );

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderItem}
      showSkipButton
      onSkip={() => router.replace('/(auth)/login')}
      onDone={() => router.replace('/(auth)/login')}
      renderSkipButton={() => (
        <View style={styles.skipButton}>
          <Text style={[styles.skipText, { color: colors.mutedText }]}>Skip</Text>
        </View>
      )}
      renderNextButton={() => (
        <View style={styles.ctaButton}>
          <Text style={styles.ctaText}>Next</Text>
        </View>
      )}
      renderDoneButton={() => (
        <View style={styles.ctaButton}>
          <Text style={styles.ctaText}>Start</Text>
        </View>
      )}
      activeDotStyle={{ ...styles.activeDot, backgroundColor: colors.text }}
      dotStyle={{ ...styles.dot, backgroundColor: colors.text + '1F' }}
    />
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 64,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbOne: {
    top: 78,
    right: -30,
    width: 180,
    height: 180,
    backgroundColor: 'rgba(91, 140, 255, 0.12)',
  },
  orbTwo: {
    bottom: 170,
    left: -40,
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 188, 125, 0.16)',
  },
  heroCard: {
    width: '100%',
    maxWidth: 360,
    height: 360,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 38,
    overflow: 'hidden',
  },
  imageHalo: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  image: {
    width: 280,
    height: 280,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.4,
    marginBottom: 14,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  text: {
    maxWidth: 320,
    fontSize: 16,
    lineHeight: 27,
    textAlign: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 30,
    height: 10,
    borderRadius: 999,
    marginHorizontal: 4,
  },
  ctaButton: {
    minWidth: 108,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  skipButton: {
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
