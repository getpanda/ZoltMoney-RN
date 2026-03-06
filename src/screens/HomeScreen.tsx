import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Theme from '../theme/Theme';
import Typography from '../components/common/Typography';
import { StorageService } from '../services/StorageService';
import { getWalletBalance } from '../api/auth';

const HomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
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
          const decimals =
            typeof data.data.decimals === 'number' ? data.data.decimals : 2;
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
      t('home.logout_confirm.title'),
      t('home.logout_confirm.message'),
      [
        { text: t('home.logout_confirm.cancel'), style: 'cancel' },
        {
          text: t('home.logout_confirm.confirm'),
          style: 'destructive',
          onPress: async () => {
            await StorageService.logout();
            navigation.replace('Landing');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.avatarBtn} onPress={handleLogout}>
          <Typography style={styles.avatarEmoji}>
            {t('common.user_icon')}
          </Typography>
          <Typography style={styles.flagEmoji}>
            {t('home.rates.flag')}
          </Typography>
        </TouchableOpacity>

        <View style={styles.topRightRow}>
          <TouchableOpacity style={styles.earnPill}>
            <Typography style={styles.earnText}>
              {t('home.earn_pill')}
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle}>
            <Typography style={styles.iconText}>
              {t('common.bell_icon')}
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle}>
            <Typography style={styles.iconText}>
              {t('common.support_emoji')}
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Balance Card ── */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceTopRow}>
            <Typography style={styles.balanceLabel}>
              {t('home.balance_label', { currency: 'EUR' })}
            </Typography>
            <Typography style={styles.balanceChevron}>
              {t('common.chevron_down')}
            </Typography>
          </View>
          <Typography style={styles.balanceAmount}>
            {balanceLoading
              ? t('common.loading_dots')
              : `${balance} ${currency}`}
          </Typography>
          <TouchableOpacity style={styles.sendMoneyBtn}>
            <Typography style={styles.sendMoneyText}>
              {t('home.send_money')}
            </Typography>
          </TouchableOpacity>
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.quickActionsRow}>
          {/* Add Money */}
          <View style={styles.quickAction}>
            <TouchableOpacity style={styles.actionCircle}>
              <Typography style={styles.actionIcon}>
                {t('common.plus_icon')}
              </Typography>
            </TouchableOpacity>
            <Typography style={styles.actionLabel}>
              {t('home.quick_actions.add_money')}
            </Typography>
          </View>

          {/* Manage Beneficiary */}
          <View style={styles.quickAction}>
            <View style={styles.actionBadgeWrapper}>
              <Typography style={styles.badgeText}>
                {t('home.quick_actions.under_maintenance')}
              </Typography>
            </View>
            <TouchableOpacity
              style={[styles.actionCircle, styles.actionCircleDim]}
            >
              <Typography style={styles.actionIcon}>
                {t('common.user_plus_icon')}
              </Typography>
            </TouchableOpacity>
            <Typography style={styles.actionLabel}>
              {t('home.quick_actions.manage_beneficiary')}
            </Typography>
          </View>

          {/* Send to Contacts */}
          <View style={styles.quickAction}>
            <View style={styles.actionBadgeWrapper}>
              <Typography style={styles.badgeText}>
                {t('home.quick_actions.coming_soon')}
              </Typography>
            </View>
            <TouchableOpacity
              style={[styles.actionCircle, styles.actionCircleDim]}
            >
              <Typography style={styles.actionIcon}>
                {t('home.quick_actions.id_success_icon')}
              </Typography>
            </TouchableOpacity>
            <Typography style={styles.actionLabel}>
              {t('home.quick_actions.send_to_contacts')}
            </Typography>
          </View>
        </View>

        {/* ── Promo Banner ── */}
        <View style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <Typography style={styles.promoTitle}>
              {t('home.promo.title')}
            </Typography>
            <Typography style={styles.promoSubtitle}>
              {t('home.promo.subtitle', { amount: '€1,000' })}
            </Typography>
            <TouchableOpacity style={styles.promoBtn}>
              <Typography style={styles.promoBtnText}>
                {t('home.promo.button')}
              </Typography>
            </TouchableOpacity>
          </View>
          <View style={styles.promoMascotWrapper}>
            <View style={styles.promoMascot}>
              <Typography style={styles.promoMascotText}>
                {t('home.promo.mascot_text')}
              </Typography>
              <Typography style={styles.promoMascotStars}>
                {t('home.promo.mascot_stars')}
              </Typography>
            </View>
          </View>
        </View>

        {/* ── Dots ── */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>

        {/* ── Our Rates ── */}
        <Typography style={styles.ratesTitle}>
          {t('home.rates.title')}
        </Typography>

        <View style={styles.ratesCard}>
          <Typography style={styles.ratesLabel}>
            {t('home.rates.sending_label')}
          </Typography>
          <View style={styles.ratesInputRow}>
            <Typography style={styles.ratesAmount}>{sendAmount}</Typography>
            <View style={styles.ratesCurrencyPill}>
              <Typography style={styles.ratesFlagText}>
                {t('home.rates.flag')}
              </Typography>
              <Typography style={styles.ratesCurrencyText}>
                {t('home.rates.currency_suffix')}
              </Typography>
            </View>
          </View>
        </View>

        <View style={styles.ratesResultCard}>
          <View style={styles.ratesResultRow}>
            <Typography style={styles.giftEmoji}>
              {t('home.gift_emoji')}
            </Typography>
            <Typography style={styles.ratesResultText}>
              {t('home.rates.success_msg', { amount: '' })}
              <Typography style={styles.ratesHighlight}>200</Typography>
            </Typography>
            <View style={styles.ratesDivider} />
          </View>
        </View>

        <View style={styles.ratesRecipientCard}>
          <Typography style={styles.ratesLabel}>
            {t('home.rates.recipient_label')}
          </Typography>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Bottom Tab Bar ── */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('Home')}
        >
          <Typography
            style={[
              styles.tabIcon,
              activeTab === 'Home' && styles.tabIconActive,
            ]}
          >
            {t('home.tabs.home_icon')}
          </Typography>
          <Typography
            style={[
              styles.tabLabel,
              activeTab === 'Home' && styles.tabLabelActive,
            ]}
          >
            {t('home.tabs.home')}
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('History')}
        >
          <Typography
            style={[
              styles.tabIcon,
              activeTab === 'History' && styles.tabIconActive,
            ]}
          >
            {t('home.tabs.history_icon')}
          </Typography>
          <Typography
            style={[
              styles.tabLabel,
              activeTab === 'History' && styles.tabLabelActive,
            ]}
          >
            {t('home.tabs.history')}
          </Typography>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.COLORS.background,
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
    borderColor: Theme.COLORS.primary,
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
    borderRadius: Theme.BORDER_RADIUS.full,
    backgroundColor: Theme.COLORS.primary10,
    borderWidth: 1,
    borderColor: Theme.COLORS.primary,
  },
  earnText: {
    color: Theme.COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Theme.COLORS.primary,
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
    borderColor: Theme.COLORS.white12,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    backgroundColor: Theme.COLORS.white05,
  },
  balanceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  balanceLabel: {
    color: Theme.COLORS.textSecondary,
    fontSize: 13,
  },
  balanceChevron: {
    color: Theme.COLORS.primary,
    fontSize: 13,
  },
  balanceAmount: {
    color: Theme.COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  sendMoneyBtn: {
    alignSelf: 'flex-end',
    backgroundColor: Theme.COLORS.white10,
    borderRadius: Theme.BORDER_RADIUS.full,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Theme.COLORS.white12,
  },
  sendMoneyText: {
    color: Theme.COLORS.text,
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
    color: Theme.COLORS.white45,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 13,
  },
  actionCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: Theme.COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionCircleDim: {
    borderColor: Theme.COLORS.primary30,
  },
  actionIcon: {
    color: Theme.COLORS.primary,
    fontSize: 22,
  },
  actionLabel: {
    color: Theme.COLORS.text,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },

  // ── Promo Banner ──
  promoBanner: {
    borderRadius: 16,
    backgroundColor: Theme.COLORS.promoBrown,
    padding: 18,
    flexDirection: 'row',
    marginBottom: 12,
    overflow: 'hidden',
  },
  promoContent: { flex: 1 },
  promoTitle: {
    color: Theme.COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  promoSubtitle: {
    color: Theme.COLORS.white75,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  promoBtn: {
    backgroundColor: Theme.COLORS.white92,
    borderRadius: Theme.BORDER_RADIUS.full,
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  promoBtnText: {
    color: Theme.COLORS.promoDarkText,
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
    backgroundColor: Theme.COLORS.promoPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoMascotText: {
    color: Theme.COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  promoMascotStars: {
    color: Theme.COLORS.primary,
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
    backgroundColor: Theme.COLORS.white20,
  },
  dotActive: {
    backgroundColor: Theme.COLORS.white60,
  },

  // ── Rates ──
  ratesTitle: {
    color: Theme.COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  ratesCard: {
    borderWidth: 1,
    borderColor: Theme.COLORS.white12,
    borderRadius: 12,
    padding: 14,
    marginBottom: 2,
    backgroundColor: Theme.COLORS.white05,
  },
  ratesLabel: {
    color: Theme.COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  bottomSection: {
    marginBottom: 20,
  },
  bottomSpacer: {
    height: 80,
  },
  ratesInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratesAmount: {
    color: Theme.COLORS.text,
    fontSize: 22,
    fontWeight: '600',
  },
  ratesCurrencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.COLORS.white05,
    borderRadius: Theme.BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ratesFlagText: { fontSize: 16 },
  ratesCurrencyText: {
    color: Theme.COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  ratesResultCard: {
    borderWidth: 1,
    borderColor: Theme.COLORS.white12,
    borderRadius: 12,
    padding: 14,
    marginBottom: 2,
    backgroundColor: Theme.COLORS.white05,
  },
  ratesResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  giftEmoji: { fontSize: 20 },
  ratesResultText: {
    color: Theme.COLORS.white75,
    fontSize: 14,
    flex: 1,
  },
  ratesHighlight: {
    color: Theme.COLORS.primary,
    fontWeight: '700',
  },
  ratesDivider: {
    width: 3,
    height: 24,
    borderRadius: 2,
    backgroundColor: Theme.COLORS.dividerPurple,
  },
  ratesRecipientCard: {
    borderWidth: 1,
    borderColor: Theme.COLORS.white12,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 14,
    backgroundColor: Theme.COLORS.white05,
  },

  // ── Bottom Tab Bar ──
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Theme.COLORS.white10,
    backgroundColor: Theme.COLORS.background,
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
    color: Theme.COLORS.white35,
  },
  tabIconActive: {
    color: Theme.COLORS.primary,
  },
  tabLabel: {
    fontSize: 11,
    color: Theme.COLORS.white35,
  },
  tabLabelActive: {
    color: Theme.COLORS.primary,
    fontWeight: '600',
  },
});

export default HomeScreen;
