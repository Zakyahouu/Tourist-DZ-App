import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Heart } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/context/AuthContext';
import logger from '../src/utils/logger';

const CATEGORIES = ['disability', 'patient', 'low_income'] as const;
type Category = typeof CATEGORIES[number];

export default function SolidarityScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { user } = useAuth();

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [category, setCategory] = useState<Category>('disability');
    const [specialNeeds, setSpecialNeeds] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!user) {
            Alert.alert(t('auth.loginRequired'), t('solidarity.loginRequired'));
            router.push('/(auth)/login');
            return;
        }
        if (!fullName.trim() || !phone.trim()) {
            Alert.alert(t('common.error'), 'Please fill in your full name and phone number.');
            return;
        }
        if (submitting) return;
        setSubmitting(true);
        try {
            const { error } = await supabase.from('solidarity_applications').insert({
                user_id: user.id,
                full_name: fullName.trim(),
                phone: phone.trim(),
                category,
                special_needs: specialNeeds.trim() || null,
            });
            if (error) throw error;
            Alert.alert(t('solidarity.success'), undefined, [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err) {
            logger.error('solidarity submit error:', err);
            Alert.alert(t('common.error'), t('solidarity.error'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ArrowLeft size={22} stroke="#1e293b" />
                    </TouchableOpacity>
                    <View style={styles.titleRow}>
                        <Heart size={22} stroke="#ef4444" fill="#ef4444" />
                        <Text style={styles.title}>{t('solidarity.title')}</Text>
                    </View>
                </View>

                <Text style={styles.subtitle}>{t('solidarity.subtitle')}</Text>

                <View style={styles.formCard}>
                    <Text style={styles.label}>{t('solidarity.fullName')}</Text>
                    <TextInput
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder={t('solidarity.fullName')}
                        autoCapitalize="words"
                        maxLength={100}
                    />

                    <Text style={styles.label}>{t('solidarity.phone')}</Text>
                    <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="+213..."
                        keyboardType="phone-pad"
                        maxLength={20}
                    />

                    <Text style={styles.label}>{t('solidarity.category')}</Text>
                    <View style={styles.categoryRow}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.catBtn, category === cat && styles.catBtnActive]}
                                onPress={() => setCategory(cat)}
                            >
                                <Text style={[styles.catText, category === cat && styles.catTextActive]}>
                                    {t(`solidarity.${cat === 'low_income' ? 'lowIncome' : cat}`)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>{t('solidarity.specialNeeds')}</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={specialNeeds}
                        onChangeText={setSpecialNeeds}
                        placeholder={t('solidarity.specialNeeds')}
                        multiline
                        numberOfLines={3}
                        maxLength={500}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        style={[styles.submitBtn, submitting && styles.disabledBtn]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting
                            ? <ActivityIndicator size="small" color="white" />
                            : <Text style={styles.submitText}>{t('solidarity.submit')}</Text>
                        }
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 60,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
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
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 24,
        lineHeight: 20,
    },
    formCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
        gap: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
        marginTop: 8,
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1e293b',
        backgroundColor: '#f8fafc',
    },
    textArea: {
        minHeight: 80,
    },
    categoryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 4,
    },
    catBtn: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: '#f8fafc',
    },
    catBtnActive: {
        backgroundColor: '#1e293b',
        borderColor: '#1e293b',
    },
    catText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    catTextActive: {
        color: 'white',
    },
    submitBtn: {
        backgroundColor: '#ef4444',
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    disabledBtn: {
        opacity: 0.6,
    },
    submitText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 16,
    },
});
