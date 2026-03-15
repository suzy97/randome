import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useRandome } from '@/src/context/randome-context';
import type { Reminder, Sentence } from '@/src/lib/types';
import { Alert, Body, Button, Card, Kicker, Pill, Screen, Title, colors } from '@/src/ui';

export default function HomeScreen() {
  const {
    activeImport,
    activeSentence,
    error,
    info,
    imports,
    loading,
    refreshing,
    reminders,
    clearMessages,
    generateReminderNow,
    refresh,
    scheduleDemoReminders,
  } = useRandome();

  return (
    <Screen>
      {error ? <Alert tone="error" title="오류" body={error} /> : null}
      {info ? <Alert tone="info" title="안내" body={info} /> : null}

      <Card style={styles.heroCard}>
        <Kicker>Randome Mobile</Kicker>
        <Title style={styles.heroTitle}>휴대폰에서 바로 보는{'\n'}영어 문장 루프</Title>
        <Body style={styles.heroBody}>
          Vercel API와 Supabase에 연결된 실제 모바일 테스트 앱입니다. 여기서 바로 리마인드와
          문장 학습 흐름을 볼 수 있습니다.
        </Body>
      </Card>

      {activeImport ? (
        <Card>
          <Kicker>Latest Import</Kicker>
          <Text style={styles.importTitle}>{activeImport.sourceTitle}</Text>
          <Body>
            {activeImport.learningWindowStart} - {activeImport.learningWindowEnd}, 하루{' '}
            {activeImport.dailyReminderCount}회 리마인드
          </Body>

          <View style={styles.metricRow}>
            <Metric label="문장" value={String(activeImport.sentences.length)} />
            <Metric
              label="열람"
              value={String(
                activeImport.sentences.reduce(
                  (sum: number, item: Sentence) => sum + item.seenCount,
                  0
                )
              )}
            />
            <Metric
              label="연습"
              value={String(
                activeImport.sentences.reduce(
                  (sum: number, item: Sentence) => sum + item.practicedCount,
                  0
                )
              )}
            />
          </View>
        </Card>
      ) : (
        <Card>
          <Title style={styles.emptyTitle}>아직 가져온 영상이 없어요</Title>
          <Body>Import 탭에서 유튜브 URL을 넣으면 휴대폰에서도 바로 문장을 받아볼 수 있습니다.</Body>
        </Card>
      )}

      <View style={styles.buttonStack}>
        <Button
          label={refreshing ? '새로고침 중...' : '데이터 새로고침'}
          onPress={() => {
            clearMessages();
            void refresh();
          }}
          tone="secondary"
          disabled={refreshing}
          loading={refreshing}
        />
        <Button
          label="랜덤 리마인드 1개 생성"
          onPress={() => {
            clearMessages();
            void generateReminderNow();
          }}
          disabled={!activeImport || loading}
          loading={loading}
        />
        <Button
          label="5초/15초/30초 로컬 알림 테스트"
          onPress={() => {
            clearMessages();
            void scheduleDemoReminders();
          }}
          tone="soft"
          disabled={!activeImport}
        />
      </View>

      {activeSentence ? (
        <Card>
          <View style={styles.rowBetween}>
            <View style={styles.gap6}>
              <Kicker>Current Sentence</Kicker>
              <Text style={styles.sentence}>{activeSentence.english}</Text>
              <Body>{activeSentence.korean}</Body>
            </View>
            <Pill
              label="열기"
              active
              onPress={() =>
                router.push({
                  pathname: '/sentence/[sentenceId]',
                  params: { sentenceId: activeSentence.id },
                })
              }
            />
          </View>
        </Card>
      ) : null}

      <Card>
        <View style={styles.rowBetween}>
          <View style={styles.gap6}>
            <Kicker>Reminders</Kicker>
            <Text style={styles.sectionTitle}>최근 리마인드 로그</Text>
          </View>
          <Pill label={`${reminders.length}개`} />
        </View>

        {reminders.length ? (
          reminders.slice(0, 4).map((reminder: Reminder) => (
            <View key={reminder.id} style={styles.reminderItem}>
              <Text style={styles.reminderTitle}>{reminder.title}</Text>
              <Body>{reminder.preview}</Body>
              <Text style={styles.caption}>{reminder.deliveredAtLabel}</Text>
            </View>
          ))
        ) : (
          <Body>아직 리마인드 로그가 없습니다. 위 버튼으로 바로 테스트할 수 있습니다.</Body>
        )}
      </Card>

      <Card>
        <Kicker>Quick Status</Kicker>
        <Text style={styles.sectionTitle}>현재 휴대폰 테스트 준비 상태</Text>
        <Body>저장된 영상 {imports.length}개 · 실제 API 연동 완료 · Expo 로컬 알림 테스트 가능</Body>
      </Card>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 36,
    lineHeight: 38,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.84)',
  },
  importTitle: {
    color: colors.ink,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    color: colors.navy,
    fontSize: 24,
    fontWeight: '800',
  },
  buttonStack: {
    gap: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  gap6: {
    gap: 6,
    flex: 1,
  },
  sentence: {
    color: colors.ink,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  reminderItem: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 14,
    gap: 4,
    backgroundColor: '#fff',
  },
  reminderTitle: {
    color: colors.navy,
    fontSize: 15,
    fontWeight: '800',
  },
  caption: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 26,
    lineHeight: 30,
  },
});
