import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Theme from '../../theme/Theme';
import Typography from './Typography';

export interface Country {
  name: string;
  code: string;
  callingCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { name: 'Afghanistan', code: 'AF', callingCode: '93', flag: '🇦🇫' },
  { name: 'Albania', code: 'AL', callingCode: '355', flag: '🇦🇱' },
  { name: 'Algeria', code: 'DZ', callingCode: '213', flag: '🇩🇿' },
  { name: 'Argentina', code: 'AR', callingCode: '54', flag: '🇦🇷' },
  { name: 'Australia', code: 'AU', callingCode: '61', flag: '🇦🇺' },
  { name: 'Austria', code: 'AT', callingCode: '43', flag: '🇦🇹' },
  { name: 'Belgium', code: 'BE', callingCode: '32', flag: '🇧🇪' },
  { name: 'Brazil', code: 'BR', callingCode: '55', flag: '🇧🇷' },
  { name: 'Canada', code: 'CA', callingCode: '1', flag: '🇨🇦' },
  { name: 'China', code: 'CN', callingCode: '86', flag: '🇨🇳' },
  { name: 'Denmark', code: 'DK', callingCode: '45', flag: '🇩🇰' },
  { name: 'Estonia', code: 'EE', callingCode: '372', flag: '🇪🇪' },
  { name: 'Finland', code: 'FI', callingCode: '358', flag: '🇫🇮' },
  { name: 'France', code: 'FR', callingCode: '33', flag: '🇫🇷' },
  { name: 'Germany', code: 'DE', callingCode: '49', flag: '🇩🇪' },
  { name: 'Hungary', code: 'HU', callingCode: '36', flag: '🇭🇺' },
  { name: 'India', code: 'IN', callingCode: '91', flag: '🇮🇳' },
  { name: 'Indonesia', code: 'ID', callingCode: '62', flag: '🇮🇩' },
  { name: 'Ireland', code: 'IE', callingCode: '353', flag: '🇮🇪' },
  { name: 'Italy', code: 'IT', callingCode: '39', flag: '🇮🇹' },
  { name: 'Japan', code: 'JP', callingCode: '81', flag: '🇯🇵' },
  { name: 'Latvia', code: 'LV', callingCode: '371', flag: '🇱🇻' },
  { name: 'Lithuania', code: 'LT', callingCode: '370', flag: '🇱🇹' },
  { name: 'Mexico', code: 'MX', callingCode: '52', flag: '🇲🇽' },
  { name: 'Netherlands', code: 'NL', callingCode: '31', flag: '🇳🇱' },
  { name: 'New Zealand', code: 'NZ', callingCode: '64', flag: '🇳🇿' },
  { name: 'Nigeria', code: 'NG', callingCode: '234', flag: '🇳🇬' },
  { name: 'Norway', code: 'NO', callingCode: '47', flag: '🇳🇴' },
  { name: 'Pakistan', code: 'PK', callingCode: '92', flag: '🇵🇰' },
  { name: 'Poland', code: 'PL', callingCode: '48', flag: '🇵🇱' },
  { name: 'Portugal', code: 'PT', callingCode: '351', flag: '🇵🇹' },
  { name: 'Romania', code: 'RO', callingCode: '40', flag: '🇷🇴' },
  { name: 'Russia', code: 'RU', callingCode: '7', flag: '🇷🇺' },
  { name: 'Saudi Arabia', code: 'SA', callingCode: '966', flag: '🇸🇦' },
  { name: 'Singapore', code: 'SG', callingCode: '65', flag: '🇸🇬' },
  { name: 'South Africa', code: 'ZA', callingCode: '27', flag: '🇿🇦' },
  { name: 'South Korea', code: 'KR', callingCode: '82', flag: '🇰🇷' },
  { name: 'Spain', code: 'ES', callingCode: '34', flag: '🇪🇸' },
  { name: 'Sweden', code: 'SE', callingCode: '46', flag: '🇸🇪' },
  { name: 'Switzerland', code: 'CH', callingCode: '41', flag: '🇨🇭' },
  { name: 'Turkey', code: 'TR', callingCode: '90', flag: '🇹🇷' },
  { name: 'Ukraine', code: 'UA', callingCode: '380', flag: '🇺🇦' },
  { name: 'United Arab Emirates', code: 'AE', callingCode: '971', flag: '🇦🇪' },
  { name: 'United Kingdom', code: 'GB', callingCode: '44', flag: '🇬🇧' },
  { name: 'United States', code: 'US', callingCode: '1', flag: '🇺🇸' },
  { name: 'Vietnam', code: 'VN', callingCode: '84', flag: '🇻🇳' },
];

interface CountryPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
  selectedCountryCode: string;
}

const CountryPicker: React.FC<CountryPickerProps> = ({
  visible,
  onClose,
  onSelect,
  selectedCountryCode,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filteredCountries = useMemo(() => {
    if (!search) return COUNTRIES;
    return COUNTRIES.filter(
      c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.callingCode.includes(search),
    );
  }, [search]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Typography variant="h3">{t('common.back_arrow')}</Typography>
          </TouchableOpacity>
          <View style={styles.searchBox}>
            <Typography style={styles.searchIconText}>
              {t('common.search_icon')}
            </Typography>
            <TextInput
              style={styles.searchInput}
              placeholder={t('common.search')}
              placeholderTextColor={Theme.COLORS.white35}
              value={search}
              onChangeText={setSearch}
              selectionColor={Theme.COLORS.primary}
              autoCorrect={false}
              autoFocus
            />
          </View>
        </View>

        <FlatList
          data={filteredCountries}
          keyExtractor={item => item.code}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const isSelected = item.code === selectedCountryCode;
            return (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  isSelected && styles.countryItemSelected,
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                  setSearch('');
                }}
              >
                <Typography style={styles.countryFlag}>{item.flag}</Typography>
                <Typography style={styles.countryCallingCode}>
                  +{item.callingCode}
                </Typography>
                <Typography style={styles.countryName}>
                  {t(`countries.${item.code}`)}
                </Typography>
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 15,
  },
  closeButton: {
    padding: 10,
    marginRight: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: Theme.COLORS.white10,
  },
  searchIconText: {
    fontSize: 28,
    marginRight: 12,
    color: Theme.COLORS.primary,
    fontWeight: '400',
  },
  searchInput: {
    flex: 1,
    color: Theme.COLORS.text,
    fontSize: 17,
    height: '100%',
    padding: 0,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 60,
  },
  countryItemSelected: {
    backgroundColor: Theme.COLORS.white05,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  countryFlag: {
    fontSize: 28,
    width: 44,
  },
  countryCallingCode: {
    color: Theme.COLORS.text,
    fontSize: 16,
    fontWeight: '400',
    width: 52,
  },
  countryName: {
    color: Theme.COLORS.text,
    fontSize: 16,
    fontWeight: '400',
    flex: 1,
  },
});

export default CountryPicker;
