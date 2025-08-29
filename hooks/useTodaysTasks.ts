import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { firestore } from '../services/firebaseConfig';
import { useAuth } from '../services/authContext';
import { Task } from '../services/plantService';

interface UseTodaysTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useTodaysTasks = (): UseTodaysTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isGuest } = useAuth();

  // Función para obtener la fecha de hoy en formato 'yyyy-MM-dd'
  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [refetchTrigger, setRefetchTrigger] = useState(0);
  
  const refetch = () => {
    setLoading(true);
    setError(null);
    setRefetchTrigger(prev => prev + 1); // Trigger re-fetch
    
    // Para usuarios invitados, también recargar desde AsyncStorage inmediatamente
    if (isGuest) {
      const loadGuestTasks = async () => {
        try {
          const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
          const storedTasks = await AsyncStorage.getItem('guestTasks');
          
          if (storedTasks) {
            const allTasks = JSON.parse(storedTasks) as Task[];
            const todayDate = getTodayDate();
            const todayTasks = allTasks.filter(task => {
              let taskDate = task.dueDate;
              if (taskDate && taskDate.includes('T')) {
                taskDate = taskDate.split('T')[0];
              }
              
              // Tareas para hoy
              const isDueToday = taskDate === todayDate;
              
              // Tareas del growing guide que vencen en los próximos 3 días
              const isGrowingGuideTask = task.category === 'growing-guide';
              const taskDateObj = new Date(taskDate || '');
              const todayDateObj = new Date(todayDate);
              const daysDiff = Math.ceil((taskDateObj.getTime() - todayDateObj.getTime()) / (1000 * 60 * 60 * 24));
              const isUpcoming = daysDiff >= 0 && daysDiff <= 3;
              
              // Tareas manuales (creadas por el usuario)
              const isManualTask = !task.week && !task.category && !task.xp;
              
              const isPending = task.completed === false;
              return isPending && ((isManualTask && isDueToday) || (isGrowingGuideTask && isUpcoming));
            });
            
            setTasks(todayTasks);
          } else {
            setTasks([]);
          }
          setLoading(false);
        } catch (error) {
          setTasks([]);
          setLoading(false);
        }
      };
      loadGuestTasks();
    }
  };

  useEffect(() => {
    if (!user && !isGuest) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const todayDate = getTodayDate();
    let unsubscribe: (() => void) | undefined;

    try {
      const tasksRef = collection(firestore, 'tasks');
      
      // Para usuarios autenticados
      if (user && !isGuest) {
        // Query simplificado sin orderBy para evitar problemas de índices
        // Para Firestore, hacemos query simple y filtramos en cliente
        const q = query(
          tasksRef,
          where('userId', '==', user.uid),
          where('completed', '==', false)
        );

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const allTasks = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            })) as Task[];
            
            // Filtrar por fecha - incluir tareas manuales Y del growing guide
            const todayTasks = allTasks.filter(task => {
              let taskDate = task.dueDate;
              if (taskDate && taskDate.includes('T')) {
                taskDate = taskDate.split('T')[0];
              }
              
              // Tareas para hoy
              const isDueToday = taskDate === todayDate;
              
              // Tareas del growing guide que vencen en los próximos 3 días
              const isGrowingGuideTask = task.category === 'growing-guide';
              const taskDateObj = new Date(taskDate || '');
              const todayDateObj = new Date(todayDate);
              const daysDiff = Math.ceil((taskDateObj.getTime() - todayDateObj.getTime()) / (1000 * 60 * 60 * 24));
              const isUpcoming = daysDiff >= 0 && daysDiff <= 3;
              
              // Tareas manuales (creadas por el usuario)
              const isManualTask = !task.week && !task.category && !task.xp;
              
              return (isManualTask && isDueToday) || (isGrowingGuideTask && isUpcoming);
            });
            
            // Ordenar en memoria 
            const sortedTasks = todayTasks.sort((a, b) => {
              const dateA = new Date(a.createdAt || 0);
              const dateB = new Date(b.createdAt || 0);
              return dateB.getTime() - dateA.getTime();
            });
            
            setTasks(sortedTasks);
            setLoading(false);
            setError(null);
          },
          (err) => {
            setError('Failed to fetch today\'s tasks');
            setLoading(false);
          }
        );
      } 
      // Para usuarios invitados - cargar de AsyncStorage
      else if (isGuest) {
        const loadGuestTasks = async () => {
          try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            const storedTasks = await AsyncStorage.getItem('guestTasks');
            
            if (storedTasks) {
              const allTasks = JSON.parse(storedTasks) as Task[];
              const todayTasks = allTasks.filter(task => {
                let taskDate = task.dueDate;
                if (taskDate && taskDate.includes('T')) {
                  taskDate = taskDate.split('T')[0];
                }
                
                // Tareas para hoy
                const isDueToday = taskDate === todayDate;
                
                // Tareas del growing guide que vencen en los próximos 3 días
                const isGrowingGuideTask = task.category === 'growing-guide';
                const taskDateObj = new Date(taskDate || '');
                const todayDateObj = new Date(todayDate);
                const daysDiff = Math.ceil((taskDateObj.getTime() - todayDateObj.getTime()) / (1000 * 60 * 60 * 24));
                const isUpcoming = daysDiff >= 0 && daysDiff <= 3;
                
                // Tareas manuales (creadas por el usuario)
                const isManualTask = !task.week && !task.category && !task.xp;
                
                const isPending = task.completed === false;
                return isPending && ((isManualTask && isDueToday) || (isGrowingGuideTask && isUpcoming));
              });
              
              setTasks(todayTasks);
            } else {
              setTasks([]);
            }
            setLoading(false);
          } catch (error) {
            setTasks([]);
            setLoading(false);
          }
        };
        loadGuestTasks();
      }
    } catch (err) {
      setError('Failed to initialize tasks listener');
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, isGuest, refetchTrigger]); // Incluir refetchTrigger para el refetch manual

  return {
    tasks,
    loading,
    error,
    refetch,
  };
}; 