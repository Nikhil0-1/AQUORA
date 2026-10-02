const fs = require('fs');
const file = './services/backend/src/db/memory-db.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace the products array entirely to include variants and updated prices
const newProducts = `[
      {
        id: 'p1111111-1111-1111-1111-111111111111',
        name: 'AQUORA Hand Sanitizer', slug: 'aquora-hand-sanitizer',
        description: 'Standard everyday hand sanitizer for quick and effective 99.9% germ protection.', short_description: 'Standard 99.9% germ protection.',
        category_id: 'c1111111-1111-1111-1111-111111111111', category_name: 'Everyday', price: 40, currency: 'INR', image_url: 'https://images.unsplash.com/photo-1584483766114-2caea62f143c?auto=format&fit=crop&w=800&q=80', volume_ml: 50,
        variants: [
          { id: 'v11', product_id: 'p1111111-1111-1111-1111-111111111111', volume_ml: 50, price: 40, channel_id: 1, is_available: true },
          { id: 'v12', product_id: 'p1111111-1111-1111-1111-111111111111', volume_ml: 100, price: 70, channel_id: 1, is_available: true }
        ],
        ingredients: ['70% Isopropyl Alcohol', 'Purified Water'], nutrition: { calories: 0, sugar_g: 0, vitamin_c_mg: 0, carbs_g: 0, fat_g: 0, protein_g: 0 },
        is_available: true, is_featured: true, channel_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      },
      {
        id: 'p2222222-2222-2222-2222-222222222222',
        name: 'AQUORA Aloe Vera Sanitizer', slug: 'aquora-aloe-vera',
        description: 'Enriched with Aloe Vera extracts to keep your hands soft and moisturized while killing germs.', short_description: 'Moisturizing with Aloe Vera.',
        category_id: 'c2222222-2222-2222-2222-222222222222', category_name: 'Aloe Vera', price: 60, currency: 'INR', image_url: 'https://images.unsplash.com/photo-1596755490130-10901e1ed9a2?auto=format&fit=crop&w=800&q=80', volume_ml: 100,
        variants: [
          { id: 'v21', product_id: 'p2222222-2222-2222-2222-222222222222', volume_ml: 50, price: 35, channel_id: 2, is_available: true },
          { id: 'v22', product_id: 'p2222222-2222-2222-2222-222222222222', volume_ml: 100, price: 60, channel_id: 2, is_available: true },
          { id: 'v23', product_id: 'p2222222-2222-2222-2222-222222222222', volume_ml: 150, price: 80, channel_id: 2, is_available: true },
          { id: 'v24', product_id: 'p2222222-2222-2222-2222-222222222222', volume_ml: 250, price: 120, channel_id: 2, is_available: true }
        ],
        ingredients: ['70% Isopropyl Alcohol', 'Aloe Vera Extract'], nutrition: { calories: 0, sugar_g: 0, vitamin_c_mg: 0, carbs_g: 0, fat_g: 0, protein_g: 0 },
        is_available: true, is_featured: true, channel_id: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      },
      {
        id: 'p3333333-3333-3333-3333-333333333333',
        name: 'AQUORA Herbal Sanitizer', slug: 'aquora-herbal',
        description: 'Infused with Neem and Tulsi for natural antibacterial properties alongside alcohol.', short_description: 'Natural Neem & Tulsi blend.',
        category_id: 'c3333333-3333-3333-3333-333333333333', category_name: 'Herbal', price: 70, currency: 'INR', image_url: 'https://images.unsplash.com/photo-1605330839818-e3a1f4961be4?auto=format&fit=crop&w=800&q=80', volume_ml: 100,
        variants: [
          { id: 'v31', product_id: 'p3333333-3333-3333-3333-333333333333', volume_ml: 100, price: 70, channel_id: 3, is_available: true }
        ],
        ingredients: ['70% Isopropyl Alcohol', 'Neem Extract', 'Tulsi Extract'], nutrition: { calories: 0, sugar_g: 0, vitamin_c_mg: 0, carbs_g: 0, fat_g: 0, protein_g: 0 },
        is_available: true, is_featured: true, channel_id: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      },
      {
        id: 'p4444444-4444-4444-4444-444444444444',
        name: 'AQUORA Premium Sanitizer', slug: 'aquora-premium',
        description: 'Luxurious feel with essential oils and a pleasant long-lasting fragrance.', short_description: 'Luxury feel with essential oils.',
        category_id: 'c4444444-4444-4444-4444-444444444444', category_name: 'Premium', price: 90, currency: 'INR', image_url: 'https://images.unsplash.com/photo-1584483766114-2caea62f143c?auto=format&fit=crop&w=800&q=80', volume_ml: 150,
        variants: [
          { id: 'v41', product_id: 'p4444444-4444-4444-4444-444444444444', volume_ml: 150, price: 90, channel_id: 4, is_available: true }
        ],
        ingredients: ['75% Ethyl Alcohol', 'Essential Oils', 'Fragrance'], nutrition: { calories: 0, sugar_g: 0, vitamin_c_mg: 0, carbs_g: 0, fat_g: 0, protein_g: 0 },
        is_available: true, is_featured: true, channel_id: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      },
      {
        id: 'p5555555-5555-5555-5555-555555555555',
        name: 'AQUORA Family Sanitizer', slug: 'aquora-family',
        description: 'Large volume sanitizer perfect for family dispensing, offering great value and complete protection.', short_description: 'Value size 250ml for the whole family.',
        category_id: 'c5555555-5555-5555-5555-555555555555', category_name: 'Family', price: 150, currency: 'INR', image_url: 'https://images.unsplash.com/photo-1629731697330-8041c2c366ff?auto=format&fit=crop&w=800&q=80', volume_ml: 250,
        variants: [
          { id: 'v51', product_id: 'p5555555-5555-5555-5555-555555555555', volume_ml: 250, price: 150, channel_id: 5, is_available: true },
          { id: 'v52', product_id: 'p5555555-5555-5555-5555-555555555555', volume_ml: 500, price: 280, channel_id: 5, is_available: true }
        ],
        ingredients: ['70% Isopropyl Alcohol', 'Water', 'Glycerin'], nutrition: { calories: 0, sugar_g: 0, vitamin_c_mg: 0, carbs_g: 0, fat_g: 0, protein_g: 0 },
        is_available: true, is_featured: true, channel_id: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }
    ]`;

