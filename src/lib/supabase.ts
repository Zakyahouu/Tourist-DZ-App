import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables');
}

const storageAdapter = {
    getItem: async (key: string) => {
        try { return await AsyncStorage.getItem(key); }
        catch { return null; }
    },
    setItem: async (key: string, value: string) => {
        try { await AsyncStorage.setItem(key, value); }
        catch { }
    },
    removeItem: async (key: string) => {
        try { await AsyncStorage.removeItem(key); }
        catch { }
    },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: storageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
