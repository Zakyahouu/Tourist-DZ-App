import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function SignupScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        const trimmedEmail = email.trim();
        if (!fullName.trim() || !trimmedEmail || !password) {
            Alert.alert(t('common.error'), t('auth.fillAllFields'));
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            Alert.alert(t('common.error'), t('auth.invalidEmail'));
            return;
        }

        if (password.length < 6) {
            Alert.alert(t('common.error'), t('auth.passwordMinLength'));
            return;
        }

        setLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const { error } = await supabase.auth.signUp({
            email: trimmedEmail,
            password,
            options: {
                data: {
                    full_name: fullName.trim(),
                }
            }
        });

        setLoading(false);
        if (error) {
            Alert.alert(t('auth.signupFailed'), error.message);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
                t('common.success'),
                t('auth.signupSuccess'),
                [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
            );
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('app.createAccount')}</Text>
                    <Text style={styles.subtitle}>{t('app.joinCommunity')}</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <User size={20} stroke="#94a3b8" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder={t('app.fullName')}
                            placeholderTextColor="#94a3b8"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Mail size={20} stroke="#94a3b8" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder={t('app.email')}
                            placeholderTextColor="#94a3b8"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Lock size={20} stroke="#94a3b8" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder={t('app.password')}
                            placeholderTextColor="#94a3b8"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.signupBtn, loading && styles.disabledBtn]}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Text style={styles.signupBtnText}>{t('app.signup')}</Text>
                                <ArrowRight size={20} stroke="white" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>{t('app.alreadyHaveAccount')} </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                        <Text style={styles.loginText}>{t('app.login')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
        paddingVertical: 40,
    },
    header: {
        marginBottom: 40,
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1e293b',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
        marginTop: 5,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 60,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '600',
    },
    signupBtn: {
        backgroundColor: '#f97316',
        height: 60,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    disabledBtn: {
        opacity: 0.7,
    },
    signupBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
        marginRight: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
    },
    footerText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '600',
    },
    loginText: {
        color: '#1e293b',
        fontWeight: '800',
        fontSize: 14,
    },
});
