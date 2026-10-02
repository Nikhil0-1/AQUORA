const fs = require('fs');
const file = './services/backend/src/db/memory-db.ts';
let content = fs.readFileSync(file, 'utf8');

const newCategories = `[
      { id: 'c1111111-1111-1111-1111-111111111111', name: 'Everyday', slug: 'everyday', display_order: 1, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'c2222222-2222-2222-2222-222222222222', name: 'Aloe Vera', slug: 'aloe-vera', display_order: 2, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'c3333333-3333-3333-3333-333333333333', name: 'Herbal', slug: 'herbal', display_order: 3, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'c4444444-4444-4444-4444-444444444444', name: 'Premium', slug: 'premium', display_order: 4, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'c5555555-5555-5555-5555-555555555555', name: 'Family', slug: 'family', display_order: 5, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ]`;

const newProducts = `[
      {
        id: 'p1111111-1111-1111-1111-111111111111',
        name: 'AQUORA Hand Sanitizer', slug: 'aquora-hand-sanitizer',
        description: 'Standard everyday hand sanitizer for quick and effective 99.9% germ protection.', short_description: 'Standard 99.9% germ protection.',
        category_id: 'c1111111-1111-1111-1111-111111111111', category_name: 'Everyday', price: 40, currency: 'INR', image_url: 'https://images.unsplash.com/photo-1584483766114-2caea62f143c?auto=format&fit=crop&w=800&q=80', volume_ml: 100,
        ingredients: ['70% Isopropyl Alcohol', 'Purified Water'], nutrition: { calories: 0, sugar_g: 0, vitamin_c_mg: 0, carbs_g: 0, fat_g: 0, protein_g: 0 },
        is_available: true, is_featured: true, channel_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      },
      {
        id: 'p2222222-2222-2222-2222-222222222222',
        name: 'AQUORA Aloe Vera Sanitizer', slug: 'aquora-aloe-vera',
        description: 'Enriched with Aloe Vera extracts to keep your hands soft and moisturized while killing germs.', short_description: 'Moisturizing with Aloe Vera.',
        category_id: 'c2222222-2222-2222-2222-222222222222', category_name: 'Aloe Vera', price: 50, currency: 'INR', image_url: 'https://images.unsplash.com/photo-1596755490130-10901e1ed9a2?auto=format&fit=crop&w=800&q=80', volume_ml: 100,
        ingredients: ['70% Isopropyl Alcohol', 'Aloe Vera Extract'], nutrition: { calories: 0, sugar_g: 0, vitamin_c_mg: 0, carbs_g: 0, fat_g: 0, protein_g: 0 },
        is_available: true, is_featured: true, channel_id: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      },
      {
        id: 'p3333333-3333-3333-3333-333333333333',
        name: 'AQUORA Herbal Sanitizer', slug: 'aquora-herbal',
        description: 'Infused with Neem and Tulsi for natural antibacterial properties alongside alcohol.', short_description: 'Natural Neem & Tulsi blend.',
        category_id: 'c3333333-3333-3333-3333-333333333333', category_name: 'Herbal', price: 60, currency: 'INR', image_url: 'https://images.unsplash.com/photo-1605330839818-e3a1f4961be4?auto=format&fit=crop&w=800&q=80', volume_ml: 100,
        ingredients: ['70% Isopropyl Alcohol', 'Neem Extract', 'Tulsi Extract'], nutrition: { calories: 0, sugar_g: 0, vitamin_c_mg: 0, carbs_g: 0, fat_g: 0, protein_g: 0 },
        is_available: true, is_featured: true, channel_id: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      },
      {
        id: 'p4444444-4444-4444-4444-444444444444',
        name: 'AQUORA Premium Sanitizer', slug: 'aquora-premium',
        description: 'Luxurious feel with essential oils and a pleasant long-lasting fragrance.', short_description: 'Luxury feel with essential oils.',
        category_id: 'c4444444-4444-4444-4444-444444444444', category_name: 'Premium', price: 70, currency: 'INR', image_url: 'https://images.unsplash.com/photo-1584483766114-2caea62f143c?auto=format&fit=crop&w=800&q=80', volume_ml: 100,
        ingredients: ['75% Ethyl Alcohol', 'Essential Oils', 'Fragrance'], nutrition: { calories: 0, sugar_g: 0, vitamin_c_mg: 0, carbs_g: 0, fat_g: 0, protein_g: 0 },
        is_available: true, is_featured: true, channel_id: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      },
      {
        id: 'p5555555-5555-5555-5555-555555555555',
        name: 'AQUORA Family Sanitizer', slug: 'aquora-family',
        description: 'Large volume sanitizer perfect for family dispensing, offering great value and complete protection.', short_description: 'Value size 250ml for the whole family.',
        category_id: 'c5555555-5555-5555-5555-555555555555', category_name: 'Family', price: 90, currency: 'INR', image_url: 'https://images.unsplash.com/photo-1629731697330-8041c2c366ff?auto=format&fit=crop&w=800&q=80', volume_ml: 250,
        ingredients: ['70% Isopropyl Alcohol', 'Water', 'Glycerin'], nutrition: { calories: 0, sugar_g: 0, vitamin_c_mg: 0, carbs_g: 0, fat_g: 0, protein_g: 0 },
        is_available: true, is_featured: true, channel_id: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }
    ]`;

// We use regex to replace the arrays entirely
content = content.replace(/this\.categories = \[[\s\S]*?\];/m, `this.categories = ${newCategories};`);
content = content.replace(/this\.products = \[[\s\S]*?\];/m, `this.products = ${newProducts};`);
content = content.replace(/VM-001/g, 'AQ-VM-001');
content = content.replace(/VM-002/g, 'AQ-VM-002');
fs.writeFileSync(file, content);
console.log('Done modifying memory-db.ts');
