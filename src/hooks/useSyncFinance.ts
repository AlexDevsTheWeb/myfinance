import dayjs from 'dayjs';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { useEffect, useRef } from 'react';
import { type UserDoc, userDocConverter } from '../lib/converters';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { useFinanceStore } from '../store/useFinanceStore';

// Default configuration for new users
const getDefaultUserConfig = (): UserDoc => {
  const today = dayjs();
  const firstDayOfMonth = today.startOf('month').format('YYYY-MM-DD');

  return {
    transactions: [],
    initialBalance: 0,
    accounts: [
      { id: 'default-main', name: 'Conto Principale', initialBalance: 0, isDefault: true }
    ],
    categories: [
      { name: 'Debiti', subcategories: ['Carte di credito', 'Prestiti studio', 'Altri prestiti', 'Imposte'] },
      { name: 'Divertimento', subcategories: ['Libri', 'Concerti', 'Partite', 'Hobby', 'Film', 'Musica', 'Attività all\'aperto', 'Fotografia', 'Sport', 'Golf', 'Teatro', 'TV'] },
      { name: 'Spese quotidiane', subcategories: ['Spesa', 'Ristoranti', 'Barbiere', 'Vestiti', 'Lavanderia', 'Tabacchi', 'Nespresso'] },
      { name: 'Regali', subcategories: ['Regali generici', 'Donazioni'] },
      { name: 'Salute', subcategories: ['Dottori/dentista/oculista', 'Cure specialistiche', 'Farmacia', 'Emergenze'] },
      { name: 'Casa', subcategories: ['Mutuo', 'Imposte immobili', 'Arredamento', 'Giardinaggio', 'Forniture', 'Manutenzione', 'Miglioramenti', 'Verisure', 'Trasloco'] },
      { name: 'Assicurazione', subcategories: ['Auto', 'Salute', 'Casa', 'Vita'] },
      { name: 'Tecnologia', subcategories: ['Domini/hosting', 'Servizi online', 'Hardware', 'Software'] },
      { name: 'Trasporti', subcategories: ['Carburante', 'Prestito auto', 'Riparazioni', 'Bollo', 'Trasporto pubblico'] },
      { name: 'Viaggi', subcategories: ['Biglietti aerei', 'Hotel', 'Alimenti', 'Trasporti', 'Divertimento'] },
      { name: 'Bollette', subcategories: ['Telefono', 'TV', 'Internet', 'Elettricità', 'Gas', 'Condominio', 'Rifiuti'] },
    ],
    incomeCategories: [
      { name: 'Salario', subcategories: ['Busta paga', 'Mance', 'Bonus', 'Commissioni', '13-esima', '14-esima'] },
      { name: 'Altro', subcategories: ['Risparmi', 'Interessi', 'Dividendi', 'Regali', 'Rimborsi', 'Rimborso 730'] },
    ],
    recurringTransactions: [],
    carMileage: [],
    carInitialMileage: 0,
    tireSettings: { summerModel: '', winterModel: '', initialTireType: 'summer' },
    tireChanges: [],
    enabledModules: {
      financeTracker: true,
      carManagement: false,
    },
    balanceStartDate: firstDayOfMonth,
  };
};

export const useSyncFinance = () => {
  const { user } = useAuthStore();
  const {
    transactions,
    accounts,
    categories,
    incomeCategories,
    recurringTransactions,
    carMileage,
    carInitialMileage,
    tireSettings,
    tireChanges,
    balanceStartDate,
    initialBalance,
    enabledModules,
    setTransactions, // Keep for materialize effect
    setAll,
  } = useFinanceStore();

  const isInitializing = useRef(false);

  // Load data from Firestore on user change and initialize new users
  useEffect(() => {
    if (!user) {
      isInitializing.current = false;
      return;
    }

    if (isInitializing.current) return;

    const docRef = doc(db, 'users', user.uid).withConverter(userDocConverter);

    const initializeUser = async () => {
      isInitializing.current = true;
      try {
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          console.log('SyncFinance: New user detected, initializing...');
          const defaultConfig = getDefaultUserConfig();
          await setDoc(docRef, defaultConfig);
          setAll(defaultConfig);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        isInitializing.current = false;
      }
    };

    initializeUser();

    const unsub = onSnapshot(docRef, (doc) => {
      if (doc.metadata.hasPendingWrites) {
        console.log('SyncFinance: Ignoring local write');
        return;
      }
      if (doc.exists() && !isInitializing.current) {
        const data = doc.data();
        setAll(data);
      }
    });

    return () => unsub();
  }, [user, setAll]);
};
