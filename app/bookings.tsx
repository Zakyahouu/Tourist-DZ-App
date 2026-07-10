import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    MapPin,
    CheckCircle2,
    XCircle,
    Clock,
    Bell,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/context/AuthContext';
import logger from '../src/utils/logger';

export default function BookingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const lang = i18n.language || 'fr';
    const rtl = lang === 'ar';

    const [eventRegistrations, setEventRegistrations] = useState([]);
    const [accommodationRequests, setAccommodationRequests] = useState([]);
    const [eventCategories, setEventCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [announcementsModal, setAnnouncementsModal] = useState(null);

    const fetchData = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        try {
            const [evtRes, accRes, catRes] = await Promise.all([
                supabase
                    .from('event_registrations')
                    .select('id, status, registered_at, events(id, title, start_date, location, category_id)')
                    .eq('user_id', user.id)
                    .order('registered_at', { ascending: false }),
                supabase
                    .from('accommodation_requests')
                    .select('id, status, requested_at, rejection_reason, accommodations(id, title, location, start_date, end_date)')
                    .eq('user_id', user.id)
                    .order('requested_at', { ascending: false }),
                supabase.from('event_categories').select('*').order('sort_order'),
            ]);
            if (evtRes.error) throw evtRes.error;
            if (accRes.error) throw accRes.error;
            setEventRegistrations(evtRes.data || []);
            setAccommodationRequests(accRes.data || []);
            setEventCategories(catRes.data || []);
        } catch (err) {
            logger.error('fetchBookings error:', err);
            Alert.alert(t('common.error'), t('common.unknownError'));
        } finally {
            setLoading(false);
        }
    }, [user, t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCancelEvent = async (registrationId) => {
        Alert.alert(
            t('profile.cancelRegistration'),
            t('profile.cancelConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('profile.yesCancel'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('event_registrations')
                                .delete()
                                .eq('id', registrationId);
                            if (error) throw error;
                            setEventRegistrations((prev) =>
                                prev.filter((e) => e.id !== registrationId)
                            );
                        } catch (err) {
                            logger.error(err);
                            Alert.alert(t('common.error'), t('profile.cancelFailed'));
                        }
                    },
                },
            ]
        );
    };

    const viewAnnouncements = async (evt) => {
        try {
            const { data } = await supabase
                .from('event_announcements')
                .select('*')
                .eq('event_id', evt.id)
                .order('created_at', { ascending: false });
            setAnnouncementsModal({ event: evt, announcements: data || [] });
        } catch (err) {
            logger.error(err);
            Alert.alert(t('common.error'), t('profile.loadAnnouncementsFailed'));
        }
    };

    const getStatusColors = (status) => {
        const s = (status || 'pending').toLowerCase();
        switch (s) {
            case 'accepted':
            case 'confirmed':
                return { bg: '#dcfce7', text: '#059669' };
            case 'rejected':
                return { bg: '#fee2e2', text: '#dc2626' };
            case 'cancelled':
                return { bg: '#f1f5f9', text: '#64748b' };
            default:
                return { bg: '#fef3c7', text: '#d97706' };
        }
    };

    const StatusIcon = ({ status }) => {
        const s = (status || 'pending').toLowerCase();
        if (s === 'accepted' || s === 'confirmed') {
            return <CheckCircle2 size={12} stroke="#059669" />;
        }
        if (s === 'cancelled' || s === 'rejected') {
            return <XCircle size={12} stroke={s === 'cancelled' ? '#64748b' : '#dc2626'} />;
        }
        return <Clock size={12} stroke="#d97706" />;
    };

    if (!user) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.emptyText}>{t('common.notSpecified')}</Text>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#1F5B3A" />
            </View>
        );
    }

    const hasData = eventRegistrations.length > 0 || accommodationRequests.length > 0;

    return (
        <View style={{ flex: 1, direction: rtl ? 'rtl' : 'ltr' }}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        {rtl ? <ArrowRight size={22} stroke="#1F5B3A" /> : <ArrowLeft size={22} stroke="#1F5B3A" />}
                    </TouchableOpacity>
                    <Text style={styles.title}>{t('profile.bookings')}</Text>
                </View>

                {!hasData ? (
                    <View style={styles.emptyContainer}>
                        <Calendar size={48} stroke="#cbd5e1" />
                        <Text style={styles.emptyTitle}>{t('profile.noBookingsTitle')}</Text>
                        <Text style={styles.emptySubtitle}>
                            {t('profile.noBookingsSubtitle')}
                        </Text>
                    </View>
                ) : (
                    <>
                        {eventRegistrations.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>{t('profile.eventRegistrations')}</Text>
                                {eventRegistrations.map((reg) => {
                                    const evt = reg.events;
                                    if (!evt) return null;
                                    const colors = getStatusColors(reg.status);
                                    const cat = eventCategories.find(
                                        (c) => c.id === evt.category_id
                                    );
                                    const catName =
                                        cat?.[`name_${lang}`] || cat?.name?.fr || '';
                                    return (
                                        <View key={reg.id} style={styles.card}>
                                            <View style={styles.cardHeader}>
                                                <View
                                                    style={[
                                                        styles.badge,
                                                        { backgroundColor: colors.bg },
                                                    ]}
                                                >
                                                    <StatusIcon status={reg.status} />
                                                    <Text
                                                        style={[
                                                            styles.badgeText,
                                                            { color: colors.text },
                                                        ]}
                                                    >
                                                        {reg.status}
                                                    </Text>
                                                </View>
                                                {catName ? (
                                                    <Text style={styles.categoryBadge}>
                                                        {catName}
                                                    </Text>
                                                ) : null}
                                            </View>
                                            <Text style={styles.cardTitle}>
                                                {evt.title?.[i18n.language] ||
                                                    evt.title?.fr ||
                                                    'Event'}
                                            </Text>
                                            <View style={styles.cardMeta}>
                                                <View style={styles.metaItem}>
                                                    <Calendar size={14} stroke="#64748b" />
                                                    <Text style={styles.metaText}>
                                                        {new Date(
                                                            evt.start_date
                                                        ).toLocaleDateString()}
                                                    </Text>
                                                </View>
                                                {evt.location ? (
                                                    <View style={styles.metaItem}>
                                                        <MapPin size={14} stroke="#64748b" />
                                                        <Text style={styles.metaText}>
                                                            {evt.location}
                                                        </Text>
                                                    </View>
                                                ) : null}
                                            </View>
                                            <View style={styles.cardActions}>
                                                {reg.status === 'accepted' && (
                                                    <TouchableOpacity
                                                        style={styles.announceBtn}
                                                        onPress={() =>
                                                            viewAnnouncements(evt)
                                                        }
                                                    >
                                                        <Bell size={14} stroke="#0891b2" />
                                                        <Text style={styles.announceBtnText}>
                                                            {t('profile.announcements')}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )}
                                                <TouchableOpacity
                                                    style={styles.cancelBtn}
                                                    onPress={() =>
                                                        handleCancelEvent(reg.id)
                                                    }
                                                >
                                                    <Text style={styles.cancelBtnText}>
                                                        {t('profile.cancelRegistration')}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {accommodationRequests.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    {t('profile.accommodationRequests')}
                                </Text>
                                {accommodationRequests.map((req) => {
                                    const acc = req.accommodations;
                                    if (!acc) return null;
                                    const colors = getStatusColors(req.status);
                                    return (
                                        <View key={req.id} style={styles.card}>
                                            <View style={styles.cardHeader}>
                                                <View
                                                    style={[
                                                        styles.badge,
                                                        { backgroundColor: colors.bg },
                                                    ]}
                                                >
                                                    <StatusIcon status={req.status} />
                                                    <Text
                                                        style={[
                                                            styles.badgeText,
                                                            { color: colors.text },
                                                        ]}
                                                    >
                                                        {req.status}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={styles.cardTitle}>
                                                {acc.title?.[i18n.language] ||
                                                    acc.title?.fr ||
                                                    'Accommodation'}
                                            </Text>
                                            <View style={styles.cardMeta}>
                                                {acc.start_date ? (
                                                    <View style={styles.metaItem}>
                                                        <Calendar size={14} stroke="#64748b" />
                                                        <Text style={styles.metaText}>
                                                            {new Date(
                                                                acc.start_date
                                                            ).toLocaleDateString()}
                                                            {acc.end_date
                                                                ? ` – ${new Date(
                                                                      acc.end_date
                                                                  ).toLocaleDateString()}`
                                                                : ''}
                                                        </Text>
                                                    </View>
                                                ) : null}
                                                {acc.location ? (
                                                    <View style={styles.metaItem}>
                                                        <MapPin size={14} stroke="#64748b" />
                                                        <Text style={styles.metaText}>
                                                            {acc.location}
                                                        </Text>
                                                    </View>
                                                ) : null}
                                            </View>
                                            {req.status === 'rejected' &&
                                                req.rejection_reason && (
                                                    <Text style={styles.rejectionText}>
                                                        Reason: {req.rejection_reason}
                                                    </Text>
                                                )}
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            <Modal
                visible={!!announcementsModal}
                transparent
                animationType="fade"
                onRequestClose={() => setAnnouncementsModal(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setAnnouncementsModal(null)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {announcementsModal?.event?.title?.[lang] ||
                                    announcementsModal?.event?.title?.fr ||
                                    ''}{' '}
                                {t('profile.announcements')}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setAnnouncementsModal(null)}
                                style={styles.modalCloseBtn}
                            >
                                <XCircle size={22} stroke="#94a3b8" />
                            </TouchableOpacity>
                        </View>
                        {announcementsModal?.announcements?.length === 0 ? (
                            <Text style={styles.noAnnouncements}>
                                {t('profile.noAnnouncements')}
                            </Text>
                        ) : (
                            <ScrollView style={styles.announcementsList}>
                                {announcementsModal?.announcements?.map((a) => (
                                    <View key={a.id} style={styles.announcementItem}>
                                        <Text style={styles.announcementMessage}>
                                            {a[`message_${lang}`] || a.message_fr || a.message_en || a.message_ar || ''}
                                        </Text>
                                        <Text style={styles.announcementDate}>
                                            {new Date(
                                                a.created_at
                                            ).toLocaleDateString()}
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F7F4',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 60,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1F5B3A',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1F5B3A',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
        marginLeft: 4,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    categoryBadge: {
        fontSize: 11,
        fontWeight: '900',
        color: '#0891b2',
        backgroundColor: '#ecfeff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1F5B3A',
        marginBottom: 6,
    },
    cardMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 8,
    },
    announceBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ecfeff',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#cffafe',
    },
    announceBtnText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#0891b2',
    },
    cancelBtn: {
        backgroundColor: '#fef2f2',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    cancelBtnText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#dc2626',
    },
    rejectionText: {
        fontSize: 12,
        color: '#dc2626',
        fontWeight: '600',
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 24,
        width: '100%',
        maxHeight: '80%',
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1F5B3A',
        flex: 1,
        marginRight: 12,
    },
    modalCloseBtn: {
        padding: 4,
    },
    announcementsList: {
        maxHeight: 400,
    },
    announcementItem: {
        backgroundColor: '#F8F7F4',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    announcementMessage: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F5B3A',
        lineHeight: 20,
    },
    announcementDate: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '600',
        marginTop: 8,
    },
    noAnnouncements: {
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 14,
        paddingVertical: 32,
        fontWeight: '600',
    },
});
