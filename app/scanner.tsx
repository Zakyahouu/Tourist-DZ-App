import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Zap, ZapOff, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function ScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [torch, setTorch] = useState(false);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    if (!permission) {
        // Camera permissions are still loading.
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                        <X size={24} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={styles.permissionContainer}>
                    <Info size={64} color="#64748b" style={{ marginBottom: 20 }} />
                    <Text style={styles.permissionTitle}>{t('scanner.permissionRequired')}</Text>
                    <Text style={styles.permissionText}>{t('scanner.permissionText')}</Text>
                    <TouchableOpacity style={styles.btn} onPress={requestPermission}>
                        <Text style={styles.btnText}>{t('scanner.grantPermission')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        if (scanned) return;
        setScanned(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Logic to handle different QR types
        // Example: https://touristdz.com/site/ID
        if (data.includes('site/')) {
            const parts = data.split('site/');
            const id = parts[parts.length - 1];
            router.replace(`/site/${id}`);
        } else if (data.includes('event/')) {
            const parts = data.split('event/');
            const id = parts[parts.length - 1];
            router.replace(`/event/${id}`);
        } else {
            Alert.alert(
                t('scanner.scanned'),
                data,
                [{ text: 'OK', onPress: () => setScanned(false) }]
            );
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                enableTorch={torch}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            >
                <View style={styles.overlay}>
                    <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                            <X size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setTorch(!torch)} style={styles.torchBtn}>
                            {torch ? <ZapOff size={24} color="white" /> : <Zap size={24} color="white" />}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.scannerWrapper}>
                        <View style={styles.scannerLine} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>{t('scanner.pointCamera')}</Text>
                        <Text style={styles.footerSubText}>{t('scanner.siteHint')}</Text>
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    closeBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    torchBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerWrapper: {
        width: width * 0.7,
        height: width * 0.7,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        position: 'relative',
    },
    scannerLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#f97316',
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 100,
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 40,
    },
    footerText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 8,
    },
    footerSubText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#f8fafc',
    },
    permissionTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 12,
        textAlign: 'center',
    },
    permissionText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    btn: {
        backgroundColor: '#1e293b',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 16,
    },
    btnText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 16,
    },
    // Corner markers
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#f97316',
    },
    topLeft: {
        top: -2,
        left: -2,
        borderTopWidth: 6,
        borderLeftWidth: 6,
        borderTopLeftRadius: 20,
    },
    topRight: {
        top: -2,
        right: -2,
        borderTopWidth: 6,
        borderRightWidth: 6,
        borderTopRightRadius: 20,
    },
    bottomLeft: {
        bottom: -2,
        left: -2,
        borderBottomWidth: 6,
        borderLeftWidth: 6,
        borderBottomLeftRadius: 20,
    },
    bottomRight: {
        bottom: -2,
        right: -2,
        borderBottomWidth: 6,
        borderRightWidth: 6,
        borderBottomRightRadius: 20,
    },
});
