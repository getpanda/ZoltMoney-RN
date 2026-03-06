import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Theme from '../theme/Theme';
import { Typography } from '../components/common';

const DetailsScreen = () => {
    const { t } = useTranslation();
    return (
        <View style={styles.container}>
            <Typography style={styles.title}>{t('details.title')}</Typography>
            <Typography style={styles.content}>
                {t('details.content_line1')}
                {'\n'}
                {t('details.content_line2')}
            </Typography>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: Theme.COLORS.background,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: Theme.COLORS.text,
    },
    content: {
        fontSize: 16,
        color: Theme.COLORS.textSecondary,
        lineHeight: 24,
    },
});

export default DetailsScreen;
