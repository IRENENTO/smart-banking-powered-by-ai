import { TranslationKey } from './translations';

export function categoryKey(category: string): TranslationKey {
  switch (category) {
    case 'All':
      return 'category.all';
    case 'Food':
      return 'category.food';
    case 'Transport':
      return 'category.transport';
    case 'Bills':
      return 'category.bills';
    case 'Mobile Money':
      return 'category.mobileMoney';
    default:
      return 'category.all';
  }
}

export function statusKey(status: string): TranslationKey {
  switch (status) {
    case 'Completed':
      return 'status.completed';
    case 'Pending':
      return 'status.pending';
    default:
      return 'status.completed';
  }
}

export function txDescriptionKey(desc: string): TranslationKey | null {
  // Known mock data strings. Extend as your backend adds more.
  switch (desc) {
    case 'Transport payment':
      return 'category.transport';
    case 'Grocery market':
      return 'category.food';
    case 'Utility bill':
      return 'category.bills';
    case 'Mobile money cashout':
      return 'category.mobileMoney';
    case 'Coffee shop':
      return 'category.food';
    default:
      return null;
  }
}

