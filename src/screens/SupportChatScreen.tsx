import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Keyboard,
    ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Theme from '../theme/Theme';
import { Typography } from '../components/common';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'support';
    timestamp: Date;
}

const SupportChatScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: t('support.initial_msg'),
            sender: 'support',
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (inputText.trim() === '') return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInputText('');
        Keyboard.dismiss();

        // Simulate support response
        setIsTyping(true);
        setTimeout(() => {
            const supportResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: t('support.auto_reply'),
                sender: 'support',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, supportResponse]);
            setIsTyping(false);
        }, 2000);
    };

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages, isTyping]);

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.supportMessage]}>
                <View style={[styles.bubble, isUser ? styles.userBubble : styles.supportBubble]}>
                    <Typography style={[styles.messageText, isUser ? styles.userText : styles.supportText]}>
                        {item.text}
                    </Typography>
                </View>
                <Typography style={styles.timestamp}>
                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Typography style={styles.backButtonText}>←</Typography>
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Typography style={styles.headerTitle}>{t('support.title')}</Typography>
                    <View style={styles.statusContainer}>
                        <View style={styles.statusDot} />
                        <Typography style={styles.statusText}>{t('support.online')}</Typography>
                    </View>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                    isTyping ? (
                        <View style={styles.typingContainer}>
                            <ActivityIndicator size="small" color={Theme.COLORS.primary} />
                            <Typography style={styles.typingText}>{t('support.typing')}</Typography>
                        </View>
                    ) : null
                }
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder={t('support.input_placeholder')}
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <Typography style={styles.sendButtonText}>{t('support.send')}</Typography>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
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
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Theme.COLORS.border,
    },
    backButton: {
        padding: 5,
    },
    backButtonText: {
        fontSize: 24,
        color: Theme.COLORS.primary,
        fontWeight: 'bold',
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Theme.COLORS.text,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginRight: 5,
    },
    statusText: {
        fontSize: 12,
        color: Theme.COLORS.textSecondary,
    },
    messageList: {
        paddingVertical: 20,
        paddingHorizontal: 15,
    },
    messageContainer: {
        marginBottom: 20,
        maxWidth: '80%',
    },
    userMessage: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    supportMessage: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    bubble: {
        padding: 15,
        borderRadius: 20,
    },
    userBubble: {
        backgroundColor: Theme.COLORS.primary,
        borderBottomRightRadius: 5,
    },
    supportBubble: {
        backgroundColor: Theme.COLORS.surface,
        borderBottomLeftRadius: 5,
        borderWidth: 1,
        borderColor: Theme.COLORS.border,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    userText: {
        color: Theme.COLORS.background,
        fontWeight: '500',
    },
    supportText: {
        color: Theme.COLORS.text,
    },
    timestamp: {
        fontSize: 10,
        color: Theme.COLORS.textSecondary,
        marginTop: 5,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    typingText: {
        fontSize: 12,
        color: Theme.COLORS.textSecondary,
        marginLeft: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: Theme.COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: Theme.COLORS.border,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        color: Theme.COLORS.text,
        fontSize: 16,
        maxHeight: 100,
    },
    sendButton: {
        marginLeft: 10,
        paddingHorizontal: 15,
    },
    sendButtonText: {
        color: Theme.COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    headerSpacer: {
        width: 40,
    },
});

export default SupportChatScreen;
