import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { supabase } from '@/src/lib/supabase';
import { Heart, Plus, Camera } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/src/context/AuthContext';
import logger from '@/src/utils/logger';

const { width } = Dimensions.get('window');
const columnWidth = (width - 60) / 2;

export default function GalleryScreen() {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { user } = useAuth();
    const [galleryItems, setGalleryItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function fetchGallery() {
            try {
                const { data, error } = await supabase
                    .from('gallery')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (error) logger.error('Gallery fetch error:', error);
                if (data) setGalleryItems(data);
            } catch (error) {
                logger.error('Gallery fetch exception:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchGallery();
    }, []);

    const handleUpload = () => {
        if (!user) {
            Alert.alert(t('app.login'), 'You need to be logged in to upload photos.');
            return;
        }
        Alert.alert('Coming Soon', 'Photo upload feature is coming soon to the mobile app!');
    };

    const toggleLike = useCallback(async (item: any) => {
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

        const { error } = await supabase
            .from('gallery')
            .update({ likes_count: newCount })
            .eq('id', item.id);

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
    }, [likedIds]);

    const renderItem = ({ item }: { item: any }) => {
        const liked = likedIds.has(item.id);
        return (
            <TouchableOpacity style={styles.imageCard} activeOpacity={0.9}>
                <Image
                    source={{ uri: item.image_url }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                    <TouchableOpacity
                        style={styles.likeBadge}
                        onPress={() => toggleLike(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Heart size={12} stroke="white" fill={liked ? 'white' : 'transparent'} />
                        <Text style={styles.likeText}>{item.likes_count || 0}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('nav.gallery')}</Text>
                <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload}>
                    <Plus size={24} stroke="white" />
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
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'flex-end',
        padding: 12,
    },
    likeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    likeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
        marginLeft: 4,
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
