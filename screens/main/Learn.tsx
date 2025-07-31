import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Learn() {
  const dailyTips = [
    {
      id: 1,
      title: "Water in the morning",
      description: "Plants absorb water better when the sun is rising",
      icon: "🌅"
    },
    {
      id: 2,
      title: "Check soil moisture",
      description: "Stick your finger 1 inch deep to test if watering is needed",
      icon: "👆"
    },
    {
      id: 3,
      title: "Rotate your plants",
      description: "Move pots weekly so all sides get equal sunlight",
      icon: "🔄"
    }
  ];

  const basicGuides = [
    {
      id: 1,
      title: "How to plant tomatoes",
      difficulty: "Beginner",
      time: "5 min",
      icon: "🍅"
    },
    {
      id: 2,
      title: "Growing herbs indoors",
      difficulty: "Beginner", 
      time: "3 min",
      icon: "🌿"
    },
    {
      id: 3,
      title: "Starting seeds properly",
      difficulty: "Beginner",
      time: "4 min", 
      icon: "🌱"
    },
    {
      id: 4,
      title: "Container gardening basics",
      difficulty: "Beginner",
      time: "6 min",
      icon: "🏺"
    }
  ];

  const commonProblems = [
    {
      id: 1,
      problem: "Yellow leaves",
      solution: "Usually means overwatering or lack of nutrients",
      icon: "🍂"
    },
    {
      id: 2,
      problem: "Plants not growing",
      solution: "Check sunlight, water, and soil quality",
      icon: "📏"
    },
    {
      id: 3,
      problem: "Holes in leaves",
      solution: "Look for pests like caterpillars or slugs",
      icon: "🐛"
    }
  ];

  const handleTipPress = (tip: any) => {
    console.log('Tip pressed:', tip.title);
  };

  const handleGuidePress = (guide: any) => {
    console.log('Guide pressed:', guide.title);
  };

  const handleProblemPress = (problem: any) => {
    console.log('Problem pressed:', problem.problem);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Learning Center</Text>
          <Text style={styles.headerSubtitle}>Grow your gardening knowledge</Text>
        </View>

        {/* Daily Tips Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb-outline" size={20} color="#4a7c59" />
            <Text style={styles.sectionTitle}>Today's Tips</Text>
          </View>
          {dailyTips.map((tip) => (
            <TouchableOpacity
              key={tip.id}
              style={styles.tipCard}
              onPress={() => handleTipPress(tip)}
              activeOpacity={0.7}
            >
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Basic Guides Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book-outline" size={20} color="#4a7c59" />
            <Text style={styles.sectionTitle}>Basic Guides</Text>
          </View>
          {basicGuides.map((guide) => (
            <TouchableOpacity
              key={guide.id}
              style={styles.guideCard}
              onPress={() => handleGuidePress(guide)}
              activeOpacity={0.7}
            >
              <Text style={styles.guideIcon}>{guide.icon}</Text>
              <Text style={styles.guideTitle}>{guide.title}</Text>
              <View style={styles.guideMeta}>
                <Text style={styles.guideDifficulty}>{guide.difficulty}</Text>
                <Text style={styles.guideTime}>{guide.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Common Problems Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle-outline" size={20} color="#4a7c59" />
            <Text style={styles.sectionTitle}>Common Problems</Text>
          </View>
          {commonProblems.map((problem) => (
            <TouchableOpacity
              key={problem.id}
              style={styles.problemCard}
              onPress={() => handleProblemPress(problem)}
              activeOpacity={0.7}
            >
              <Text style={styles.problemIcon}>{problem.icon}</Text>
              <Text style={styles.problemTitle}>{problem.problem}</Text>
              <Text style={styles.problemSolution}>{problem.solution}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Reference */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={20} color="#4a7c59" />
            <Text style={styles.sectionTitle}>Quick Reference</Text>
          </View>
          <View style={styles.referenceCard}>
            <Text style={styles.referenceTitle}>🌱 Planting Calendar</Text>
            <Text style={styles.referenceText}>
              Spring: Tomatoes, Peppers, Lettuce{'\n'}
              Summer: Beans, Cucumbers, Zucchini{'\n'}
              Fall: Spinach, Kale, Carrots{'\n'}
              Winter: Indoor herbs, Microgreens
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  tipCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  guideCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guideIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  guideMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guideDifficulty: {
    fontSize: 12,
    color: '#4a7c59',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  guideTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  problemCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  problemIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  problemContent: {
    flex: 1,
  },
  problemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  problemSolution: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  referenceCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  referenceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  referenceText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 24,
  },
});
