import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { Session, Drill } from '@/lib/types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#000000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 10,
    color: '#666666',
    marginTop: 5,
  },
  drillContainer: {
    marginBottom: 40, // More space between drills
    paddingBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#f0f0f0',
  },
  drillTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000000',
  },
  thumbnail: {
    width: 400, // Fixed width to prevent stretching
    marginBottom: 20,
  },
  meta: {
    marginBottom: 15,
    padding: 8,
    backgroundColor: '#f8f8f8',
  },
  metaText: {
    fontSize: 10,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
    color: '#2563eb',
  },
  listContainer: {
    marginLeft: 10,
  },
  listItem: {
    marginBottom: 6,
  },
  listText: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#333333',
  }
});

const formatList = (text: string) => {
  if (!text) return [];
  return text.split(/[\n•]/).map(l => l.trim()).filter(l => l.length > 0);
};

export const SessionPDF = ({ session }: { session: Session }) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{session.title}</Text>
          <Text style={styles.subtitle}>
            Date: {new Date(session.date).toLocaleDateString()}  |  Players: {session.playerCount}
          </Text>
        </View>

        {session.drills.map((drill, index) => (
          <View key={index} style={styles.drillContainer} wrap={false}>
            <Text style={styles.drillTitle}>{index + 1}. {drill.title}</Text>
            
            {drill.thumbnail_path && (
              <Image 
                src={`${baseUrl}${drill.thumbnail_path}`} 
                style={styles.thumbnail} 
              />
            )}

            <View style={styles.meta}>
              <Text style={styles.metaText}>Players: {drill.number_of_players}</Text>
              <Text style={styles.metaText}>Pitch Size: {drill.pitch_size}</Text>
            </View>

            <View>
              <Text style={styles.sectionTitle}>Instructions & Setup</Text>
              <View style={styles.listContainer}>
                {formatList(drill.instructions_setup).map((item, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.listText}>{i + 1}. {item}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.sectionTitle}>Coaching Notes</Text>
              <View style={styles.listContainer}>
                {formatList(drill.coaching_notes).map((item, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.listText}>• {item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {(drill.progression_one && drill.progression_one !== "​") || 
             (drill.progression_two && drill.progression_two !== "​") ? (
              <View>
                <Text style={styles.sectionTitle}>Progressions</Text>
                <View style={styles.listContainer}>
                  {drill.progression_one && drill.progression_one !== "​" && (
                    <View style={styles.listItem}>
                      <Text style={styles.listText}>P1: {drill.progression_one}</Text>
                    </View>
                  )}
                  {drill.progression_two && drill.progression_two !== "​" && (
                    <View style={styles.listItem}>
                      <Text style={styles.listText}>P2: {drill.progression_two}</Text>
                    </View>
                  )}
                </View>
              </View>
            ) : null}
          </View>
        ))}
      </Page>
    </Document>
  );
};
