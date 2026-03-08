import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { Search, MapPin, Calendar, Heart, Camera } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/src/lib/supabase';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import logger from '@/src/utils/logger';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = i18n.language || 'fr';
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredSites, setFeaturedSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFeatured();
  }, []);

  async function fetchFeatured() {
    try {
      const { data, error } = await supabase
        .from('tourist_sites')
        .select('*, site_images(image_url)')
        .eq('is_active', true)
        .limit(5);
      if (error) logger.error('fetchFeatured error:', error);
      if (data) setFeaturedSites(data);
    } catch (err) {
      logger.error('fetchFeatured exception:', err);
    } finally {
      setLoading(false);
    }
  }

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('favorites')
        .select('site_id')
        .eq('user_id', user.id);
      if (data) setFavoriteIds(new Set(data.map((f: any) => f.site_id)));
    } catch (err) {
      logger.error('fetchFavorites exception:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavoriteIds(new Set());
    }
  }, [user, fetchFavorites]);

  const toggleFavorite = useCallback(async (siteId: string) => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    const isFav = favoriteIds.has(siteId);
    // Optimistic update
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (isFav) next.delete(siteId);
      else next.add(siteId);
      return next;
    });
    if (isFav) {
      const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('site_id', siteId);
      if (error) {
        logger.error('removeFavorite error:', error);
        setFavoriteIds(prev => { const next = new Set(prev); next.add(siteId); return next; });
      }
    } else {
      const { error } = await supabase.from('favorites').insert({ user_id: user.id, site_id: siteId });
      if (error) {
        logger.error('addFavorite error:', error);
        setFavoriteIds(prev => { const next = new Set(prev); next.delete(siteId); return next; });
      }
    }
  }, [user, favoriteIds, router]);

  const filteredSites = searchQuery.trim()
    ? featuredSites.filter(site => {
        const name = (site.name?.[lang] || site.name?.fr || '').toLowerCase();
        return name.includes(searchQuery.toLowerCase());
      })
    : featuredSites;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar style="light" />

      {/* Hero Section */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1545805553-c454eef7dd45?auto=format&fit=crop&q=80&w=1200' }}
        style={[styles.hero, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.overlay} />
        <View style={styles.heroContent}>
          <View style={styles.heroRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t('app.tagline').toUpperCase()}</Text>
            </View>
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={() => router.push('/scanner')}
            >
              <Camera size={20} stroke="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTitle}>{t('app.title')} {"\n"}<Text style={styles.accentText}>Biskra</Text></Text>

          <View style={styles.searchContainer}>
            <Search size={20} stroke="#64748b" style={styles.searchIcon} />
            <TextInput
              placeholder={t('home.searchPlaceholder')}
              placeholderTextColor="#94a3b8"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </ImageBackground>

      {/* Featured Sites */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.featuredPlaces')}</Text>
          <TouchableOpacity onPress={() => router.push('/explore')}>
            <Text style={styles.seeAllText}>{t('home.viewAll')}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#f97316" style={{ marginVertical: 20 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {filteredSites.map((site) => {
              const isFav = favoriteIds.has(site.id);
              return (
                <TouchableOpacity
                  key={site.id}
                  style={styles.card}
                  onPress={() => router.push(`/site/${site.id}`)}
                  activeOpacity={0.9}
                >
                  <View style={styles.cardImageContainer}>
                    <ImageBackground
                      source={{ uri: site.site_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1549487535-61df1f822aa7?auto=format&fit=crop&q=80&w=600' }}
                      style={styles.cardImage}
                    >
                      <TouchableOpacity
                        style={styles.favoriteBtn}
                        onPress={() => toggleFavorite(site.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Heart size={16} stroke="white" fill={isFav ? 'white' : 'transparent'} />
                      </TouchableOpacity>
                    </ImageBackground>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardCategory}>{site.category.toUpperCase()}</Text>
                    <Text style={styles.cardName} numberOfLines={1}>{site.name?.[lang] || site.name?.fr}</Text>
                    <View style={styles.cardFooter}>
                      <MapPin size={14} color="#f97316" />
                      <Text style={styles.cardLocation}>Biskra, DZ</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Quick Navigation */}
      <View style={styles.quickNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/explore')}>
          <View style={[styles.navIcon, { backgroundColor: '#eff6ff' }]}>
            <MapPin color="#2563eb" size={24} />
          </View>
          <Text style={styles.navText}>{t('nav.map') || t('nav.explore')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/events')}>
          <View style={[styles.navIcon, { backgroundColor: '#f0fdf4' }]}>
            <Calendar color="#16a34a" size={24} />
          </View>
          <Text style={styles.navText}>{t('nav.events')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/gallery')}>
          <View style={[styles.navIcon, { backgroundColor: '#fff7ed' }]}>
            <Heart color="#ea580c" size={24} />
          </View>
          <Text style={styles.navText}>{t('nav.gallery')}</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  hero: {
    height: 400,
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroContent: {
    zIndex: 1,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scanBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#f97316',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 1,
  },
  heroTitle: {
    color: 'white',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 48,
    marginBottom: 24,
  },
  accentText: {
    color: '#f97316',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  section: {
    paddingVertical: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
  },
  seeAllText: {
    color: '#f97316',
    fontWeight: '700',
    fontSize: 14,
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  card: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 24,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImageContainer: {
    height: 180,
    width: '100%',
  },
  cardImage: {
    flex: 1,
    width: '100%',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 16,
  },
  cardCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f97316',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLocation: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
    fontWeight: '600',
  },
  quickNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  navItem: {
    alignItems: 'center',
    width: 100,
  },
  navIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  navText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
  },
});
