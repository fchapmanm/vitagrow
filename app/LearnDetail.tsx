import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

interface LearnDetailProps {
  route: {
    params: {
      item: {
        id: string;
        title: string;
        subtitle: string;
        category: string;
        time: string;
        imageUrl: string;
        description: string;
      };
    };
  };
}

const LearnDetail: React.FC<LearnDetailProps> = ({ route }) => {
  const { item } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>{item.category} • {item.time}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 220,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
});

export default LearnDetail;
