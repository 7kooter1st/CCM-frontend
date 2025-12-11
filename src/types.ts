export interface UseCase {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  energyConsumption: number; // in mA
}

export interface ConsumptionItem extends UseCase {
  minutes: number;
}
