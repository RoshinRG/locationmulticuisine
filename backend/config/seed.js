require('dotenv').config({ path: './.env' });
const { sequelize, connectDB } = require('./database');
const { User, MenuItem } = require('../models');

const menuItems = [
  // SOUTH INDIAN / KERALA SPECIALS
  { name: 'Muzuman Kozhi Sizzler', category: 'south-indian', price: 450, description: 'Whole chicken marinated in Kerala spices and served sizzling', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Chicken Chettinad', category: 'south-indian', price: 210, description: 'Spicy and aromatic chicken curry from the Chettinad region', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Kannur Beef', category: 'south-indian', price: 190, description: 'Traditional Kannur style beef roast with coconut slivers', rating: 4.6, isAvailable: true, image: 'images/hero.png' },
  { name: 'Beef Coconut Fry', category: 'south-indian', price: 180, description: 'Tender beef pieces fried with plenty of coconut and spices', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Beef Dry Fry', category: 'south-indian', price: 190, description: 'Classic Kerala style BDF - crispy and spicy', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Beef Mappas', category: 'south-indian', price: 200, description: 'Creamy beef curry cooked in coconut milk', rating: 4.5, isAvailable: true, image: 'images/hero.png' },
  { name: 'Beef Kondattom', category: 'south-indian', price: 190, description: 'Spicy sun-dried and fried beef preparation', rating: 4.6, isAvailable: true, image: 'images/hero.png' },
  { name: 'Beef Idichath', category: 'south-indian', price: 190, description: 'Shredded and pounded beef roast with spices', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Beef Nadan Curry', category: 'south-indian', price: 180, description: 'Authentic Kerala style beef gravy', rating: 4.5, isAvailable: true, image: 'images/hero.png' },
  { name: 'Thalassery Chicken Fry (Full)', category: 'south-indian', price: 450, description: 'Thalassery special deep fried chicken', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Thalassery Chicken Fry (Half)', category: 'south-indian', price: 220, description: 'Thalassery special deep fried chicken', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Mutton Chaaps', category: 'south-indian', price: 270, description: 'Succulent mutton chops in a thick spicy gravy', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Mutton Mappas', category: 'south-indian', price: 280, description: 'Mutton cooked in rich coconut milk gravy', rating: 4.6, isAvailable: true, image: 'images/hero.png' },
  { name: 'Mutton Chettinadu', category: 'south-indian', price: 280, description: 'Classic spicy Tamil style mutton curry', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Mutton Kurumulakaracha Curry', category: 'south-indian', price: 280, description: 'Mutton curry with freshly crushed black pepper', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Mutton Malliperalan', category: 'south-indian', price: 280, description: 'Traditional mutton roast with coriander and spices', rating: 4.6, isAvailable: true, image: 'images/hero.png' },
  { name: 'Mutton Pepper Fry', category: 'south-indian', price: 310, description: 'Dry mutton preparation with heavy black pepper seasoning', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Mutton Dry Fry', category: 'south-indian', price: 350, description: 'Crispy and spicy fried mutton pieces', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Mutton Kondattam', category: 'south-indian', price: 310, description: 'Spicy Kerala style dried and fried mutton', rating: 4.6, isAvailable: true, image: 'images/hero.png' },

  // SEAFOOD
  { name: 'Fish Pollichath', category: 'seafood', price: 350, description: 'Fish marinated in spices, wrapped in banana leaf and grilled', rating: 4.9, isAvailable: true, image: 'images/hero.png' },
  { name: 'Fish Tawa Fry', category: 'seafood', price: 280, description: 'Fresh fish slice marinated and tawa fried', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Fish Masala', category: 'seafood', price: 300, description: 'Fish cooked in a spicy tomato-onion gravy', rating: 4.6, isAvailable: true, image: 'images/hero.png' },
  { name: 'Prawns Dry Fry', category: 'seafood', price: 320, description: 'Spicy fried prawns with Kerala masalas', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Prawns Masala', category: 'seafood', price: 340, description: 'Prawns cooked in a rich and spicy thick gravy', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Fish Chatti Curry', category: 'seafood', price: 310, description: 'Traditional fish curry cooked in an earthen pot', rating: 4.8, isAvailable: true, image: 'images/hero.png' },

  // KIZHI AND DUM
  { name: 'Dum Paratha Beef', category: 'south-indian', price: 240, description: 'Layered paratha with beef roast, slow cooked in steam', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Chicken Kizhi', category: 'south-indian', price: 200, description: 'Chicken roast wrapped in banana leaf and steamed', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Beef Kizhi', category: 'south-indian', price: 230, description: 'Beef roast wrapped in banana leaf and steamed', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Chemmeen Pollichathu', category: 'seafood', price: 380, description: 'Prawns marinated and grilled in banana leaf', rating: 4.9, isAvailable: true, image: 'images/hero.png' },

  // NORTH INDIAN
  { name: 'Butter Chicken', category: 'north-indian', price: 230, description: 'Creamy tomato-based curry with tender chicken pieces', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Chicken Tikka Masala', category: 'north-indian', price: 240, description: 'Grilled chicken chunks in a spicy and creamy gravy', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Afghani Chicken', category: 'north-indian', price: 250, description: 'Chicken cooked in a mild, creamy and nutty gravy', rating: 4.6, isAvailable: true, image: 'images/hero.png' },
  { name: 'Chicken Kadai', category: 'north-indian', price: 240, description: 'Chicken cooked with bell peppers and freshly ground spices', rating: 4.5, isAvailable: true, image: 'images/hero.png' },
  { name: 'Mutton Rogan Josh', category: 'north-indian', price: 290, description: 'Classic Kashmiri mutton curry with aromatic spices', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Mutton Kadai', category: 'north-indian', price: 310, description: 'Mutton cooked in a traditional kadai with spices', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Chicken Kolhapuri', category: 'north-indian', price: 220, description: 'Extra spicy chicken curry from the Kolhapur region', rating: 4.4, isAvailable: true, image: 'images/hero.png' },
  { name: 'Veg Kolhapuri', category: 'veg', price: 160, description: 'Spicy mixed vegetable curry', rating: 4.3, isAvailable: true, image: 'images/hero.png' },
  { name: 'Methi Chicken', category: 'north-indian', price: 240, description: 'Chicken cooked with fresh fenugreek leaves', rating: 4.5, isAvailable: true, image: 'images/hero.png' },
  { name: 'Aacharya Chicken', category: 'north-indian', price: 230, description: 'Chicken cooked with pickling spices for a tangy flavor', rating: 4.4, isAvailable: true, image: 'images/hero.png' },
  { name: 'Chicken Handi', category: 'north-indian', price: 230, description: 'Chicken cooked in a traditional clay pot', rating: 4.6, isAvailable: true, image: 'images/hero.png' },
  { name: 'Mutton Handi', category: 'north-indian', price: 290, description: 'Mutton cooked in a traditional clay pot', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Mutton Palak Gosh', category: 'north-indian', price: 310, description: 'Mutton cooked with fresh spinach puree', rating: 4.6, isAvailable: true, image: 'images/hero.png' },
  { name: 'Mutton Lal Maas', category: 'north-indian', price: 310, description: 'Spicy Rajasthani mutton curry with red chillies', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Location Special Chicken (Indian Style)', category: 'north-indian', price: 240, description: 'Our chef special North Indian style chicken', rating: 4.9, isAvailable: true, image: 'images/hero.png' },
  { name: 'Gun Fish Curry', category: 'north-indian', price: 300, description: 'Aromatic and spicy fish curry', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Vaby (Semi-Dry)', category: 'north-indian', price: 480, description: 'Exotic semi-dry meat preparation', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Lahsuni Dal Tadka', category: 'veg', price: 180, description: 'Yellow lentils tempered with plenty of garlic and spices', rating: 4.6, isAvailable: true, image: 'images/hero.png' },

  // MANDI
  { name: 'Chicken Mandi (Full)', category: 'mandi', price: 820, description: 'Traditional Arabic rice dish with whole grilled chicken', rating: 4.9, isAvailable: true, image: 'images/hero.png' },
  { name: 'Chicken Mandi (Half)', category: 'mandi', price: 430, description: 'Traditional Arabic rice dish with half grilled chicken', rating: 4.9, isAvailable: true, image: 'images/hero.png' },
  { name: 'Haneedh Mandi (Full)', category: 'mandi', price: 1550, description: 'Exotic slow-roasted mutton served with Mandi rice', rating: 5.0, isAvailable: true, image: 'images/hero.png' },
  { name: 'Haneedh Mandi (Half)', category: 'mandi', price: 840, description: 'Exotic slow-roasted mutton served with Mandi rice', rating: 5.0, isAvailable: true, image: 'images/hero.png' },

  // CHINESE
  { name: 'Chicken Lollipop', category: 'chinese', price: 200, description: 'Classic fried chicken wings served with schezwan sauce', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Chilly Chicken', category: 'chinese', price: 260, description: 'Diced chicken tossed with peppers and chillies', rating: 4.6, isAvailable: true, image: 'images/hero.png' },
  { name: 'Chilly Fish', category: 'chinese', price: 170, description: 'Fish pieces tossed in spicy chilly sauce', rating: 4.5, isAvailable: true, image: 'images/hero.png' },
  { name: 'Chilly Gopi', category: 'chinese', price: 210, description: 'Crispy cauliflower tossed in chilly sauce', rating: 4.4, isAvailable: true, image: 'images/hero.png' },
  { name: 'Chicken Manchurian', category: 'chinese', price: 260, description: 'Fried chicken balls in a tangy manchurian sauce', rating: 4.5, isAvailable: true, image: 'images/hero.png' },
  { name: 'Fish Manchurian', category: 'chinese', price: 170, description: 'Fish pieces in manchurian gravy', rating: 4.4, isAvailable: true, image: 'images/hero.png' },
  { name: 'Gobi Manchurian', category: 'chinese', price: 200, description: 'Classic cauliflower manchurian', rating: 4.3, isAvailable: true, image: 'images/hero.png' },
  { name: 'Ginger Garlic Chicken', category: 'chinese', price: 260, description: 'Chicken tossed with plenty of ginger and garlic', rating: 4.5, isAvailable: true, image: 'images/hero.png' },
  { name: 'Ginger Garlic Fish', category: 'chinese', price: 260, description: 'Fish tossed with ginger and garlic', rating: 4.4, isAvailable: true, image: 'images/hero.png' },
  { name: 'Dragon Chicken', category: 'chinese', price: 270, description: 'Spicy and crunchy chicken tossed with nuts', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Dragon Fish', category: 'chinese', price: 220, description: 'Spicy fish preparation with a crunch', rating: 4.5, isAvailable: true, image: 'images/hero.png' },
  { name: 'Lemon Chicken', category: 'chinese', price: 260, description: 'Tender chicken in a zesty lemon sauce', rating: 4.6, isAvailable: true, image: 'images/hero.png' },
  { name: 'Chilly Prawn', category: 'chinese', price: 270, description: 'Prawns tossed in spicy chilly sauce', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Crispy Fried Chicken (BL)', category: 'chinese', price: 220, description: 'Boneless crispy fried chicken strips', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Schezwan Chicken', category: 'chinese', price: 270, description: 'Chicken in extra spicy schezwan sauce', rating: 4.6, isAvailable: true, image: 'images/hero.png' },
  { name: 'Schezwan Fish', category: 'chinese', price: 310, description: 'Fish in spicy schezwan sauce', rating: 4.5, isAvailable: true, image: 'images/hero.png' },
  { name: 'Prawns Tempura', category: 'chinese', price: 290, description: 'Light and crispy Japanese style fried prawns', rating: 4.9, isAvailable: true, image: 'images/hero.png' },
  { name: 'Fish and Chips', category: 'chinese', price: 170, description: 'Classic breaded fish served with fries', rating: 4.4, isAvailable: true, image: 'images/hero.png' },
  { name: 'Chicken Fried Rice', category: 'chinese', price: 170, description: 'Aromatic rice tossed with chicken and veggies', rating: 4.5, isAvailable: true, image: 'images/hero.png' },
  { name: 'Chicken Noodles', category: 'chinese', price: 180, description: 'Stir-fried noodles with chicken', rating: 4.6, isAvailable: true, image: 'images/hero.png' },

  // BROASTED CHICKEN
  { name: 'Broasted Chicken (8 Pc)', category: 'broasted', price: 660, description: 'Full 8 Pc Chicken + Khubboos + French Fries', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Broasted Chicken (4 Pc)', category: 'broasted', price: 350, description: 'Half 4 Pc Chicken + Khubboos + French Fries', rating: 4.7, isAvailable: true, image: 'images/hero.png' },

  // GRILL AND ARABIC
  { name: 'Special Alfahm (Full)', category: 'grills', price: 430, description: 'Traditional charcoal grilled chicken with special marinade', rating: 4.9, isAvailable: true, image: 'images/hero.png' },
  { name: 'Special Alfahm (Half)', category: 'grills', price: 250, description: 'Traditional charcoal grilled chicken with special marinade', rating: 4.9, isAvailable: true, image: 'images/hero.png' },
  { name: 'Peri Peri Charcoal Chicken (Full)', category: 'grills', price: 450, description: 'Extra spicy peri peri marinated grilled chicken', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Peri Peri Charcoal Chicken (Half)', category: 'grills', price: 260, description: 'Extra spicy peri peri marinated grilled chicken', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Green Pepper Alfahm (Full)', category: 'grills', price: 440, description: 'Chicken grilled with fresh green pepper marinade', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Green Pepper Alfahm (Half)', category: 'grills', price: 250, description: 'Chicken grilled with fresh green pepper marinade', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Tandoori Chicken (Full)', category: 'grills', price: 420, description: 'Classic Indian tandoor grilled chicken', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Tandoori Chicken (Half)', category: 'grills', price: 250, description: 'Classic Indian tandoor grilled chicken', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Chicken Shawaya (Full)', category: 'grills', price: 380, description: 'Arabic style machine grilled chicken', rating: 4.6, isAvailable: true, image: 'images/hero.png' },
  { name: 'Chicken Shawaya (Half)', category: 'grills', price: 210, description: 'Arabic style machine grilled chicken', rating: 4.6, isAvailable: true, image: 'images/hero.png' },
  { name: 'Malai Kabab', category: 'grills', price: 230, description: 'Creamy and mild chicken kebabs', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Rashmi Kebab', category: 'grills', price: 220, description: 'Silky smooth chicken kebabs', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Garlic Kebab', category: 'grills', price: 230, description: 'Chicken kebabs with strong garlic flavor', rating: 4.6, isAvailable: true, image: 'images/hero.png' },
  { name: 'Chicken Sheek Kebab', category: 'grills', price: 240, description: 'Minced chicken skewers grilled in tandoor', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Beef Sheek Kebab', category: 'grills', price: 270, description: 'Minced beef skewers grilled to perfection', rating: 4.8, isAvailable: true, image: 'images/hero.png' },

  // BIRIYANI AND RICE
  { name: 'Thalassery Chicken Biriyani', category: 'biryani', price: 160, description: 'Authentic Thalassery style chicken biryani', rating: 4.9, isAvailable: true, image: 'images/hero.png' },
  { name: 'Thalassery Mutton Biriyani', category: 'biryani', price: 260, description: 'Authentic Thalassery style mutton biryani', rating: 4.9, isAvailable: true, image: 'images/hero.png' },
  { name: 'Pothi Chicken Biriyani', category: 'biryani', price: 170, description: 'Chicken biryani wrapped in banana leaf for extra flavor', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Ghee Rice', category: 'biryani', price: 90, description: 'Fragrant rice cooked with pure ghee and aromatic spices', rating: 4.7, isAvailable: true, image: 'images/hero.png' },

  // VEG ITEMS
  { name: 'Pulav Mix Veg', category: 'veg', price: 150, description: 'Mildly spiced rice with mixed vegetables', rating: 4.4, isAvailable: true, image: 'images/hero.png' },
  { name: 'Paneer Tikka', category: 'grills', price: 180, description: 'Grilled cottage cheese cubes with spices', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Dal Fry', category: 'veg', price: 120, description: 'Classic yellow lentils fried with spices', rating: 4.5, isAvailable: true, image: 'images/hero.png' },
  { name: 'Palak Paneer', category: 'veg', price: 180, description: 'Cottage cheese in a creamy spinach gravy', rating: 4.6, isAvailable: true, image: 'images/hero.png' },
  { name: 'Paneer Butter Masala', category: 'veg', price: 170, description: 'Cottage cheese in a rich tomato and butter gravy', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Mushroom Masala', category: 'veg', price: 170, description: 'Fresh mushrooms in a spicy onion-tomato gravy', rating: 4.5, isAvailable: true, image: 'images/hero.png' },

  // DESSERTS & SHAKES
  { name: 'Royal Falooda', category: 'desserts', price: 160, description: 'Rich dessert with vermicelli, basil seeds, ice cream and fruits', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Mango Falooda', category: 'desserts', price: 160, description: 'Falooda with fresh mango flavor and ice cream', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Kannur Cocktail', category: 'drinks', price: 130, description: 'Famous mixed fruit and milk shake from Kannur', rating: 4.9, isAvailable: true, image: 'images/hero.png' },
  { name: 'Arabian Night', category: 'drinks', price: 130, description: 'Exotic shake with dates and nuts', rating: 4.8, isAvailable: true, image: 'images/hero.png' },
  { name: 'Virgin Mojito', category: 'drinks', price: 110, description: 'Refreshing lime and mint cooler', rating: 4.7, isAvailable: true, image: 'images/hero.png' },
  { name: 'Ferraro Rocher Shake', category: 'drinks', price: 250, description: 'Premium chocolate shake with Ferraro Rocher', rating: 5.0, isAvailable: true, image: 'images/hero.png' },
];

const seedDB = async () => {
  try {
    await connectDB();
    await sequelize.sync({ force: true });
    console.log('🧹  Cleared existing data');

    // Create Admin
    await User.create({
      name: 'Restaurant Admin',
      email: 'admin@locationrestaurant.com',
      phone: '9876543210',
      password: 'Admin@1234',
      role: 'admin',
      isVerified: true
    });

    // Seed menu items
    await MenuItem.bulkCreate(menuItems);
    console.log(`🍽️   Seeded ${menuItems.length} menu items`);

    process.exit(0);
  } catch (error) {
    console.error('❌  Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();
