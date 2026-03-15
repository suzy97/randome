import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useRandome } from '@/src/context/randome-context';
import type { Sentence, VideoImport } from '@/src/lib/types';
import { Body, Card, Kicker, Pill, Screen, Title, colors } from '@/src/ui';

export default function LibraryScreen() {
  const { activeImport, imports, setActiveImportId } = useRandome();

  return (
    <Screen>
      <Card>
        <Kicker>Library</Kicker>
        <Title>저장된 영상과 문장</Title>
        <Body>실제 Supabase에 저장된 데이터를 휴대폰에서 바로 확인하는 화면입니다.</Body>
      </Card>

      {imports.length > 1 ? (
        <Card>
          <Text style={styles.sectionTitle}>가져온 영상</Text>
          <View style={styles.importList}>
            {imports.map((item: VideoImport) => (
              <Pill
                key={item.id}
                label={item.sourceTitle}
                active={activeImport?.id === item.id}
                onPress={() => setActiveImportId(item.id)}
              />
            ))}
          </View>
        </Card>
      ) : null}

      {activeImport ? (
        activeImport.sentences.map((sentence: Sentence) => (
          <Pressable
            key={sentence.id}
            onPress={() =>
              router.push({
                pathname: '/sentence/[sentenceId]',
                params: { sentenceId: sentence.id },
              })
            }
            style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
            <Card>
              <View style={styles.topRow}>
                <Kicker>{sentence.starred ? 'Starred' : 'Sentence'}</Kicker>
                <Text style={styles.counts}>
                  seen {sentence.seenCount} · practiced {sentence.practicedCount}
                </Text>
              </View>
              <Text style={styles.sentence}>{sentence.english}</Text>
              <Body>{sentence.korean}</Body>
            </Card>
          </Pressable>
        ))
      ) : (
        <Card>
          <Body>아직 저장된 영상이 없습니다. Import 탭에서 먼저 유튜브 URL을 넣어주세요.</Body>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  importList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  pressable: {
    borderRadius: 22,
  },
  pressed: {
    opacity: 0.96,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  counts: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  sentence: {
    color: colors.ink,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
