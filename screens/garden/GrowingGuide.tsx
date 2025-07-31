import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

type Lesson = {
  id: number;
  title: string;
  subItems?: string[];
};

type GrowingGuideProps = {
  route: {
    params: {
      plant: {
        name: string;
        imageUrl?: string;
      };
    };
  };
};

export default function GrowingGuide({ route }: GrowingGuideProps) {
  const navigation = useNavigation<any>();
  const { plant } = route.params;

  // Static lessons data - can be expanded later
  const lessons: Lesson[] = [
    {
      id: 1,
      title: `Get to Know ${plant.name}`,
      subItems: ['Introduction', 'Seasonal precautions']
    },
    {
      id: 2,
      title: `Environments Where ${plant.name} Thrives`,
      subItems: ['Watering & hardiness', 'Sunlight conditions', 'Soil requirements']
    },
    {
      id: 3,
      title: `How to Plant ${plant.name}`
    },
    {
      id: 4,
      title: `When to Water My ${plant.name}`
    },
    {
      id: 5,
      title: `How to Feed ${plant.name}`
    },
    {
      id: 6,
      title: `How to Prune ${plant.name}`
    },
    {
      id: 7,
      title: `How to Harvest ${plant.name}`
    },
    {
      id: 8,
      title: 'FAQ'
    }
  ];

  const handleLessonPress = (lesson: Lesson) => {
    // For now, just show an alert. Later can navigate to detailed lesson
    console.log(`Lesson pressed: ${lesson.title}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Growing Guide</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>
            Learn how to grow {plant.name} step-by-step
          </Text>
          <View style={styles.lessonsBadge}>
            <Text style={styles.lessonsBadgeText}>{lessons.length} Lessons</Text>
          </View>
        </View>

        {/* Lessons List */}
        <View style={styles.lessonsContainer}>
          {lessons.map((lesson) => (
            <TouchableOpacity
              key={lesson.id}
              style={styles.lessonItem}
              onPress={() => handleLessonPress(lesson)}
              activeOpacity={0.7}
            >
              <View style={styles.lessonHeader}>
                <View style={styles.lessonNumber}>
                  <Text style={styles.lessonNumberText}>{lesson.id}</Text>
                </View>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
              
              {lesson.subItems && (
                <View style={styles.subItemsContainer}>
                  {lesson.subItems.map((subItem, index) => (
                    <View key={index} style={styles.subItem}>
                      <View style={styles.subItemDot} />
                      <Text style={styles.subItemText}>{subItem}</Text>
                      <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 32,
  },
  lessonsBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  lessonsBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  lessonsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  lessonItem: {
    marginBottom: 16,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lessonNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
  },
  lessonTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  subItemsContainer: {
    marginLeft: 48,
    marginTop: 8,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  subItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 12,
  },
  subItemText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
}); 