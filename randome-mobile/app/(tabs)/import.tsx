import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useRandome } from '@/src/context/randome-context';
import {
  Alert,
  Body,
  Button,
  Card,
  Field,
  Input,
  Kicker,
  Pill,
  Screen,
  Title,
  colors,
} from '@/src/ui';

export default function ImportScreen() {
  const {
    dailyReminderCount,
    error,
    info,
    learningWindowEnd,
    learningWindowStart,
    loading,
    setDailyReminderCount,
    setLearningWindowEnd,
    setLearningWindowStart,
    clearMessages,
    createImport,
  } = useRandome();
  const [url, setUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  return (
    <Screen>
      {error ? <Alert tone="error" title="오류" body={error} /> : null}
      {info ? <Alert tone="info" title="안내" body={info} /> : null}

      <Card>
        <Kicker>Import</Kicker>
        <Title>유튜브 URL을 넣으면{'\n'}모바일에서도 바로 씁니다</Title>
        <Body>
          휴대폰에서 바로 넣고, 문장이 생성되면 Supabase에 저장됩니다. 저장된 뒤에는 홈과 보관함에서
          바로 열 수 있습니다.
        </Body>
      </Card>

      <Field label="YouTube URL">
        <Input value={url} onChangeText={setUrl} autoCapitalize="none" autoCorrect={false} />
      </Field>

      <Field label="학습 시작 시간">
        <Input value={learningWindowStart} onChangeText={setLearningWindowStart} placeholder="09:00" />
      </Field>

      <Field label="학습 종료 시간">
        <Input value={learningWindowEnd} onChangeText={setLearningWindowEnd} placeholder="21:00" />
      </Field>

      <Card>
        <Text style={styles.label}>하루 리마인드 수</Text>
        <View style={styles.pillRow}>
          {[3, 4, 5].map((count) => (
            <Pill
              key={count}
              label={`${count}회`}
              active={dailyReminderCount === count}
              onPress={() => setDailyReminderCount(count)}
            />
          ))}
        </View>
      </Card>

      <Button
        label="문장 생성하고 저장"
        onPress={async () => {
          clearMessages();
          await createImport(url);
          router.replace('/');
        }}
        loading={loading}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
});
