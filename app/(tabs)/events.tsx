import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/src/lib/supabase';
import { Calendar, MapPin, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import logger from '@/src/utils/logger';

export default function EventsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const lang = i18n.language || 'fr';
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('is_active', true)
                    .gte('end_date', new Date().toISOString().split('T')[0])
                    .order('start_date', { ascending: true });
                if (error) logger.error('fetchEvents error:', error);
                if (data) setEvents(data);
            } catch (err) {
                logger.error('fetchEvents exception:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    const renderItem = ({ item }: { item: any }) => {
        const date = new Date(item.start_date);
        const day = date.getDate();
        const month = date.toLocaleString(lang, { month: 'short' });
        const imageUrl = item.image_url || 'https://images.unsplash.com/photo-1549487535-61df1f822aa7?auto=format&fit=crop&q=80&w=800';

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
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateMonth}>{month}</Text>
                        <Text style={styles.dateDay}>{day}</Text>
                    </View>
                </ImageBackground>
                <View style={styles.eventInfo}>
                    <Text style={styles.eventCategory}>{(item.type || '').toUpperCase()}</Text>
                    <Text style={styles.eventTitle} numberOfLines={2}>{item.title?.[lang] || item.title?.fr}</Text>
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

            {loading ? (
                <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
            ) : events.length === 0 ? (
                <View style={styles.emptyState}>
                    <Calendar size={48} stroke="#cbd5e1" />
                    <Text style={styles.emptyTitle}>{t('home.upcomingEvents')}</Text>
                    <Text style={styles.emptySubtitle}>No upcoming events at the moment.</Text>
                </View>
            ) : (
                <FlatList
                    data={events}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
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
        alignItems: 'flex-start',
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
    eventInfo: {
        padding: 16,
    },
    eventCategory: {
        fontSize: 10,
        fontWeight: '800',
        color: '#f97316',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    eventTitle: {
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
