import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
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
import { COLORS } from '../theme/colors';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'support';
    timestamp: Date;
}

const SupportChatScreen = ({ navigation }: any) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! Welcome to Zolt Support. How can we help you today?',
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
                text: "Thanks for reaching out! Our team is reviewing your account. We'll get back to you in a few minutes.",
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
                    <Text style={[styles.messageText, isUser ? styles.userText : styles.supportText]}>
                        {item.text}
                    </Text>
                </View>
                <Text style={styles.timestamp}>
                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Zolt Support</Text>
                    <View style={styles.statusContainer}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Online</Text>
                    </View>
                </View>
                <View style={{ width: 40 }} />
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
                            <ActivityIndicator size="small" color={COLORS.primary} />
                            <Text style={styles.typingText}>Support is typing...</Text>
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
                        placeholder="Type a message..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: 5,
    },
    backButtonText: {
        fontSize: 24,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.white,
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
        color: COLORS.textSecondary,
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
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 5,
    },
    supportBubble: {
        backgroundColor: COLORS.card,
        borderBottomLeftRadius: 5,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    userText: {
        color: COLORS.background,
        fontWeight: '500',
    },
    supportText: {
        color: COLORS.white,
    },
    timestamp: {
        fontSize: 10,
        color: COLORS.textSecondary,
        marginTop: 5,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    typingText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: COLORS.card,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        color: COLORS.white,
        fontSize: 16,
        maxHeight: 100,
    },
    sendButton: {
        marginLeft: 10,
        paddingHorizontal: 15,
    },
    sendButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default SupportChatScreen;
