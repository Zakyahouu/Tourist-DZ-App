import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/src/lib/supabase';
import { Heart, Plus, Camera, Trophy } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/src/context/AuthContext';
import logger from '@/src/utils/logger';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const columnWidth = (width - 60) / 2;

export default function GalleryScreen() {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { user } = useAuth();
    const [galleryItems, setGalleryItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
    const [uploading, setUploading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'competition'>('all');

    const fetchGallery = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('gallery')
                .select('*, profiles(full_name)')
                .order('created_at', { ascending: false });

            if (filter === 'competition') {
                query = query.eq('is_competition_entry', true);
            }

            const { data, error } = await query;
            if (error) logger.error('Gallery fetch error:', error);
            if (data) setGalleryItems(data);
        } catch (error) {
            logger.error('Gallery fetch exception:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchGallery();
    }, [fetchGallery]);

    const fetchMyLikes = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await supabase
                .from('gallery_likes')
                .select('photo_id')
                .eq('user_id', user.id);
            if (data) setLikedIds(new Set(data.map((r: any) => r.photo_id)));
        } catch (err) {
            logger.error('fetchMyLikes error:', err);
        }
    }, [user]);

    useEffect(() => {
        if (user) fetchMyLikes();
        else setLikedIds(new Set());
    }, [user, fetchMyLikes]);

    const handleUpload = async () => {
        if (!user) {
            Alert.alert(t('auth.loginRequired'), t('gallery.loginToUpload'));
            return;
        }
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('gallery.permissionRequired'), t('gallery.permissionText'));
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            allowsEditing: true,
            aspect: [4, 3],
        });
        if (result.canceled || !result.assets?.[0]) return;
        setUploading(true);
        try {
            const asset = result.assets[0];
            const ext = asset.uri.split('.').pop() ?? 'jpg';
            const fileName = `gallery/${user.id}/${Date.now()}.${ext}`;
            const response = await fetch(asset.uri);
            const blob = await response.blob();
            const arrayBuffer = await new Promise<ArrayBuffer>((res, rej) => {
                const reader = new FileReader();
                reader.onload = () => res(reader.result as ArrayBuffer);
                reader.onerror = rej;
                reader.readAsArrayBuffer(blob);
            });
            const { error: uploadError } = await supabase.storage
                .from('gallery')
                .upload(fileName, arrayBuffer, { contentType: blob.type || `image/${ext}` });
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(fileName);
            const { data: inserted, error: insertError } = await supabase
                .from('gallery')
                .insert({ user_id: user.id, image_url: urlData.publicUrl, likes_count: 0 })
                .select()
                .single();
            if (insertError) throw insertError;
            setGalleryItems(prev => [inserted, ...prev]);
        } catch (err) {
            logger.error('Upload error:', err);
            Alert.alert(t('common.error'), t('gallery.uploadFailed'));
        } finally {
            setUploading(false);
        }
    };

    const toggleLike = useCallback(async (item: any) => {
        if (!user) {
            Alert.alert(t('auth.loginRequired'), t('gallery.loginToUpload'));
            return;
        }
        const alreadyLiked = likedIds.has(item.id);
        const newCount = alreadyLiked ? Math.max(0, item.likes_count - 1) : item.likes_count + 1;

        // Optimistic UI
        setLikedIds(prev => {
            const next = new Set(prev);
            if (alreadyLiked) next.delete(item.id);
            else next.add(item.id);
            return next;
        });
        setGalleryItems(prev => prev.map(g => g.id === item.id ? { ...g, likes_count: newCount } : g));

        // Atomic DB call via RPC
        const { error } = await supabase.rpc('toggle_gallery_like', { p_photo_id: item.id });

        if (error) {
            logger.error('toggleLike error:', error);
            // Revert
            setLikedIds(prev => {
                const next = new Set(prev);
                if (alreadyLiked) next.add(item.id);
                else next.delete(item.id);
                return next;
            });
            setGalleryItems(prev => prev.map(g => g.id === item.id ? { ...g, likes_count: item.likes_count } : g));
        }
    }, [likedIds, user, t]);

    const renderItem = ({ item }: { item: any }) => {
        const liked = likedIds.has(item.id);
        const authorName = item.profiles?.full_name;
        return (
            <TouchableOpacity style={styles.imageCard} activeOpacity={0.9}>
                <Image
                    source={{ uri: item.image_url }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                    {item.is_competition_entry && (
                        <View style={styles.trophyBadge}>
                            <Trophy size={10} stroke="#eab308" fill="#eab308" />
                        </View>
                    )}
                    <View style={styles.bottomRow}>
                        {authorName ? (
                            <Text style={styles.authorText} numberOfLines={1}>{authorName}</Text>
                        ) : <View />}
                        <TouchableOpacity
                            style={styles.likeBadge}
                            onPress={() => toggleLike(item)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Heart size={12} stroke="white" fill={liked ? 'white' : 'transparent'} />
                            <Text style={styles.likeText}>{item.likes_count || 0}</Text>
                        </TouchableOpacity>
                    </View>
                    {item.caption ? (
                        <Text style={styles.captionText} numberOfLines={1}>{item.caption}</Text>
                    ) : null}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('nav.gallery')}</Text>
                <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload} disabled={uploading}>
                    {uploading
                        ? <ActivityIndicator size="small" color="white" />
                        : <Plus size={24} stroke="white" />
                    }
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                        {t('categories.all')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterChip, filter === 'competition' && styles.filterChipActive]}
                    onPress={() => setFilter('competition')}
                >
                    <Trophy size={14} stroke={filter === 'competition' ? 'white' : '#64748b'} />
                    <Text style={[styles.filterText, filter === 'competition' && styles.filterTextActive]}>
                        {t('gallery.competition')}
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
            ) : galleryItems.length === 0 ? (
                <View style={styles.emptyState}>
                    <Camera size={48} stroke="#cbd5e1" />
                    <Text style={styles.emptyTitle}>{t('nav.gallery')}</Text>
                    <Text style={styles.emptySubtitle}>No photos yet. Be the first to share!</Text>
                </View>
            ) : (
                <FlatList
                    data={galleryItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1e293b',
    },
    uploadBtn: {
        backgroundColor: '#f97316',
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 10,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 6,
    },
    filterChipActive: {
        backgroundColor: '#f97316',
        borderColor: '#f97316',
    },
    filterText: {
        fontSize: 13,
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
    columnWrapper: {
        justifyContent: 'space-between',
    },
    imageCard: {
        width: columnWidth,
        height: 220,
        borderRadius: 20,
        marginBottom: 20,
        backgroundColor: '#e2e8f0',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.15)',
        justifyContent: 'flex-end',
        padding: 10,
    },
    trophyBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    authorText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
        maxWidth: '60%',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    likeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    likeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
        marginLeft: 4,
    },
    captionText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 9,
        fontWeight: '600',
        marginTop: 4,
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
