import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
    Linking
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    MapPin,
    Users,
    Calendar,
    Clock,
    Info,
    CheckCircle2,
    Shield,
    QrCode,
    Headphones,
    PlayCircle
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import logger from '../../src/utils/logger';

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const lang = i18n.language || 'fr';

    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        if (id) {
            fetchEventDetails();
            checkRegistration();
        }
    }, [id, user]);

    async function fetchEventDetails() {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('id', id)
                .single();

            if (data) setEvent(data);
            if (error) logger.error('Error fetching event details:', error);
        } catch (error) {
            logger.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    }

    async function checkRegistration() {
        if (!user || !id) return;
        const { data } = await supabase
            .from('event_registrations')
            .select('id')
            .eq('event_id', id)
            .eq('user_id', user.id)
            .single();
        if (data) setIsRegistered(true);
    }

    const handleRegister = async () => {
        if (!user) {
            Alert.alert(
                t('app.login'),
                'You need to be logged in to register for events.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => router.push('/login') }
                ]
            );
            return;
        }

        setRegistering(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const { error } = await supabase.from('event_registrations').insert({
            event_id: id,
            user_id: user.id
        });

        if (error) {
            Alert.alert('Registration Error', error.message);
        } else {
            setIsRegistered(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'You are now registered for this event!');
        }
        setRegistering(false);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
            </View>
        );
    }

    if (!event) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Event not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const date = new Date(event.start_date);
    const day = date.getDate();
    const month = date.toLocaleString(lang, { month: 'long' });
    const year = date.getFullYear();

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero section */}
                <View style={styles.heroContainer}>
                    <Image
                        source={{ uri: event.image_url || 'https://images.unsplash.com/photo-1549487535-61df1f822aa7?auto=format&fit=crop&q=80&w=2670' }}
                        style={styles.heroImage}
                        contentFit="cover"
                        transition={500}
                    />
                    <View style={[styles.headerActions, { top: insets.top + 10 }]}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.circleBtn}
                        >
                            <ArrowLeft size={22} stroke="#1e293b" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.titleSection}>
                        <View style={styles.tagRow}>
                            <View style={styles.typeBadge}>
                                <Text style={styles.typeText}>{event.type.toUpperCase()}</Text>
                            </View>
                            {event.is_solidarity && (
                                <View style={styles.solidarityBadge}>
                                    <Shield size={12} stroke="#0d9488" fill="#0d9488" />
                                    <Text style={styles.solidarityText}>SOLIDARITY</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.title}>{event.title?.[lang] || event.title?.fr}</Text>
                    </View>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <View style={[styles.infoIcon, { backgroundColor: '#fff7ed' }]}>
                                <Calendar size={20} stroke="#f97316" />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Date</Text>
                                <Text style={styles.infoValue}>{day} {month} {year}</Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={[styles.infoIcon, { backgroundColor: '#eff6ff' }]}>
                                <MapPin size={20} stroke="#2563eb" />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Location</Text>
                                <Text style={styles.infoValue}>{event.location}</Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={[styles.infoIcon, { backgroundColor: '#f0fdf4' }]}>
                                <Users size={20} stroke="#16a34a" />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Capacity</Text>
                                <Text style={styles.infoValue}>{event.max_participants || 'Unlimted'} seats</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>
                            {event.description?.[lang] || event.description?.fr}
                        </Text>
                    </View>

                    {event.audio_url && (
                        <View style={styles.audioCard}>
                            <View style={styles.audioInfo}>
                                <View style={[styles.audioIcon, { backgroundColor: '#fff7ed' }]}>
                                    <Headphones size={20} stroke="#f97316" />
                                </View>
                                <View>
                                    <Text style={styles.audioTitle}>{t('features.audioGuideTitle')}</Text>
                                    <Text style={styles.audioSubtitle}>{t('features.availableIn')} {lang.toUpperCase()}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.playBtn}
                                onPress={() => Linking.openURL(event.audio_url)}
                            >
                                <PlayCircle size={20} stroke="white" />
                                <Text style={styles.playBtnText}>Play</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {event.qr_code_url && (
                        <View style={styles.qrCard}>
                            <View style={styles.qrHeader}>
                                <QrCode size={24} stroke="white" />
                                <Text style={styles.qrTitle}>{t('features.qrTitle')}</Text>
                            </View>
                            <Text style={styles.qrDesc}>{t('features.qrDesc')}</Text>
                        </View>
                    )}

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.registerBtn,
                                isRegistered && styles.registeredBtn,
                                registering && styles.disabledBtn
                            ]}
                            onPress={handleRegister}
                            disabled={isRegistered || registering}
                        >
                            {registering ? (
                                <ActivityIndicator color="white" />
                            ) : isRegistered ? (
                                <>
                                    <CheckCircle2 size={22} stroke="white" />
                                    <Text style={styles.registerBtnText}>Already Registered</Text>
                                </>
                            ) : (
                                <Text style={styles.registerBtnText}>Join this Event</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView >
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#64748b',
        marginBottom: 20,
    },
    backBtn: {
        backgroundColor: '#1e293b',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    backBtnText: {
        color: 'white',
        fontWeight: 'bold',
    },
    heroContainer: {
        height: 300,
        width: '100%',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    headerActions: {
        position: 'absolute',
        left: 20,
        zIndex: 10,
    },
    circleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        paddingHorizontal: 24,
        paddingTop: 30,
        paddingBottom: 40,
    },
    titleSection: {
        marginBottom: 24,
    },
    tagRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    typeBadge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#64748b',
        letterSpacing: 1,
    },
    solidarityBadge: {
        backgroundColor: '#f0fdfa',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: '#99f6e4',
    },
    solidarityText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#0d9488',
        letterSpacing: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1e293b',
        letterSpacing: -0.5,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 32,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 20,
        gap: 12,
    },
    infoIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#475569',
        lineHeight: 24,
        fontWeight: '500',
    },
    footer: {
        marginTop: 10,
    },
    registerBtn: {
        backgroundColor: '#1e293b',
        height: 64,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    registeredBtn: {
        backgroundColor: '#059669',
    },
    disabledBtn: {
        opacity: 0.7,
    },
    registerBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '900',
    },
    audioCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 24,
        padding: 16,
        marginBottom: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    audioInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    audioIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    audioTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1e293b',
    },
    audioSubtitle: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748b',
        marginTop: 1,
    },
    playBtn: {
        backgroundColor: '#1e293b',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    playBtnText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '800',
    },
    qrCard: {
        backgroundColor: '#1e293b',
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
    },
    qrHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    qrTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '900',
    },
    qrDesc: {
        color: '#94a3b8',
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600',
    },
});
