import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    Dimensions,
    FlatList,
    Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    MapPin,
    Star,
    Accessibility,
    QrCode,
    Share2,
    Heart,
    Headphones,
    PlayCircle
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import logger from '../../src/utils/logger';

const { width } = Dimensions.get('window');

export default function SiteDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const lang = i18n.language || 'fr';

    const [site, setSite] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favLoading, setFavLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchSiteDetails();
            if (user) checkFavorite();
        }
    }, [id, user]);

    async function fetchSiteDetails() {
        try {
            const { data, error } = await supabase
                .from('tourist_sites')
                .select('*, site_images(image_url), reviews(rating, comment, created_at, profiles(full_name, avatar_url))')
                .eq('id', id)
                .single();

            if (data) setSite(data);
            if (error) logger.error('Error fetching site details:', error);
        } catch (error) {
            logger.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    }

    async function checkFavorite() {
        if (!user || !id) return;
        const { data } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('site_id', id)
            .single();
        setIsFavorite(!!data);
    }

    const toggleFavorite = async () => {
        if (!user) {
            router.push('/(auth)/login');
            return;
        }
        if (favLoading) return;
        setFavLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newState = !isFavorite;
        setIsFavorite(newState);

        if (newState) {
            const { error } = await supabase.from('favorites').insert({ user_id: user.id, site_id: id });
            if (error) { logger.error('addFavorite error:', error); setIsFavorite(false); }
        } else {
            const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('site_id', id);
            if (error) { logger.error('removeFavorite error:', error); setIsFavorite(true); }
        }
        setFavLoading(false);
    };

    const handleShare = async () => {
        const siteName = site?.name?.[lang] || site?.name?.fr || 'Tourist Site';
        const url = `https://toursticdz.com/site/${id}`;
        try {
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(url, { dialogTitle: siteName });
            } else {
                Alert.alert('Share', `${siteName}\n${url}`);
            }
        } catch (err) {
            logger.error('handleShare error:', err);
        }
    };

    const handleDirections = () => {
        if (site?.latitude && site?.longitude) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`;
            Linking.openURL(url);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
            </View>
        );
    }

    if (!site) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Site not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const images = site.site_images?.map((img: any) => img.image_url) || [];
    const coverImage = images[0] || 'https://images.unsplash.com/photo-1549487535-61df1f822aa7?auto=format&fit=crop&q=80&w=2670';

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero section */}
                <View style={styles.heroContainer}>
                    <Image
                        source={{ uri: coverImage }}
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

                        <View style={styles.rightActions}>
                            <TouchableOpacity style={styles.circleBtn} onPress={handleShare}>
                                <Share2 size={22} stroke="#1e293b" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={toggleFavorite} style={styles.circleBtn} disabled={favLoading}>
                                <Heart size={22} stroke={isFavorite ? '#ef4444' : '#1e293b'} fill={isFavorite ? '#ef4444' : 'transparent'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.titleSection}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{site.category.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.title}>{site.name?.[lang] || site.name?.fr}</Text>

                        <View style={styles.ratingRow}>
                            <Star size={16} stroke="#f59e0b" fill="#f59e0b" />
                            <Text style={styles.ratingText}>
                                {site.avg_rating?.toFixed(1) || '0.0'}
                                <Text style={styles.reviewCount}> ({site.review_count || 0} reviews)</Text>
                            </Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('details.about')}</Text>
                        <Text style={styles.description}>
                            {site.description?.[lang] || site.description?.fr}
                        </Text>
                    </View>

                    {images.length > 1 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t('details.gallery')}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
                                {images.slice(1).map((img: string, idx: number) => (
                                    <Image
                                        key={idx}
                                        source={{ uri: img }}
                                        style={styles.galleryImg}
                                        contentFit="cover"
                                        transition={300}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <View style={styles.infoCard}>
                        <View style={styles.infoItem}>
                            <View style={[styles.infoIcon, { backgroundColor: '#eff6ff' }]}>
                                <MapPin size={20} stroke="#2563eb" />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>{t('details.location')}</Text>
                                <Text style={styles.infoValue} numberOfLines={2}>{site.address || 'Biskra, Algeria'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={[styles.infoIcon, { backgroundColor: '#f0fdf4' }]}>
                                <Accessibility size={20} stroke="#16a34a" />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>{t('details.accessibility')}</Text>
                                <Text style={styles.infoValue}>
                                    {site.wheelchair_accessible ? t('accessibility.accessible') : t('accessibility.limited')}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.directionsBtn} onPress={handleDirections}>
                            <MapPin size={18} stroke="white" />
                            <Text style={styles.directionsBtnText}>{t('details.getDirections')}</Text>
                        </TouchableOpacity>
                    </View>

                    {site.audio_url && (
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
                                onPress={() => Linking.openURL(site.audio_url)}
                            >
                                <View style={styles.playIconContainer}>
                                    <PlayCircle size={24} stroke="white" />
                                </View>
                                <Text style={styles.playBtnText}>{t('features.listenNow')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {site.qr_code_url && (
                        <View style={styles.qrCard}>
                            <View style={styles.qrHeader}>
                                <QrCode size={24} stroke="white" />
                                <Text style={styles.qrTitle}>{t('features.qrTitle')}</Text>
                            </View>
                            <Text style={styles.qrDesc}>{t('features.qrDesc')}</Text>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('details.reviews')}</Text>
                        {site.reviews?.length > 0 ? (
                            site.reviews.map((review: any, idx: number) => (
                                <View key={idx} style={styles.reviewItem}>
                                    <View style={styles.reviewHeader}>
                                        <Image
                                            source={{ uri: `https://ui-avatars.com/api/?name=${review.profiles?.full_name || 'U'}&background=1e293b&color=fff` }}
                                            style={styles.reviewAvatar}
                                        />
                                        <View>
                                            <Text style={styles.reviewName}>{review.profiles?.full_name || 'Anonymous'}</Text>
                                            <View style={styles.starsRow}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={12}
                                                        stroke={i < review.rating ? "#f59e0b" : "#cbd5e1"}
                                                        fill={i < review.rating ? "#f59e0b" : "transparent"}
                                                    />
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                    {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noReviews}>{t('details.noReviews')}</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
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
        height: 350,
        width: '100%',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    headerActions: {
        position: 'absolute',
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    rightActions: {
        flexDirection: 'row',
        gap: 10,
    },
    circleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        backgroundColor: '#f8fafc',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        paddingHorizontal: 24,
        paddingTop: 30,
        paddingBottom: 100,
    },
    titleSection: {
        marginBottom: 24,
    },
    categoryBadge: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#f97316',
        letterSpacing: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1e293b',
    },
    reviewCount: {
        color: '#64748b',
        fontWeight: '600',
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
    galleryScroll: {
        marginTop: 8,
    },
    galleryImg: {
        width: 200,
        height: 140,
        borderRadius: 16,
        marginRight: 12,
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 2,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
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
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
    },
    directionsBtn: {
        backgroundColor: '#1e293b',
        height: 54,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 4,
    },
    directionsBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
    },
    audioCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 2,
    },
    audioInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    audioIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    audioTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#1e293b',
    },
    audioSubtitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94a3b8',
        marginTop: 2,
    },
    playBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        gap: 8,
    },
    playIconContainer: {
        // Just for sizing if needed
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
    reviewItem: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    reviewAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    reviewName: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1e293b',
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 2,
    },
    reviewComment: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        fontWeight: '500',
    },
    noReviews: {
        textAlign: 'center',
        color: '#94a3b8',
        paddingVertical: 20,
        fontStyle: 'italic',
    },
});
