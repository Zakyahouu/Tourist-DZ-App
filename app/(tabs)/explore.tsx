import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/src/lib/supabase';
import { Navigation, Search, Camera } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import logger from '@/src/utils/logger';

const CATEGORY_COLORS: Record<string, string> = {
    historical: '#eab308',
    natural: '#22c55e',
    cultural: '#a855f7',
    thermal: '#3b82f6',
    accommodation: '#ef4444',
    default: '#f97316',
};

const CATEGORIES = ['all', 'historical', 'natural', 'cultural', 'thermal', 'accommodation'] as const;

const ExploreScreen = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const lang = i18n.language || 'fr';
    const [sites, setSites] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [region, setRegion] = useState({
        latitude: 34.8516,
        longitude: 5.7281,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });

    useEffect(() => {
        async function fetchMapData() {
            try {
                const { data: sitesData, error: sitesError } = await supabase
                    .from('tourist_sites')
                    .select('*, site_images(image_url)')
                    .eq('is_active', true);
                if (sitesError) logger.error('Error fetching sites:', sitesError);

                const { data: accData, error: accError } = await supabase
                    .from('accommodations')
                    .select('*, accommodation_images(image_url)')
                    .eq('is_active', true);
                if (accError) logger.error('Error fetching accommodations:', accError);

                const mappedAccs = (accData || []).map(acc => ({
                    id: acc.id,
                    name: acc.name,
                    category: 'accommodation',
                    address: acc.address || '',
                    description: acc.description,
                    latitude: acc.latitude,
                    longitude: acc.longitude,
                    avg_rating: acc.rating || 0,
                    site_images: acc.accommodation_images || [],
                    is_accommodation: true,
                    type: acc.type,
                }));

                setSites([...(sitesData || []), ...mappedAccs]);
            } catch (err) {
                logger.error('Fetch error:', err);
            }
        }
        fetchMapData();
    }, []);

    const filteredSites = useMemo(() => {
        let result = sites;
        if (activeCategory !== 'all') {
            result = result.filter(s => s.category === activeCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s => {
                const name = (s.name?.[lang] || s.name?.fr || '').toLowerCase();
                return name.includes(q);
            });
        }
        return result;
    }, [sites, searchQuery, lang, activeCategory]);

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={region}
                onRegionChangeComplete={setRegion}
            >
                {filteredSites.map((site) => (
                    <Marker
                        key={site.id}
                        coordinate={{
                            latitude: site.latitude || 34.85,
                            longitude: site.longitude || 5.73,
                        }}
                        pinColor={CATEGORY_COLORS[site.category] || CATEGORY_COLORS.default}
                        onPress={() => router.push(site.is_accommodation ? `/accommodation/${site.id}` : `/site/${site.id}`)}
                        onCalloutPress={() => router.push(site.is_accommodation ? `/accommodation/${site.id}` : `/site/${site.id}`)}
                    >
                        <Callout tooltip={false}>
                            <View style={styles.calloutContainer}>
                                <Text style={styles.calloutTitle}>{site.name?.[lang] || site.name?.fr || 'Unknown'}</Text>
                                <Text style={styles.calloutCategory}>{(site.category || '').toUpperCase()}</Text>
                                <Text style={styles.calloutHint}>{t('details.viewDetails')} →</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            {/* Search + Category Filters */}
            <View style={[styles.overlay, { top: insets.top + 10 }]}>
                <View style={styles.searchBar}>
                    <Search size={16} stroke="#94a3b8" style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('home.searchPlaceholder')}
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
                            onPress={() => setActiveCategory(cat)}
                        >
                            {cat !== 'all' && (
                                <View style={[styles.colorDot, { backgroundColor: CATEGORY_COLORS[cat] }]} />
                            )}
                            <Text style={[styles.filterText, activeCategory === cat && styles.filterTextActive]}>
                                {t(`categories.${cat}`)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={[styles.floatingActions, { bottom: 30 }]}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => router.push('/scanner')}
                >
                    <Camera size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => router.push('/explore')}
                >
                    <Navigation size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ExploreScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    overlay: {
        position: 'absolute',
        left: 16,
        right: 16,
    },
    searchBar: {
        backgroundColor: 'white',
        height: 50,
        borderRadius: 25,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    filterRow: {
        paddingTop: 10,
        paddingBottom: 4,
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    filterChipActive: {
        backgroundColor: '#1e293b',
    },
    colorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
    },
    filterTextActive: {
        color: 'white',
    },
    floatingActions: {
        position: 'absolute',
        right: 20,
        gap: 12,
    },
    actionBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#1e293b',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    calloutContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 20,
        width: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    calloutTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 4,
    },
    calloutCategory: {
        fontSize: 12,
        fontWeight: '700',
        color: '#f97316',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    calloutHint: {
        fontSize: 12,
        fontWeight: '800',
        color: '#1e293b',
        marginTop: 4,
    },
});
