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
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        // Basic email format validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const { error } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
        });

        if (error) {
            Alert.alert('Login Failed', error.message);
            setLoading(false);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/(tabs)');
        }
    };

    const handleForgotPassword = () => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            Alert.alert('Reset Password', 'Enter your email address above first, then tap Forgot Password.');
            return;
        }
        Alert.alert(
            'Reset Password',
            `A reset link will be sent to ${trimmedEmail}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send',
                    onPress: async () => {
                        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);
                        if (error) {
                            Alert.alert('Error', error.message);
                        } else {
                            Alert.alert('Email Sent', 'Check your inbox for the password reset link.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('app.title')}</Text>
                    <Text style={styles.subtitle}>{t('app.tagline')}</Text>
                </View>

                <View style={styles.form}>
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

                    <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword}>
                        <Text style={styles.forgotText}>{t('app.forgotPassword')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.loginBtn, loading && styles.disabledBtn]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Text style={styles.loginBtnText}>{t('app.login')}</Text>
                                <ArrowRight size={20} stroke="white" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>{t('app.dontHaveAccount')} </Text>
                    <TouchableOpacity onPress={() => router.push('/signup')}>
                        <Text style={styles.signupText}>{t('app.signup')}</Text>
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
        alignItems: 'center',
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
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotText: {
        color: '#f97316',
        fontWeight: '700',
        fontSize: 14,
    },
    loginBtn: {
        backgroundColor: '#1e293b',
        height: 60,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    disabledBtn: {
        opacity: 0.7,
    },
    loginBtnText: {
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
    signupText: {
        color: '#1e293b',
        fontWeight: '800',
        fontSize: 14,
    },
});
