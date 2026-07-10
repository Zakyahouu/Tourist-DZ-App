import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/context/AuthContext';
import {
    ArrowLeft,
    ArrowRight,
    MapPin,
    Star,
    Phone,
    DollarSign,
    Share2,
    Heart,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import logger from '../../src/utils/logger';

export default function AccommodationDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const lang = i18n.language || 'fr';
    const rtl = lang === 'ar';

    const [accommodation, setAccommodation] = useState<any>(null);
    const [category, setCategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favLoading, setFavLoading] = useState(false);
    const { user } = useAuth();

    const fetchDetails = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('accommodations')
                .select('*, accommodation_images(image_url, is_primary)')
                .eq('id', id)
                .single();

            if (data) {
                setAccommodation(data);
                if (data.category_id) {
                    supabase.from('accommodation_categories').select('*').eq('id', data.category_id).single().then(({ data: cat }) => {
                        if (cat) setCategory(cat);
                    });
                }
            }
            if (error) logger.error('Error fetching accommodation:', error);
        } catch (error) {
            logger.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const checkFavorite = useCallback(async () => {
        if (!user || !id) return;
        try {
            const { data } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', user.id)
                .eq('accommodation_id', id)
                .single();
            setIsFavorite(!!data);
        } catch (err) {
            logger.error('checkFavorite error:', err);
        }
    }, [id, user]);

    useEffect(() => {
        if (id) {
            fetchDetails();
            if (user) checkFavorite();
        }
    }, [id, user, fetchDetails, checkFavorite]);

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
            const { error } = await supabase.from('favorites').insert({ user_id: user.id, accommodation_id: id });
            if (error) { logger.error('addFavorite error:', error); setIsFavorite(false); }
        } else {
            const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('accommodation_id', id);
            if (error) { logger.error('removeFavorite error:', error); setIsFavorite(true); }
        }
        setFavLoading(false);
    };

    const isSafeUrl = (url: string) => {
        if (!url) return false;
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const handleWebsite = () => {
        if (accommodation.website && isSafeUrl(accommodation.website)) {
            Linking.openURL(accommodation.website);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#D6A64C" />
            </View>
        );
    }

    if (!accommodation) {
        return (
            <View style={styles.center}>
                <Text style={styles.notFoundText}>{t('accommodation.notFound')}</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.goBackText}>{t('common.goBack')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const images = (accommodation.accommodation_images || [])
        .sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
        .map((img: any) => img.image_url)
        .filter(Boolean);
    const hasCover = images.length > 0;
    const galleryImages = images.slice(1);

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const name = accommodation.name?.[lang] || accommodation.name?.fr || '';
        try {
            await Sharing.shareAsync(name, { dialogTitle: name });
        } catch {
            // sharing not available
        }
    };

    const handleCall = () => {
        if (accommodation.phone) {
            Linking.openURL(`tel:${accommodation.phone}`);
        }
    };

    const handleDirections = () => {
        if (accommodation.latitude && accommodation.longitude) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${accommodation.latitude},${accommodation.longitude}`;
            Linking.openURL(url);
        }
    };

    return (
        <ScrollView style={[styles.container]} showsVerticalScrollIndicator={false}>
            {/* Hero Image */}
            <View style={styles.heroContainer}>
                <Image
                    source={hasCover ? { uri: images[0] } : require('../../assets/images/small_panner.jpg')}
                    style={styles.heroImage}
                    contentFit="cover"
                    transition={500}
                />
                <View style={styles.heroOverlay} />
                <View style={[styles.heroActions, { top: insets.top + 10 }]}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        {rtl ? <ArrowRight size={22} stroke="white" /> : <ArrowLeft size={22} stroke="white" />}
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity style={styles.shareBtn} onPress={toggleFavorite} disabled={favLoading}>
                            <Heart size={20} stroke="white" fill={isFavorite ? 'white' : 'transparent'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                            <Share2 size={20} stroke="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.body}>
                {/* Type Badge + Rating */}
                <View style={styles.badgeRow}>
                    <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>
                            {category?.[`name_${lang}`] || category?.name_fr || category?.name_en || accommodation.type || ''}
                        </Text>
                    </View>
                    {accommodation.rating > 0 && (
                        <View style={styles.ratingBadge}>
                            <Star size={14} stroke="#eab308" fill="#eab308" />
                            <Text style={styles.ratingText}>{accommodation.rating?.toFixed(1)}</Text>
                        </View>
                    )}
                    {accommodation.price_range && (
                        <View style={styles.priceBadge}>
                            <DollarSign size={14} stroke="#16a34a" />
                            <Text style={styles.priceText}>{accommodation.price_range}</Text>
                        </View>
                    )}
                </View>

                {/* Name */}
                <Text style={styles.name}>{accommodation.name?.[lang] || accommodation.name?.fr}</Text>

                {/* Address */}
                {accommodation.address && (
                    <View style={styles.addressRow}>
                        <MapPin size={16} stroke="#D6A64C" />
                        <Text style={styles.addressText}>{accommodation.address}</Text>
                    </View>
                )}

                {/* Description */}
                {(accommodation.description?.[lang] || accommodation.description?.fr) && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{t('details.description')}</Text>
                        <Text style={styles.descText}>
                            {accommodation.description[lang] || accommodation.description.fr}
                        </Text>
                    </View>
                )}

                {/* Gallery */}
                {galleryImages.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{t('nav.gallery')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                            {galleryImages.map((img: string, idx: number) => (
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

                {/* Contact Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t('accommodation.contact')}</Text>

                    {accommodation.address && (
                        <TouchableOpacity style={styles.contactRow} onPress={handleDirections}>
                            <View style={[styles.contactIcon, { backgroundColor: '#fef2f2' }]}>
                                <MapPin size={18} stroke="#ef4444" />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactLabel}>{t('events.location')}</Text>
                                <Text style={styles.contactValue}>{accommodation.address}</Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    {accommodation.phone && (
                        <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
                            <View style={[styles.contactIcon, { backgroundColor: '#f0fdf4' }]}>
                                <Phone size={18} stroke="#16a34a" />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactLabel}>{t('accommodation.phone')}</Text>
                                <Text style={[styles.contactValue, { color: '#D6A64C' }]}>{accommodation.phone}</Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    {accommodation.website && isSafeUrl(accommodation.website) && (
                        <TouchableOpacity style={styles.contactRow} onPress={handleWebsite}>
                            <View style={[styles.contactIcon, { backgroundColor: '#f0fdf4' }]}>
                                <Text style={{ fontSize: 16, fontWeight: '900', color: '#16a34a' }}>www</Text>
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactLabel}>{t('accommodation.website') || 'Website'}</Text>
                                <Text style={styles.contactValue} numberOfLines={1}>{accommodation.website}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Get Directions Button */}
                {accommodation.latitude && accommodation.longitude && (
                    <TouchableOpacity style={styles.directionsBtn} onPress={handleDirections}>
                        <MapPin size={20} stroke="white" />
                        <Text style={styles.directionsBtnText}>{t('details.getDirections')}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F7F4' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F7F4' },
    notFoundText: { fontSize: 18, fontWeight: '800', color: '#1F5B3A', marginBottom: 12 },
    goBackText: { fontSize: 16, fontWeight: '700', color: '#D6A64C' },
    heroContainer: { height: 350, width: '100%' },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
    heroActions: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
    shareBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
    body: { padding: 20, marginTop: -30, backgroundColor: '#F8F7F4', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    typeBadge: { backgroundColor: '#D6A64C', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
    typeBadgeText: { color: 'white', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef9c3', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    ratingText: { fontSize: 14, fontWeight: '800', color: '#92400e' },
    priceBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    priceText: { fontSize: 14, fontWeight: '800', color: '#16a34a' },
    name: { fontSize: 28, fontWeight: '900', color: '#1F5B3A', marginBottom: 8 },
    addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
    addressText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
    card: { backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: '900', color: '#1F5B3A', marginBottom: 12 },
    descText: { fontSize: 15, color: '#475569', lineHeight: 24, fontWeight: '500' },
    galleryImg: { width: 200, height: 150, borderRadius: 16 },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    contactIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    contactInfo: { flex: 1 },
    contactLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
    contactValue: { fontSize: 15, fontWeight: '700', color: '#1F5B3A' },
    directionsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#1F5B3A', borderRadius: 20, paddingVertical: 18, marginBottom: 40 },
    directionsBtnText: { color: 'white', fontSize: 16, fontWeight: '800' },
});
