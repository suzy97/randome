import { ComponentProps, PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

export const colors = {
  background: '#f8f2ea',
  surface: '#fffaf4',
  ink: '#1d2631',
  muted: '#65707e',
  navy: '#20364d',
  coral: '#ef7c57',
  coralSoft: '#fff1ea',
  green: '#2e7d68',
  greenSoft: '#eaf7f2',
  line: 'rgba(29, 38, 49, 0.1)',
};

export function Screen({ children }: PropsWithChildren) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      {children}
    </ScrollView>
  );
}

export function Card({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Title({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<TextStyle> }>) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Kicker({ children }: PropsWithChildren) {
  return <Text style={styles.kicker}>{children}</Text>;
}

export function Body({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<TextStyle> }>) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

export function Label({ children }: PropsWithChildren) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Field({
  label,
  children,
}: PropsWithChildren<{ label: string }>) {
  return (
    <Card>
      <Label>{label}</Label>
      <View style={styles.fieldContent}>{children}</View>
    </Card>
  );
}

export function Input(props: ComponentProps<typeof TextInput>) {
  return <TextInput placeholderTextColor={colors.muted} style={styles.input} {...props} />;
}

export function Button({
  label,
  onPress,
  tone = 'primary',
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary' | 'soft';
  disabled?: boolean;
  loading?: boolean;
}) {
  const toneStyle =
    tone === 'secondary'
      ? styles.buttonSecondary
      : tone === 'soft'
        ? styles.buttonSoft
        : styles.buttonPrimary;

  const toneText =
    tone === 'primary' ? styles.buttonPrimaryText : styles.buttonSecondaryText;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        toneStyle,
        (disabled || loading) && styles.buttonDisabled,
        pressed && !disabled && !loading && styles.buttonPressed,
      ]}>
      {loading ? <ActivityIndicator color={tone === 'primary' ? '#fff' : colors.navy} /> : <Text style={[styles.buttonText, toneText]}>{label}</Text>}
    </Pressable>
  );
}

export function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function Alert({
  tone,
  title,
  body,
}: {
  tone: 'error' | 'info';
  title: string;
  body: string;
}) {
  return (
    <View style={[styles.alert, tone === 'error' ? styles.alertError : styles.alertInfo]}>
      <Text style={styles.alertTitle}>{title}</Text>
      <Text style={styles.alertBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContent: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 10,
  },
  kicker: {
    color: colors.coral,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  body: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  fieldContent: {
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: colors.ink,
    backgroundColor: '#fff',
  },
  button: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonPrimary: {
    backgroundColor: colors.navy,
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line,
  },
  buttonSoft: {
    backgroundColor: colors.coralSoft,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '800',
  },
  buttonPrimaryText: {
    color: '#fff',
  },
  buttonSecondaryText: {
    color: colors.navy,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    transform: [{ scale: 0.99 }],
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  pillActive: {
    backgroundColor: colors.navy,
  },
  pillText: {
    color: colors.ink,
    fontWeight: '700',
  },
  pillTextActive: {
    color: '#fff',
  },
  alert: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
  },
  alertError: {
    backgroundColor: '#fff1ee',
    borderColor: 'rgba(239, 124, 87, 0.35)',
  },
  alertInfo: {
    backgroundColor: '#edf6ff',
    borderColor: 'rgba(32, 54, 77, 0.18)',
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
  },
  alertBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
});

export const uiStyles = styles;
