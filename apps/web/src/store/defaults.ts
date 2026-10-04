import type { IAccount, IBrokerConfig, ICategory, IAppModules, ITireSettings, BrokerAccount, BudgetTarget } from './types';

export const DEFAULT_ACCOUNT: IAccount = {
  id: 'default-main',
  name: 'Conto Principale',
  initialBalance: 0,
  isDefault: true,
};

export const DEFAULT_ACCOUNTS: IAccount[] = [DEFAULT_ACCOUNT];

export const DEFAULT_CATEGORIES: ICategory[] = [
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
];

export const DEFAULT_INCOME_CATEGORIES: ICategory[] = [
  { name: 'Salario', subcategories: ['Busta paga', 'Mance', 'Bonus', 'Commissioni', '13-esima', '14-esima'] },
  { name: 'Altro', subcategories: ['Risparmi', 'Interessi', 'Dividendi', 'Regali', 'Rimborsi', 'Rimborso 730'] },
  { name: 'Extraordinary Income', subcategories: ['Bonus', 'Rimborsi', 'Vendite', 'Altro'] },
];

export const DEFAULT_TIRE_SETTINGS: ITireSettings = {
  summerModel: '',
  winterModel: '',
  initialTireType: 'summer',
};

export const DEFAULT_ENABLED_MODULES: IAppModules = {
  financeTracker: true,
  carManagement: false,
  utilityTracker: false,
  investmentTracking: false,
  budgetTracking: false,
};

export const DEFAULT_BUDGET_TARGETS: BudgetTarget[] = [];

export const DEFAULT_BALANCE_START_DATE = '2026-01-01';

export const DEFAULT_LANGUAGE = 'it';

export const DEFAULT_INITIAL_BALANCE = 0;

export const DEFAULT_CAR_INITIAL_MILEAGE = 0;

export const DEFAULT_BROKER_ACCOUNTS: BrokerAccount[] = [
  { id: 'broker-1', name: 'Trade Republic', ticker: 'EUNL', baseLumpSum: 0, monthlyPacAmount: 0, interestRate: 0 },
];

export const DEFAULT_CARDS = [];

export const DEFAULT_BROKER_CONFIG: IBrokerConfig = {
  brokerName: 'Trade Republic',
  lumpSumAmount: 0,
  monthlyPacAmount: 0,
  ticker: 'EUNL',
  interestRate: 0,
};