content = content.replace(/this\.products = \[[\s\S]*?\];/m, `this.products = ${newProducts};`);

// Replace QRToken array and imports
content = content.replace(/private qrTokens: QRToken\[\] = \[\];/g, `private dispenseJobs: DispenseJob[] = [];`);
content = content.replace(/QRToken/g, 'DispenseJob');
content = content.replace(/QRTokenStatus/g, 'DispenseJobStatus');

// Fix the array references in the methods
content = content.replace(/this\.qrTokens/g, 'this.dispenseJobs');
content = content.replace(/createQRToken/g, 'createDispenseJob');
content = content.replace(/getQRTokenByString/g, 'getDispenseJobById');
content = content.replace(/getQRTokenByOrderId/g, 'getDispenseJobByOrderId');
content = content.replace(/updateQRTokenStatus/g, 'updateDispenseJobStatus');

// Method bodies need small tweaks:
// getDispenseJobById was searching for `token`. We change it to `id`.
content = content.replace(/\(tok\) => tok\.token === tokenString/g, `(tok) => tok.id === tokenString`);

// updateDispenseJobStatus replaced `redeemedAt` logic
content = content.replace(/redeemed_at/g, 'completed_at');
content = content.replace(/redeemedAt/g, 'completedAt');

fs.writeFileSync(file, content, 'utf8');
console.log('Done update_db.js');
