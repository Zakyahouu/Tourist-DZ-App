import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';
import { User, Settings, Heart, Calendar, LogOut, ChevronRight, Share2, Shield, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/src/lib/supabase';
import logger from '@/src/utils/logger';

const LANGUAGES = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
];

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { user, profile, signOut, loading } = useAuth();
    const isAdmin = profile?.role === 'admin';

    const [stats, setStats] = useState({ favorites: 0, events: 0, reviews: 0 });

    const fetchStats = useCallback(async () => {
        if (!user) return;
        try {
            const [favResult, evResult, revResult] = await Promise.all([
                supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
                supabase.from('event_registrations').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
                supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            ]);
            setStats({
                favorites: favResult.count ?? 0,
                events: evResult.count ?? 0,
                reviews: revResult.count ?? 0,
            });
        } catch (err) {
            logger.error('fetchStats error:', err);
        }
    }, [user]);

    useEffect(() => {
        if (user) fetchStats();
    }, [user, fetchStats]);

    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Traveler';

    const MenuItem = ({ icon: Icon, title, onPress, color = '#1e293b' }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={[styles.menuIconContainer, { backgroundColor: color + '10' }]}>
                <Icon size={20} stroke={color} />
            </View>
            <Text style={styles.menuText}>{title}</Text>
            <ChevronRight size={18} stroke="#cbd5e1" />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#1e293b" />
            </View>
        );
    }

    if (!user) {
        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.centerContent}>
                <View style={[styles.guestHeader, { paddingTop: insets.top + 60 }]}>
                    <View style={styles.guestIconCircle}>
                        <User size={40} stroke="#f97316" />
                    </View>
                    <Text style={styles.guestTitle}>{t('profile.welcome')} {t('app.title')}</Text>
                    <Text style={styles.guestSubtitle}>{t('profile.guestSubtitle')}</Text>
                </View>

                <View style={styles.guestActions}>
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={() => router.push('/(auth)/login')}
                    >
                        <Text style={styles.primaryBtnText}>{t('app.login')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={() => router.push('/(auth)/signup')}
                    >
                        <Text style={styles.secondaryBtnText}>{t('app.signup')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.guestMenu}>
                    <MenuItem icon={Settings} title={t('profile.generalSettings')} color="#64748b" onPress={() => Alert.alert(t('profile.generalSettings'), t('profile.comingSoon'))} />
                    <MenuItem icon={Share2} title={t('profile.aboutProject')} color="#64748b" onPress={() => Alert.alert('ToursticDZ', t('profile.aboutProjectDesc'))} />
                </View>

                <View style={[styles.section, { paddingHorizontal: 20, paddingTop: 10 }]}>
                    <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
                    <View style={styles.langRow}>
                        {LANGUAGES.map(lang => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[styles.langBtn, i18n.language === lang.code && styles.langBtnActive]}
                                onPress={() => i18n.changeLanguage(lang.code)}
                            >
                                <Text style={[styles.langText, i18n.language === lang.code && styles.langTextActive]}>
                                    {lang.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Text style={styles.versionText}>Version 1.0.0 (Expo)</Text>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.profileInfo}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1e293b&color=fff` }}
                            style={styles.avatar}
                        />
                        <View style={styles.editBadge}>
                            <User size={12} stroke="white" />
                        </View>
                    </View>
                    <View style={styles.nameRow}>
                        <Text style={styles.userName}>{displayName}</Text>
                        {isAdmin && (
                            <View style={styles.adminBadge}>
                                <Shield size={10} color="white" fill="white" />
                                <Text style={styles.adminBadgeText}>ADMIN</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.favorites}</Text>
                        <Text style={styles.statLabel}>{t('profile.favorites')}</Text>
                    </View>
                    <View style={[styles.statItem, styles.statBorder]}>
                        <Text style={styles.statNumber}>{stats.events}</Text>
                        <Text style={styles.statLabel}>{t('profile.events')}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.reviews}</Text>
                        <Text style={styles.statLabel}>{t('profile.reviews')}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('profile.myActivity')}</Text>
                <MenuItem icon={Heart} title={t('profile.myFavorites')} color="#ef4444" onPress={() => Alert.alert(t('profile.favorites'), t('profile.comingSoon'))} />
                <MenuItem icon={Calendar} title={t('profile.myEvents')} color="#3b82f6" onPress={() => Alert.alert(t('profile.events'), t('profile.comingSoon'))} />
                <MenuItem icon={Star} title={t('profile.myReviews')} color="#f59e0b" onPress={() => Alert.alert(t('profile.reviews'), t('profile.comingSoon'))} />
                <MenuItem icon={Heart} title={t('solidarity.title')} color="#e11d48" onPress={() => router.push('/solidarity')} />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('profile.accountSettings')}</Text>
                <MenuItem icon={Settings} title={t('profile.personalInfo')} color="#64748b" onPress={() => Alert.alert(t('profile.personalInfo'), t('profile.comingSoon'))} />
                <MenuItem icon={Shield} title={t('profile.privacySecurity')} color="#64748b" onPress={() => Alert.alert(t('profile.privacySecurity'), t('profile.comingSoon'))} />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
                <View style={styles.langRow}>
                    {LANGUAGES.map(lang => (
                        <TouchableOpacity
                            key={lang.code}
                            style={[styles.langBtn, i18n.language === lang.code && styles.langBtnActive]}
                            onPress={() => i18n.changeLanguage(lang.code)}
                        >
                            <Text style={[styles.langText, i18n.language === lang.code && styles.langTextActive]}>
                                {lang.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
                <LogOut size={20} stroke="#ef4444" />
                <Text style={styles.logoutText}>{t('app.logout')}</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>Version 1.0.0 (Expo)</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: 40,
    },
    header: {
        backgroundColor: 'white',
        paddingBottom: 30,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#f1f5f9',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f97316',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    userName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
        textTransform: 'capitalize',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    adminBadge: {
        backgroundColor: '#1e293b',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    adminBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    userEmail: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
        marginTop: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statBorder: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#f1f5f9',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1e293b',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '700',
        marginTop: 4,
    },
    section: {
        paddingHorizontal: 20,
        paddingTop: 30,
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
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        marginBottom: 20,
        gap: 8,
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '900',
    },
    versionText: {
        textAlign: 'center',
        color: '#cbd5e1',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 10,
    },
    // Guest Styles
    guestHeader: {
        alignItems: 'center',
        paddingHorizontal: 40,
        marginBottom: 40,
    },
    guestIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff7ed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#ffedd5',
    },
    guestTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 12,
    },
    guestSubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
    },
    guestActions: {
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 40,
    },
    primaryBtn: {
        backgroundColor: '#1e293b',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
    },
    secondaryBtn: {
        backgroundColor: 'white',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    secondaryBtnText: {
        color: '#1e293b',
        fontSize: 16,
        fontWeight: '800',
    },
    guestMenu: {
        paddingHorizontal: 20,
    },
    langRow: {
        flexDirection: 'row',
        gap: 10,
    },
    langBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: 'white',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    langBtnActive: {
        backgroundColor: '#1e293b',
        borderColor: '#1e293b',
    },
    langText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748b',
    },
    langTextActive: {
        color: 'white',
    },
});
