import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Alert,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { StorageService } from '../services/StorageService';
import { getWalletBalance } from '../api/auth';

const HomeScreen = ({ navigation }: any) => {
    const [activeTab, setActiveTab] = useState<'Home' | 'History'>('Home');
    const [sendAmount] = useState('10,000');
    const [balance, setBalance] = useState<string>('–');
    const [currency, setCurrency] = useState<string>('EUR');
    const [balanceLoading, setBalanceLoading] = useState(true);

    // Fetch wallet balance on mount
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                setBalanceLoading(true);
                const data = await getWalletBalance('EU');
                if (data?.success && data?.data) {
                    const decimals = typeof data.data.decimals === 'number' ? data.data.decimals : 2;
                    const raw = data.data.balance ?? data.data.available ?? 0;
                    const amount = (raw / Math.pow(10, decimals)).toFixed(2);
                    setBalance(amount);
                    if (data.data.currency) setCurrency(data.data.currency.toUpperCase());
                } else {
                    setBalance('0.00');
                }
            } catch {
                setBalance('0.00');
            } finally {
                setBalanceLoading(false);
            }
        };
        fetchBalance();
    }, []);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await StorageService.logout();
                        navigation.replace('Landing');
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* ── Top bar ── */}
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.avatarBtn} onPress={handleLogout}>
                    <Text style={styles.avatarEmoji}>👤</Text>
                    <Text style={styles.flagEmoji}>🇸🇪</Text>
                </TouchableOpacity>

                <View style={styles.topRightRow}>
                    <TouchableOpacity style={styles.earnPill}>
                        <Text style={styles.earnText}>Earn €10</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconCircle}>
                        <Text style={styles.iconText}>🔔</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconCircle}>
                        <Text style={styles.iconText}>🎧</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* ── Balance Card ── */}
                <View style={styles.balanceCard}>
                    <View style={styles.balanceTopRow}>
                        <Text style={styles.balanceLabel}>Your Balance -  EUR </Text>
                        <Text style={styles.balanceChevron}>▾</Text>
                    </View>
                    <Text style={styles.balanceAmount}>
                        {balanceLoading ? '...' : `${balance} ${currency}`}
                    </Text>
                    <TouchableOpacity style={styles.sendMoneyBtn}>
                        <Text style={styles.sendMoneyText}>Send Money</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Quick Actions ── */}
                <View style={styles.quickActionsRow}>
                    {/* Add Money */}
                    <View style={styles.quickAction}>
                        <TouchableOpacity style={styles.actionCircle}>
                            <Text style={styles.actionIcon}>＋</Text>
                        </TouchableOpacity>
                        <Text style={styles.actionLabel}>Add{'\n'}Money</Text>
                    </View>

                    {/* Manage Beneficiary */}
                    <View style={styles.quickAction}>
                        <View style={styles.actionBadgeWrapper}>
                            <Text style={styles.badgeText}>Under{'\n'}Maintenance</Text>
                        </View>
                        <TouchableOpacity style={[styles.actionCircle, styles.actionCircleDim]}>
                            <Text style={styles.actionIcon}>👤⊕</Text>
                        </TouchableOpacity>
                        <Text style={styles.actionLabel}>Manage{'\n'}Beneficiary</Text>
                    </View>

                    {/* Send to Contacts */}
                    <View style={styles.quickAction}>
                        <View style={styles.actionBadgeWrapper}>
                            <Text style={styles.badgeText}>Coming{'\n'}Soon</Text>
                        </View>
                        <TouchableOpacity style={[styles.actionCircle, styles.actionCircleDim]}>
                            <Text style={styles.actionIcon}>🪪</Text>
                        </TouchableOpacity>
                        <Text style={styles.actionLabel}>Send to{'\n'}Contacts</Text>
                    </View>
                </View>

                {/* ── Promo Banner ── */}
                <View style={styles.promoBanner}>
                    <View style={styles.promoContent}>
                        <Text style={styles.promoTitle}>Unlock Your €10 Signup Bonus!!</Text>
                        <Text style={styles.promoSubtitle}>
                            Send total of €1,000+ and we'll drop €10{'\n'}Offer valid once per user.
                        </Text>
                        <TouchableOpacity style={styles.promoBtn}>
                            <Text style={styles.promoBtnText}>Send Now</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.promoMascotWrapper}>
                        <View style={styles.promoMascot}>
                            <Text style={styles.promoMascotText}>pa</Text>
                            <Text style={styles.promoMascotStars}>✦ ✦</Text>
                        </View>
                    </View>
                </View>

                {/* ── Dots ── */}
                <View style={styles.dotsRow}>
                    <View style={[styles.dot, styles.dotActive]} />
                    <View style={styles.dot} />
                </View>

                {/* ── Our Rates ── */}
                <Text style={styles.ratesTitle}>Our Rates</Text>

                <View style={styles.ratesCard}>
                    <Text style={styles.ratesLabel}>You are sending</Text>
                    <View style={styles.ratesInputRow}>
                        <Text style={styles.ratesAmount}>{sendAmount}</Text>
                        <View style={styles.ratesCurrencyPill}>
                            <Text style={styles.ratesFlagText}>🇸🇪</Text>
                            <Text style={styles.ratesCurrencyText}> EUR</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.ratesResultCard}>
                    <View style={styles.ratesResultRow}>
                        <Text style={styles.giftEmoji}>🎁</Text>
                        <Text style={styles.ratesResultText}>
                            Woo hoo! you get <Text style={styles.ratesHighlight}>200</Text>
                        </Text>
                        <View style={styles.ratesDivider} />
                    </View>
                </View>

                <View style={styles.ratesRecipientCard}>
                    <Text style={styles.ratesLabel}>Recipient gets</Text>
                </View>

                <View style={{ height: 80 }} />
            </ScrollView>

            {/* ── Bottom Tab Bar ── */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => setActiveTab('Home')}
                >
                    <Text style={[styles.tabIcon, activeTab === 'Home' && styles.tabIconActive]}>⌂</Text>
                    <Text style={[styles.tabLabel, activeTab === 'Home' && styles.tabLabelActive]}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => setActiveTab('History')}
                >
                    <Text style={[styles.tabIcon, activeTab === 'History' && styles.tabIconActive]}>⏱</Text>
                    <Text style={[styles.tabLabel, activeTab === 'History' && styles.tabLabelActive]}>History</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // ── Top bar ──
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: 10,
    },
    avatarBtn: {
        position: 'relative',
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarEmoji: { fontSize: 20 },
    flagEmoji: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        fontSize: 14,
    },
    topRightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    earnPill: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: 'rgba(212, 186, 127, 0.18)',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    earnText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '600',
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: { fontSize: 17 },

    // ── Scroll ──
    scroll: {
        paddingHorizontal: 16,
    },

    // ── Balance Card ──
    balanceCard: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 16,
        padding: 18,
        marginBottom: 18,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    balanceTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    balanceLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
    },
    balanceChevron: {
        color: COLORS.primary,
        fontSize: 13,
    },
    balanceAmount: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 16,
    },
    sendMoneyBtn: {
        alignSelf: 'flex-end',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    sendMoneyText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },

    // ── Quick Actions ──
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        paddingHorizontal: 8,
    },
    quickAction: {
        alignItems: 'center',
        position: 'relative',
    },
    actionBadgeWrapper: {
        position: 'absolute',
        top: -18,
        alignItems: 'center',
    },
    badgeText: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 10,
        textAlign: 'center',
        lineHeight: 13,
    },
    actionCircle: {
        width: 58,
        height: 58,
        borderRadius: 29,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionCircleDim: {
        borderColor: 'rgba(212,186,127,0.35)',
    },
    actionIcon: {
        color: COLORS.primary,
        fontSize: 22,
    },
    actionLabel: {
        color: COLORS.white,
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 17,
    },

    // ── Promo Banner ──
    promoBanner: {
        borderRadius: 16,
        backgroundColor: '#7C3E1E',
        padding: 18,
        flexDirection: 'row',
        marginBottom: 12,
        overflow: 'hidden',
    },
    promoContent: { flex: 1 },
    promoTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    promoSubtitle: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 14,
    },
    promoBtn: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
        alignSelf: 'flex-start',
    },
    promoBtnText: {
        color: '#3D1A06',
        fontWeight: '700',
        fontSize: 14,
    },
    promoMascotWrapper: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginLeft: 8,
    },
    promoMascot: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#3B2FE0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    promoMascotText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '700',
    },
    promoMascotStars: {
        color: COLORS.primary,
        fontSize: 10,
        position: 'absolute',
        top: 4,
        right: 4,
    },

    // ── Dots ──
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    dotActive: {
        backgroundColor: 'rgba(255,255,255,0.6)',
    },

    // ── Rates ──
    ratesTitle: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 12,
    },
    ratesCard: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 2,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    ratesLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        marginBottom: 8,
    },
    ratesInputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratesAmount: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: '600',
    },
    ratesCurrencyPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    ratesFlagText: { fontSize: 16 },
    ratesCurrencyText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },
    ratesResultCard: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 2,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    ratesResultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    giftEmoji: { fontSize: 20 },
    ratesResultText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        flex: 1,
    },
    ratesHighlight: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    ratesDivider: {
        width: 3,
        height: 24,
        borderRadius: 2,
        backgroundColor: '#5B4ECC',
    },
    ratesRecipientCard: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        borderBottomWidth: 0,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        padding: 14,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },

    // ── Bottom Tab Bar ──
    tabBar: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
        backgroundColor: COLORS.background,
        paddingBottom: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        gap: 3,
    },
    tabIcon: {
        fontSize: 22,
        color: 'rgba(255,255,255,0.35)',
    },
    tabIconActive: {
        color: COLORS.primary,
    },
    tabLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.35)',
    },
    tabLabelActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});

export default HomeScreen;
