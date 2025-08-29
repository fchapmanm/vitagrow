import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../services/firebaseConfig";
import { useAuth } from "../../services/authContext";
import { updatePlantStatus, Plant } from "../../services/plantService";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

// Tipado de la ruta
type RootStackParamList = {
  PlantGuidePreview: { 
    plant: Plant; 
    onStartGrowing?: (plant: Plant) => void 
  };
};

type PlantGuideRouteProp = RouteProp<RootStackParamList, 'PlantGuidePreview'>;

export default function PlantGuidePreview() {
  const route = useRoute<PlantGuideRouteProp>();
  const navigation = useNavigation();
  const { plant, onStartGrowing } = route.params;
  const { user, isGuest } = useAuth();
  
  const [eduData, setEduData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Log para debugging
  console.log("🌱 PlantGuidePreview - Datos recibidos:", {
    plantName: plant?.name,
    plantId: plant?.id,
    plantImage: plant?.imageUrl,
    plantStatus: plant?.status,
    plantDifficulty: plant?.difficulty
  });
  
  console.log("🔍 Estrategias de búsqueda que se intentarán:");
  console.log(`   1. Nombre exacto: ${plant?.name?.toLowerCase()}`);
  console.log(`   2. Nombre con guión: ${plant?.name?.toLowerCase()}-001`);
  console.log(`   3. ID de planta: ${plant?.id}`);
  console.log(`   4. Nombre limpio: ${plant?.name?.toLowerCase().replace(/[^a-z0-9]/g, '')}`);

  useEffect(() => {
    const fetchEducationalData = async () => {
      try {
        if (!plant?.name) {
          console.warn("Plant name missing");
          setLoading(false);
          return;
        }

        console.log(`🔍 Buscando datos educativos para: ${plant.name}`);

        // Estrategia 1: Buscar por nombre exacto en minúsculas
        const plantName = plant.name.toLowerCase();
        let ref = doc(firestore, "educational_plants", plantName);
        let snap = await getDoc(ref);
        
        if (snap.exists()) {
          setEduData(snap.data());
          console.log(`✅ Datos encontrados por nombre: ${plant.name}`);
          setLoading(false);
          return;
        }

        // Estrategia 1.1: Buscar por nombre sin espacios
        const nameNoSpaces = plantName.replace(/\s+/g, '');
        ref = doc(firestore, "educational_plants", nameNoSpaces);
        snap = await getDoc(ref);
        if (snap.exists()) {
          setEduData(snap.data());
          console.log(`✅ Datos encontrados por nombre sin espacios: ${nameNoSpaces}`);
          setLoading(false);
          return;
        }

        // Estrategia 2: Buscar por nombre con guión (ej: tomato-001)
        const plantNameWithDash = `${plantName}-001`;
        ref = doc(firestore, "educational_plants", plantNameWithDash);
        snap = await getDoc(ref);
        
        if (snap.exists()) {
          setEduData(snap.data());
          console.log(`✅ Datos encontrados por nombre con guión: ${plantNameWithDash}`);
          setLoading(false);
          return;
        }

        // Estrategia 2.1: Buscar por nombre sin espacios + sufijo (ej: springonion-001)
        const compactWithDash = `${nameNoSpaces}-001`;
        ref = doc(firestore, "educational_plants", compactWithDash);
        snap = await getDoc(ref);
        if (snap.exists()) {
          setEduData(snap.data());
          console.log(`✅ Datos encontrados por nombre compacto con guión: ${compactWithDash}`);
          setLoading(false);
          return;
        }

        // Estrategia 3: Buscar por ID si existe
        if (plant.id) {
          ref = doc(firestore, "educational_plants", plant.id);
          snap = await getDoc(ref);
          
          if (snap.exists()) {
            setEduData(snap.data());
            console.log(`✅ Datos encontrados por ID: ${plant.id}`);
            setLoading(false);
            return;
          }
        }

        // Estrategia 4: Buscar por nombre sin espacios ni caracteres especiales
        const cleanPlantName = plantName.replace(/[^a-z0-9]/g, '');
        ref = doc(firestore, "educational_plants", cleanPlantName);
        snap = await getDoc(ref);
        
        if (snap.exists()) {
          setEduData(snap.data());
          console.log(`✅ Datos encontrados por nombre limpio: ${cleanPlantName}`);
          setLoading(false);
          return;
        }

        // Si no se encuentra nada, mostrar warning
        console.warn(`❌ No se encontraron datos educativos para: ${plant.name}`);
        console.warn(`   Intentado: ${plantName}, ${plantNameWithDash}, ${plant.id}, ${cleanPlantName}`);
        
      } catch (err) {
        console.error("Error fetching educational data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEducationalData();
  }, [plant?.name, plant?.id]);

  const handleStartGrowing = async () => {
    if (!plant?.id) {
      Alert.alert("Error", "Plant ID missing");
      return;
    }

    if (isUpdating) return; // Prevenir múltiples ejecuciones

    try {
      setIsUpdating(true);
      
      await updatePlantStatus(plant.id, "growing", isGuest, user);
      
      // Llamar callback si existe
      if (onStartGrowing) {
        onStartGrowing(plant);
      }
      
      Alert.alert(
        "✅ Success", 
        `${plant.name} is now in your Growing tab!`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      
    } catch (err) {
      console.error("Error updating plant status:", err);
      Alert.alert(
        "❌ Error", 
        "Could not start growing this plant. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading plant information...</Text>
      </View>
    );
  }

  if (!eduData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Educational data not found for {plant.name}
        </Text>
        <Text style={styles.errorSubtext}>
          This plant doesn't have growing guide information yet.
        </Text>
        <Text style={styles.errorSubtext}>
          Plant ID: {plant.id || 'N/A'}
        </Text>
        <Text style={styles.errorSubtext}>
          Plant Name: {plant.name}
        </Text>
        <Text style={styles.errorSubtext}>
          Check console for search details.
        </Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con botón de regreso */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Growing Guide</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Imagen */}
        {plant.imageUrl && (
          <Image source={{ uri: plant.imageUrl }} style={styles.image} />
        )}

        {/* Nombre */}
        <Text style={styles.title}>{plant.name}</Text>

        {/* Descripción */}
        {eduData.basicInfo?.description && (
          <Text style={styles.description}>{eduData.basicInfo.description}</Text>
        )}

        {/* Sección Why Grow */}
        {eduData.basicInfo?.whyGrow && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why Grow</Text>
            {eduData.basicInfo.whyGrow.map((item: string, idx: number) => (
              <Text key={idx} style={styles.sectionText}>• {item}</Text>
            ))}
          </View>
        )}

        {/* Growing Steps */}
        {eduData.growingSteps && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Growing Steps</Text>
            {eduData.growingSteps.map((step: string, idx: number) => (
              <Text key={idx} style={styles.sectionText}>{idx + 1}. {step}</Text>
            ))}
          </View>
        )}

        {/* Botón Start Growing */}
        <TouchableOpacity 
          style={[styles.button, isUpdating && styles.buttonDisabled]} 
          onPress={handleStartGrowing}
          disabled={isUpdating}
        >
          <Text style={styles.buttonText}>
            {isUpdating ? "⏳ Processing..." : "▶ Start Growing"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    backgroundColor: "#fff",
    marginTop: 20,
  },
  backButton: {
    padding: 12,
    minWidth: 70,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
    textAlign: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#1a1a1a",
  },
  headerRight: {
    width: 60, // Mismo ancho que el botón de regreso para centrar el título
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  image: { width: "100%", height: 200, borderRadius: 12, marginBottom: 16, marginTop: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  description: { fontSize: 16, color: "#444", marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  sectionText: { fontSize: 16, marginBottom: 4, color: "#333" },
  button: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red", marginBottom: 16, textAlign: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#666" },
  retryButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  errorSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    marginBottom: 16,
    textAlign: "center",
  },
});
