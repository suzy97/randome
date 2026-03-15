import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useRandome } from '@/src/context/randome-context';
import type { Sentence, VideoImport } from '@/src/lib/types';
import { Body, Button, Card, Kicker, Pill, Screen, colors } from '@/src/ui';

export default function SentenceDetailScreen() {
  const { sentenceId } = useLocalSearchParams<{ sentenceId: string }>();
  const { imports, markPracticed, markSeen, toggleStar } = useRandome();
  const [feedback, setFeedback] = useState<string>('');

  const sentence = useMemo(
    () =>
      imports
        .flatMap((item: VideoImport) => item.sentences)
        .find((item: Sentence) => item.id === sentenceId) || null,
    [imports, sentenceId]
  );

  if (!sentence) {
    return (
      <Screen>
        <Card>
          <Body>문장을 찾지 못했습니다.</Body>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <View style={styles.topRow}>
          <Kicker>Sentence Card</Kicker>
          <Pill
            label={sentence.starred ? '별표됨' : '별표'}
            active={sentence.starred}
            onPress={() => void toggleStar(sentence.id)}
          />
        </View>
        <Text style={styles.sentence}>{sentence.english}</Text>
        <Body>{sentence.korean}</Body>
      </Card>

      <Card>
        <Kicker>Pattern</Kicker>
        <Text style={styles.pattern}>{sentence.pattern}</Text>
        <Body>{sentence.reason}</Body>
      </Card>

      <Card>
        <Kicker>Practice</Kicker>
        <Text style={styles.practice}>{sentence.cloze}</Text>
        <View style={styles.choiceRow}>
          {sentence.choices.map((choice: string) => (
            <Pressable
              key={choice}
              onPress={() => {
                const correct = choice === sentence.answer;
                setFeedback(
                  correct ? `좋아요. 정답은 ${sentence.answer} 입니다.` : `다시 보면 정답은 ${sentence.answer} 입니다.`
                );
              }}
              style={({ pressed }) => [styles.choice, pressed && styles.choicePressed]}>
              <Text style={styles.choiceText}>{choice}</Text>
            </Pressable>
          ))}
        </View>
        {feedback ? <Body style={styles.feedback}>{feedback}</Body> : null}
      </Card>

      <Card>
        <Kicker>Example</Kicker>
        <Text style={styles.example}>{sentence.example}</Text>
      </Card>

      <View style={styles.actions}>
        <Button
          label="열람 기록 저장"
          tone="soft"
          onPress={() => {
            setFeedback('열람 기록을 저장했습니다.');
            void markSeen(sentence.id);
          }}
        />
        <Button
          label="연습 완료"
          onPress={() => {
            setFeedback('연습 완료를 저장했습니다.');
            void markPracticed(sentence.id);
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  sentence: {
    color: colors.ink,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  pattern: {
    color: colors.navy,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
  },
  practice: {
    color: colors.ink,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choice: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  choicePressed: {
    backgroundColor: colors.coralSoft,
  },
  choiceText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  feedback: {
    color: colors.navy,
  },
  example: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  actions: {
    gap: 12,
  },
});
