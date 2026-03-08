import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, ImageBackground, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/src/lib/supabase';
import { Calendar, MapPin, Users, Search, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/src/context/AuthContext';
import logger from '@/src/utils/logger';

const EVENT_CATEGORIES = [
    { id: 'all', labelKey: 'categories.all' },
    { id: 'tour', labelKey: 'events.types.tour' },
    { id: 'camp', labelKey: 'events.types.camp' },
    { id: 'competition', labelKey: 'events.types.competition' },
    { id: 'volunteer', labelKey: 'events.types.volunteer' },
    { id: 'cultural', labelKey: 'categories.cultural' },
];

export default function EventsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const lang = i18n.language || 'fr';
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('events')
                .select('*')
                .eq('is_active', true)
                .gte('end_date', new Date().toISOString())
                .order('start_date', { ascending: true });

            if (filter !== 'all') {
                query = query.eq('type', filter);
            }

            const { data, error } = await query;
            if (error) logger.error('fetchEvents error:', error);
            if (data) setEvents(data);

            if (user) {
                const { data: regData } = await supabase
                    .from('event_registrations')
                    .select('event_id')
                    .eq('user_id', user.id);
                if (regData) setRegisteredEvents(new Set(regData.map((r: any) => r.event_id)));
            }
        } catch (err) {
            logger.error('fetchEvents exception:', err);
        } finally {
            setLoading(false);
        }
    }, [filter, user]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const filteredEvents = searchQuery.trim()
        ? events.filter(e => {
            const title = (e.title?.[lang] || e.title?.fr || '').toLowerCase();
            const loc = (e.location || '').toLowerCase();
            const q = searchQuery.toLowerCase();
            return title.includes(q) || loc.includes(q);
        })
        : events;

    const renderItem = ({ item }: { item: any }) => {
        const date = new Date(item.start_date);
        const day = date.getDate();
        const month = date.toLocaleString(lang, { month: 'short' });
        const imageUrl = item.image_url || 'https://images.unsplash.com/photo-1549487535-61df1f822aa7?auto=format&fit=crop&q=80&w=800';
        const isRegistered = registeredEvents.has(item.id);

        return (
            <TouchableOpacity
                style={styles.eventCard}
                onPress={() => router.push(`/event/${item.id}`)}
                activeOpacity={0.9}
            >
                <ImageBackground
                    source={{ uri: imageUrl }}
                    style={styles.eventImage}
                    imageStyle={styles.eventImageInner}
                >
                    <View style={styles.imageOverlay} />
                    <View style={styles.badgeRow}>
                        <View style={styles.dateBadge}>
                            <Text style={styles.dateMonth}>{month}</Text>
                            <Text style={styles.dateDay}>{day}</Text>
                        </View>
                        {item.is_solidarity && (
                            <View style={styles.solidarityBadge}>
                                <Heart size={10} stroke="white" fill="white" />
                                <Text style={styles.solidarityText}>{t('solidarity.title')}</Text>
                            </View>
                        )}
                    </View>
                </ImageBackground>
                <View style={styles.eventCardInfo}>
                    <Text style={styles.eventCategory}>{(item.type || '').toUpperCase()}</Text>
                    <Text style={styles.eventCardTitle} numberOfLines={2}>{item.title?.[lang] || item.title?.fr}</Text>
                    <View style={styles.eventDetails}>
                        <View style={styles.detailItem}>
                            <MapPin size={14} stroke="#64748b" />
                            <Text style={styles.detailText}>{item.location}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Users size={14} stroke="#64748b" />
                            <Text style={styles.detailText}>{item.max_participants || '∞'} {t('events.seats')}</Text>
                        </View>
                    </View>
                    {isRegistered && (
                        <View style={styles.registeredTag}>
                            <Text style={styles.registeredText}>{t('events.alreadyRegistered')}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('nav.events')}</Text>
                <Text style={styles.subtitle}>{t('app.tagline')}</Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Search size={18} stroke="#64748b" />
                <TextInput
                    placeholder={t('home.searchPlaceholder')}
                    placeholderTextColor="#94a3b8"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.filterRow}>
                {EVENT_CATEGORIES.map(cat => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[styles.filterChip, filter === cat.id && styles.filterChipActive]}
                        onPress={() => setFilter(cat.id)}
                    >
                        <Text style={[styles.filterText, filter === cat.id && styles.filterTextActive]}>
                            {t(cat.labelKey)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading ? (
                <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
            ) : filteredEvents.length === 0 ? (
                <View style={styles.emptyState}>
                    <Calendar size={48} stroke="#cbd5e1" />
                    <Text style={styles.emptyTitle}>{t('home.upcomingEvents')}</Text>
                    <Text style={styles.emptySubtitle}>No upcoming events at the moment.</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredEvents}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews
                    maxToRenderPerBatch={10}
                    windowSize={5}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
        marginTop: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 48,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '600',
    },
    filterRow: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        gap: 6,
        alignItems: 'center',
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 16,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginRight: 6,
    },
    filterChipActive: {
        backgroundColor: '#f97316',
        borderColor: '#f97316',
    },
    filterText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
    },
    filterTextActive: {
        color: 'white',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    eventCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        overflow: 'hidden',
    },
    eventImage: {
        height: 160,
        width: '100%',
        justifyContent: 'flex-end',
        padding: 12,
    },
    eventImageInner: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.15)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    dateBadge: {
        backgroundColor: 'white',
        borderRadius: 14,
        width: 56,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dateMonth: {
        fontSize: 10,
        fontWeight: '900',
        color: '#f97316',
        textTransform: 'uppercase',
    },
    dateDay: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1e293b',
    },
    solidarityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ef4444',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
    },
    solidarityText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '800',
    },
    eventCardInfo: {
        padding: 16,
    },
    eventCategory: {
        fontSize: 10,
        fontWeight: '800',
        color: '#f97316',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    eventCardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
    },
    eventDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
    registeredTag: {
        marginTop: 10,
        backgroundColor: '#dcfce7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    registeredText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#16a34a',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
});
