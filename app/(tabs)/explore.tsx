import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
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

const MAP_URI = Platform.OS === 'android'
    ? 'file:///android_asset/map.html'
    : 'file:///map.html';

const ExploreScreen = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const lang = i18n.language || 'fr';
    const [sites, setSites] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [mapReady, setMapReady] = useState(false);
    const webviewRef = useRef<WebView>(null);

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

    // Inject markers whenever data or map readiness changes
    useEffect(() => {
        if (!mapReady || !webviewRef.current) return;
        const markers = filteredSites
            .filter(s => s.latitude && s.longitude)
            .map(s => ({
                id: String(s.id),
                lat: s.latitude,
                lng: s.longitude,
                name: s.name?.[lang] || s.name?.fr || s.name || '',
                category: s.category || 'default',
                isAcc: !!s.is_accommodation,
                color: CATEGORY_COLORS[s.category] || CATEGORY_COLORS.default,
            }));
        const json = JSON.stringify(markers).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        webviewRef.current.injectJavaScript(`window.updateMarkers('${json}'); true;`);
    }, [filteredSites, lang, mapReady]);

    function handleWebViewMessage(event: any) {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.id) {
                router.push(data.is_accommodation ? `/accommodation/${data.id}` : `/site/${data.id}`);
            }
        } catch { }
    }

    return (
        <View style={styles.container}>
            <WebView
                ref={webviewRef}
                style={styles.map}
                source={{ uri: MAP_URI }}
                originWhitelist={['*', 'file://*']}
                onMessage={handleWebViewMessage}
                javaScriptEnabled
                domStorageEnabled
                allowFileAccess
                allowUniversalAccessFromFileURLs
                mixedContentMode="always"
                onLoadEnd={() => setMapReady(true)}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.mapLoader}>
                        <ActivityIndicator size="large" color="#1e293b" />
                    </View>
                )}
            />

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
    mapLoader: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
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
});