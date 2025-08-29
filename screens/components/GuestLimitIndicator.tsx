import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GuestLimitIndicatorProps {
  current: number;
  max: number;
  type: 'growing' | 'plants';
  showWarning?: boolean;
}

export default function GuestLimitIndicator({ 
  current, 
  max, 
  type, 
  showWarning = false 
}: GuestLimitIndicatorProps) {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= max;

  const getIcon = () => {
    if (type === 'growing') return 'leaf-outline';
    return 'nutrition-outline';
  };

  const getLabel = () => {
    if (type === 'growing') return 'Growing Plants';
    return 'Plants Explored';
  };

  const getProgressColor = () => {
    if (isAtLimit) return '#ef4444';
    if (isNearLimit) return '#f59e0b';
    return '#059669';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconLabel}>
          <Ionicons name={getIcon()} size={16} color="#6b7280" />
          <Text style={styles.label}>{getLabel()}</Text>
        </View>
        <View style={styles.freeBadge}>
          <Text style={styles.freeText}>FREE</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: getProgressColor()
              }
            ]} 
          />
        </View>
        <Text style={styles.counter}>
          {current}/{max}
        </Text>
      </View>

      {(showWarning && isNearLimit) && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning-outline" size={14} color="#f59e0b" />
          <Text style={styles.warningText}>
            {isAtLimit 
              ? `Limit reached! Register for unlimited ${type === 'growing' ? 'growing' : 'exploration'}.`
              : `Almost at limit! ${max - current} remaining.`
            }
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  freeBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  freeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400e',
    letterSpacing: 0.5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  counter: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    minWidth: 30,
    textAlign: 'right',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  warningText: {
    fontSize: 11,
    color: '#f59e0b',
    flex: 1,
    fontWeight: '500',
  },
}); 