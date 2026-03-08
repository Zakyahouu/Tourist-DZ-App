import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/src/lib/supabase';
import { Navigation, Search, Camera } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import logger from '@/src/utils/logger';

const ExploreScreen = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const lang = i18n.language || 'fr';
    const [sites, setSites] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [region, setRegion] = useState({
        latitude: 34.8516,
        longitude: 5.7281,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });

    useEffect(() => {
        async function fetchSites() {
            try {
                const { data, error } = await supabase
                    .from('tourist_sites')
                    .select('*')
                    .eq('is_active', true);
                if (data) setSites(data);
                if (error) logger.error('Error fetching sites:', error);
            } catch (err) {
                logger.error('Fetch error:', err);
            }
        }
        fetchSites();
    }, []);

    const filteredSites = useMemo(() => {
        if (!searchQuery.trim()) return sites;
        const q = searchQuery.toLowerCase();
        return sites.filter(s => {
            const name = (s.name?.[lang] || s.name?.fr || '').toLowerCase();
            return name.includes(q);
        });
    }, [sites, searchQuery, lang]);

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
                        pinColor="#f97316"
                        onPress={() => router.push(`/site/${site.id}`)}
                        onCalloutPress={() => {
                            router.push(`/site/${site.id}`);
                        }}
                    >
                        <Callout
                            tooltip={false}
                            onPress={() => router.push(`/site/${site.id}`)}
                        >
                            <View style={styles.calloutContainer}>
                                <Text style={styles.calloutTitle}>{site.name?.[lang] || site.name?.fr || 'Unknown Site'}</Text>
                                <Text style={styles.calloutCategory}>{(site.category || '').toUpperCase()}</Text>
                                <Text style={styles.calloutHint}>{t('details.viewDetails')} →</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            <View style={[styles.overlay, { top: insets.top + 20 }]}>
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
        left: 20,
        right: 20,
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
