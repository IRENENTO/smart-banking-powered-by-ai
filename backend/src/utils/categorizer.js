const CATEGORY_KEYWORDS = [
  { category: 'food_dining', keywords: ['grocery', 'groceries', 'restaurant', 'dinner', 'lunch', 'breakfast', 'meal', 'food', 'nakumatt', 'shoprite', 'cafe', 'pizza', 'sushi', 'supermarket'] },
  { category: 'transport_fuel', keywords: ['bus', 'taxi', 'fuel', 'gas', 'petrol', 'diesel', 'transport', 'fare', 'motorbike', 'shell', 'station', 'uber', 'lyft', 'ride'] },
  { category: 'housing_rent', keywords: ['rent', 'housing', 'apartment', 'mortgage', 'lease', 'property', 'maintenance fee'] },
  { category: 'utilities_bills', keywords: ['electricity', 'water', 'internet', 'utility', 'bill', 'power', 'gas bill', 'sewage', 'trash', 'waste'] },
  { category: 'healthcare', keywords: ['pharmacy', 'clinic', 'hospital', 'doctor', 'medical', 'health', 'prescription', 'dentist', 'optician', 'medicine', 'lab test'] },
  { category: 'education', keywords: ['tuition', 'school', 'course', 'class', 'training', 'education', 'online course', 'seminar', 'workshop', 'books', 'university'] },
  { category: 'entertainment_leisure', keywords: ['cinema', 'concert', 'movie', 'ticket', 'entertainment', 'game', 'sport', 'festival', 'show', 'theatre', 'museum', 'park'] },
  { category: 'shopping_retail', keywords: ['clothing', 'electronics', 'accessory', 'store', 'shop', 'retail', 'mall', 'online shopping', 'amazon', 'fashion', 'shoe'] },
  { category: 'mobile_communication', keywords: ['airtime', 'data bundle', 'mobile', 'phone', 'sim', 'top-up', 'recharge', 'mtn', 'airtel', 'tigo', 'vodacom'] },
  { category: 'insurance', keywords: ['insurance', 'premium', 'policy', 'coverage', 'health insurance', 'car insurance', 'life insurance'] },
  { category: 'savings_investments', keywords: ['savings', 'deposit', 'investment', 'stock', 'bond', 'mutual fund', 'contribution', 'retirement', 'pension', 'fixed deposit'] },
];

function categorizeByDescription(description) {
  if (!description) return 'other';
  const desc = description.toLowerCase();
  for (const entry of CATEGORY_KEYWORDS) {
    for (const keyword of entry.keywords) {
      if (desc.includes(keyword)) {
        return entry.category;
      }
    }
  }
  return 'other';
}

module.exports = { categorizeByDescription, CATEGORY_KEYWORDS };
