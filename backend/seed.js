const mongoose = require('mongoose');

async function main() {
  const uri = 'mongodb://127.0.0.1:27017/makhamaat-db';
  try {
    await mongoose.connect(uri);
    console.log('Connected to database for seeding');

    // 1. Clear existing products, actors, activities, messages
    await mongoose.connection.db.collection('products').deleteMany({});
    await mongoose.connection.db.collection('actors').deleteMany({});
    await mongoose.connection.db.collection('activities').deleteMany({});
    await mongoose.connection.db.collection('messages').deleteMany({});
    console.log('Cleared existing products, actors, activities, messages');

    // 2. Fetch the client user
    const userDoc = await mongoose.connection.db.collection('users').findOne({ email: 'user@mbc-suarl.com' });
    if (!userDoc) {
      console.error('user@mbc-suarl.com not found. Make sure backend has run and created the default accounts first.');
      return;
    }
    const userId = userDoc._id;
    console.log('Found client user with ID:', userId);

    // 3. Create products
    const productsData = [
      {
        name: 'Semence de Riz (Sahel 108)',
        category: 'AGRICULTURAL',
        price: 400,
        stockQuantity: 12000,
        unit: 'kg',
        description: 'Semences certifiées à haut rendement pour la vallée du fleuve Sénégal.',
        imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80',
        lowStockThreshold: 1000,
        markets: [
          { marketName: 'Marché Ross Béthio', price: 420, isAvailable: true, lastUpdated: new Date() },
          { marketName: 'Marché Saint-Louis', price: 430, isAvailable: true, lastUpdated: new Date() }
        ],
        bestMarket: { marketName: 'Marché Ross Béthio', price: 420 },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Engrais NPK 15-15-15',
        category: 'INPUTS',
        price: 350,
        stockQuantity: 8000,
        unit: 'kg',
        description: 'Engrais minéral équilibré pour la croissance et le rendement optimal.',
        imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80',
        lowStockThreshold: 1500,
        markets: [
          { marketName: 'Marché Touba', price: 360, isAvailable: true, lastUpdated: new Date() }
        ],
        bestMarket: { marketName: 'Marché Touba', price: 360 },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Piment Hydroponique (Légumes)',
        category: 'AGRICULTURAL',
        price: 1200,
        stockQuantity: 450,
        unit: 'kg',
        description: 'Piments frais cultivés hors-sol sous serre technologique.',
        imageUrl: 'https://images.unsplash.com/photo-1588252393710-8547fae3fa18?auto=format&fit=crop&w=400&q=80',
        lowStockThreshold: 200,
        markets: [
          { marketName: 'Marché Sandaga', price: 1300, isAvailable: true, lastUpdated: new Date() }
        ],
        bestMarket: { marketName: 'Marché Sandaga', price: 1300 },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Oignon Rouge Local',
        category: 'AGRICULTURAL',
        price: 450,
        stockQuantity: 25000,
        unit: 'kg',
        description: 'Oignons rouges locaux séchés de la zone des Niayes.',
        imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=400&q=80',
        lowStockThreshold: 3000,
        markets: [
          { marketName: 'Marché Thiaroye', price: 470, isAvailable: true, lastUpdated: new Date() }
        ],
        bestMarket: { marketName: 'Marché Thiaroye', price: 470 },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Motopompe Diesel 10 CV',
        category: 'EQUIPMENT',
        price: 350000,
        stockQuantity: 15,
        unit: 'pcs',
        description: 'Motopompe robuste pour l\'irrigation agricole intensive.',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
        lowStockThreshold: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const productsResult = await mongoose.connection.db.collection('products').insertMany(productsData);
    console.log('Seeded products:', productsResult.insertedCount);
    
    // Map inserted products
    const productKeys = Object.keys(productsResult.insertedIds);
    const prodId0 = productsResult.insertedIds[productKeys[0]]; // Riz
    const prodId1 = productsResult.insertedIds[productKeys[1]]; // NPK
    const prodId2 = productsResult.insertedIds[productKeys[2]]; // Piment
    const prodId3 = productsResult.insertedIds[productKeys[3]]; // Oignon

    // 4. Create actors
    const actorsData = [
      {
        name: 'AgriCorp S.A.',
        type: 'SUPPLIER',
        location: 'Dakar, Sénégal',
        status: 'Actif',
        contactEmail: 'info@agricorp.sn',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Société des Engrais Chimiques',
        type: 'SUPPLIER',
        location: 'Thiès, Sénégal',
        status: 'Actif',
        contactEmail: 'contact@sec.sn',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'CM Podor',
        type: 'CLIENT_B2B',
        location: 'Podor, Sénégal',
        status: 'Actif',
        contactEmail: 'cmp@gmail.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Coopérative de Richard-Toll',
        type: 'CLIENT_B2B',
        location: 'Richard-Toll, Sénégal',
        status: 'Actif',
        contactEmail: 'contact@cooprt.sn',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'AfriFoods International',
        type: 'CLIENT_EXPORT',
        location: 'Saint-Louis, Sénégal',
        status: 'Actif',
        contactEmail: 'orders@afrifoods.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const actorsResult = await mongoose.connection.db.collection('actors').insertMany(actorsData);
    console.log('Seeded actors:', actorsResult.insertedCount);

    const actorKeys = Object.keys(actorsResult.insertedIds);
    const actorId0 = actorsResult.insertedIds[actorKeys[0]]; // AgriCorp
    const actorId2 = actorsResult.insertedIds[actorKeys[2]]; // CM Podor
    const actorId3 = actorsResult.insertedIds[actorKeys[3]]; // Coop Richard-Toll
    const actorId4 = actorsResult.insertedIds[actorKeys[4]]; // AfriFoods

    // 5. Create activities
    const activitiesData = [
      {
        type: 'PURCHASE',
        status: 'COMPLETED',
        productId: prodId3, // Oignon
        actorId: actorId0, // AgriCorp
        quantity: 15000,
        orderNumber: '020726-A1',
        deliveryDate: new Date(),
        notes: 'Achat de stock d\'oignons rouges de qualité supérieure.',
        paymentStatus: 'PAID',
        paymentMethod: 'CASH',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'SALE',
        status: 'COMPLETED',
        productId: prodId0, // Riz
        actorId: actorId2, // CM Podor
        quantity: 2000,
        orderNumber: '020726-A2',
        deliveryDate: new Date(),
        notes: 'Livraison de semences de riz Sahel 108.',
        paymentStatus: 'PAID',
        paymentMethod: 'CARD',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'SALE',
        status: 'COMPLETED',
        productId: prodId1, // NPK
        actorId: actorId3, // Coop Richard-Toll
        quantity: 5000,
        orderNumber: '020726-A3',
        deliveryDate: new Date(),
        notes: 'Vente d\'engrais NPK pour la saison humide.',
        paymentStatus: 'PAID',
        paymentMethod: 'MOBILE_MONEY',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'EXPORT',
        status: 'COMPLETED',
        productId: prodId2, // Piment
        actorId: actorId4, // AfriFoods
        quantity: 200,
        orderNumber: '020726-A4',
        deliveryDate: new Date(),
        notes: 'Exportation de piment hydroponique haut de gamme.',
        paymentStatus: 'PAID',
        paymentMethod: 'CARD',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'SALE',
        status: 'PENDING',
        productId: prodId0, // Riz
        actorId: userId, // Client user
        quantity: 500,
        orderNumber: '020726-A5',
        deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days in future
        notes: 'Commande client via Espace Client (Paiement à la livraison)',
        paymentStatus: 'PENDING',
        paymentMethod: 'CASH',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'SALE',
        status: 'PENDING',
        productId: prodId1, // NPK
        actorId: userId, // Client user
        quantity: 1000,
        orderNumber: '020726-A6',
        deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        notes: 'Commande client via Espace Client (En attente de paiement par carte)',
        paymentStatus: 'PENDING',
        paymentMethod: 'CARD',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const activitiesResult = await mongoose.connection.db.collection('activities').insertMany(activitiesData);
    console.log('Seeded activities:', activitiesResult.insertedCount);

    // 6. Create default inbox messages
    const messagesData = [
      {
        sender: 'CM Podor (cmp@gmail.com)',
        type: 'CONTACT',
        subject: 'Demande de réapprovisionnement',
        content: 'Bonjour, nous souhaiterions commander 5 Tonnes de semences pour la semaine prochaine.',
        status: 'UNREAD',
        folder: 'INBOX',
        readBy: [],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sender: 'AgriCorp S.A. (contact@agricorp.sn)',
        type: 'CONTACT',
        subject: 'Confirmation de livraison',
        content: 'La livraison des 10 Tonnes d\'engrais a été effectuée ce matin à 8h.',
        status: 'READ',
        folder: 'INBOX',
        readBy: [],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const messagesResult = await mongoose.connection.db.collection('messages').insertMany(messagesData);
    console.log('Seeded messages:', messagesResult.insertedCount);

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
