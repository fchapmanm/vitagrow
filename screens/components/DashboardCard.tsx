import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type DashboardCardProps = {
  title: string;
  subtitle?: string;
  icon: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  badge?: string | number;
};

export default function DashboardCard({ 
  title, 
  subtitle, 
  icon, 
  onPress, 
  variant = 'primary',
  badge 
}: DashboardCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          iconContainer: styles.primaryIconContainer,
          title: styles.primaryTitle,
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          iconContainer: styles.secondaryIconContainer,
          title: styles.secondaryTitle,
        };
      case 'success':
        return {
          container: styles.successContainer,
          iconContainer: styles.successIconContainer,
          title: styles.successTitle,
        };
      case 'warning':
        return {
          container: styles.warningContainer,
          iconContainer: styles.warningIconContainer,
          title: styles.warningTitle,
        };
      default:
        return {
          container: styles.primaryContainer,
          iconContainer: styles.primaryIconContainer,
          title: styles.primaryTitle,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity 
      style={[styles.card, variantStyles.container]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, variantStyles.iconContainer]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, variantStyles.title]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        
        <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
      </View>
      
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Variant styles
  primaryContainer: {
    backgroundColor: '#ffffff',
  },
  primaryIconContainer: {
    backgroundColor: '#f0f9ff',
  },
  primaryTitle: {
    color: '#1f2937',
  },
  
  secondaryContainer: {
    backgroundColor: '#ffffff',
  },
  secondaryIconContainer: {
    backgroundColor: '#f0fdf4',
  },
  secondaryTitle: {
    color: '#1f2937',
  },
  
  successContainer: {
    backgroundColor: '#ffffff',
  },
  successIconContainer: {
    backgroundColor: '#fef3c7',
  },
  successTitle: {
    color: '#1f2937',
  },
  
  warningContainer: {
    backgroundColor: '#ffffff',
  },
  warningIconContainer: {
    backgroundColor: '#fef2f2',
  },
  warningTitle: {
    color: '#1f2937',
  },
}); 