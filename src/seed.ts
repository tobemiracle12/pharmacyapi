/**
 * Seed Script — populates MongoDB with all products and blog posts
 * from the existing frontend data.
 *
 * Run with:  npm run seed
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import Product from './models/Product';
import BlogPost from './models/BlogPost';

// ─── Product seed data (mirrors checkout/page.tsx) ───────────────────────────
const PRODUCTS = [
    { name: 'Sofratulle Gauze per pack',         category: 'Treatments',        price: 19500, unitPrice: 15000, image: '/gauze_box.png',          description: 'Professional wound dressing gauze, sold per full pack.',           stock: 50,  upc: '012345678901', expDate: '2028-12-31' },
    { name: 'Sofratulle Gauze per single pack',  category: 'Treatments',        price: 2000,  unitPrice: 1500,  image: '/gauze_box.png',          description: 'Professional wound dressing gauze, sold individually.',            stock: 200, upc: '012345678902', expDate: '2028-12-31' },
    { name: 'Crutches',                          category: 'Fitness',           price: 30000, unitPrice: 22000, image: '/crutches.png',           description: 'Adjustable lightweight crutches for mobility support.',            stock: 20,  upc: '012345678903', expDate: 'N/A' },
    { name: 'C&C Electronic BP Monitor',         category: 'Health Conditions', price: 20000, unitPrice: 16000, image: '/bp_monitor.png',         description: 'Accurate digital blood pressure and pulse monitor.',               stock: 35,  upc: '012345678904', expDate: '2030-06-30' },
    { name: 'Surgical Face Mask (Box of 50)',    category: 'Covid Essentials',  price: 4500,  unitPrice: 3200,  image: '/medicine_products.png',  description: '3-ply surgical face masks, box of 50 pieces.',                    stock: 100, upc: '012345678905', expDate: '2029-05-18' },
    { name: 'Hand Sanitizer Gel 500ml',          category: 'Personal Care',     price: 2500,  unitPrice: 1800,  image: '/supplement_bottle.png',  description: '70% alcohol-based hand sanitizer gel, 500ml bottle.',             stock: 150, upc: '012345678906', expDate: '2028-10-22' },
    { name: 'Digital Thermometer',               category: 'Health Conditions', price: 6000,  unitPrice: 4200,  image: '/medicine_box.png',       description: 'Fast-reading digital thermometer with fever alert.',               stock: 75,  upc: '012345678907', expDate: '2031-08-14' },
    { name: 'First Aid Kit Premium',             category: 'Treatments',        price: 15000, unitPrice: 11000, image: '/medicine_products.png',  description: 'Comprehensive first aid kit for home, office, and travel.',        stock: 30,  upc: '012345678908', expDate: '2029-11-05' },
    { name: 'Blood Sugar Test Strips',           category: 'Diabetes',          price: 8500,  unitPrice: 6000,  image: '/supplement_bottle.png',  description: 'Compatible blood glucose test strips — 50 count per pack.',       stock: 60,  upc: '012345678909', expDate: '2028-04-12' },
    { name: 'Condoms Pack of 12',                category: 'Sexual Wellness',   price: 3500,  unitPrice: 2500,  image: '/medicine_box.png',       description: 'Lubricated latex condoms, pack of 12.',                           stock: 200, upc: '012345678910', expDate: '2029-09-30' },
    { name: 'Paracetamol 500mg (100 Tabs)',      category: 'Analgesic',         price: 1500,  unitPrice: 1000,  image: '/medicine_products.png',  description: 'Paracetamol 500mg tablets for pain and fever relief — 100 tabs.', stock: 300, upc: '012345678911', expDate: '2028-07-25' },
    { name: 'Flumed Cold & Flu Syrup',           category: 'Anti-Cold',         price: 2800,  unitPrice: 2000,  image: '/supplement_bottle.png',  description: 'Flumed syrup for relief from cold, cough, and flu symptoms.',     stock: 90,  upc: '012345678912', expDate: '2027-11-15' },
];

// ─── Blog post seed data (mirrors data/blogData.ts) ──────────────────────────
const BLOG_POSTS = [
    {
        title: 'How to Write a Blog Post Your Readers Will Love in 5 Steps',
        slug: 'how-to-write-a-blog-post',
        author: 'Editor',
        date: 'February 9, 2026',
        excerpt: 'Why the world would end without travel coupons. The 16 worst songs about spa deals. How daily me person...',
        image: '/blog_pharmacy_workspace.png',
        categories: ['HEALTH', 'PHARMACY', 'WELLNESS'],
        blocks: [
            { type: 'paragraph', text: 'Why the world would end without travel coupons. The 16 worst songs about spa deals. How daily me person.' },
            { type: 'divider' },
            { type: 'paragraph', text: 'The 11 worst business software in history. Why latest electronic gadgets will make you question everything.' },
            { type: 'heading', text: 'How carnival cruises can help you live a better life.' },
            { type: 'list', items: ['Smart people learn from everything', 'Average people from their experiences', 'Stupid people already have all the answers'] },
            { type: 'blockquote', text: 'Smart people learn from everything and everyone, average people from their experiences, stupid people already have all the answers.', author: 'Socrates' },
        ],
    },
    {
        title: '9 Content Marketing Trends and Ideas to Increase Traffic',
        slug: 'content-marketing-trends',
        author: 'Editor',
        date: 'February 7, 2026',
        excerpt: 'Why do people think wholesale accessories are a good idea? Unbelievable cool tech gadget success stories...',
        image: '/blog_health_supplements.png',
        categories: ['SUPPLEMENTS', 'INFORMATION', 'PROMOTIONS'],
        blocks: [
            { type: 'paragraph', text: 'Why do people think wholesale accessories are a good idea? Unbelievable cool tech gadget success stories.' },
            { type: 'divider' },
            { type: 'heading', text: 'The Unconventional Guide to Wholesale Accessories' },
            { type: 'paragraph', text: 'Many pharmacists and wellness centers overlook the power of accessory items and health devices in their content marketing.' },
            { type: 'list', items: ['Track local health trends using pharmacy dispensing metrics.', 'Focus on high-quality, scientifically backed visual materials.', 'Deliver clear advice rather than just selling products.'] },
            { type: 'blockquote', text: 'Content is king, but context and clinical value are the actual keys to health-related engagement.', author: 'Marketing Strategist' },
        ],
    },
    {
        title: 'Understanding Your Prescriptions: A Complete Guide for Patients',
        slug: 'understanding-prescriptions-guide',
        author: 'Dr. Amara',
        date: 'January 28, 2026',
        excerpt: 'Navigating the world of prescriptions can feel overwhelming. From understanding dosage instructions to knowing when to take your medications...',
        image: '/blog_medications_wellness.png',
        categories: ['MEDICATIONS', 'HEALTH', 'TIPS'],
        blocks: [
            { type: 'paragraph', text: 'Navigating the world of prescriptions can feel overwhelming. From understanding dosage instructions to knowing when to take your medications, this guide breaks down everything you need to know.' },
            { type: 'divider' },
            { type: 'heading', text: 'De-coding the Sig: Standard Prescription Abbreviations' },
            { type: 'list', items: ['QD: Once daily', 'BID: Twice a day', 'TID: Three times a day', 'QID: Four times a day', 'PRN: As needed'] },
            { type: 'blockquote', text: 'Always check the pharmacy label twice. If the label details do not match what your doctor told you, ask the pharmacist immediately.', author: 'Dr. Amara, Clinical Pharmacist' },
        ],
    },
    {
        title: 'Why Regular Pharmacist Consultations Can Save Your Life',
        slug: 'pharmacist-consultations-benefits',
        author: 'Editor',
        date: 'January 20, 2026',
        excerpt: 'Most people only visit a pharmacist when they need to fill a prescription. But regular consultations can help identify potential health risks early...',
        image: '/blog_pharmacist_consult.png',
        categories: ['PHARMACY', 'CONSULTATION', 'CARE'],
        blocks: [
            { type: 'paragraph', text: "Most people only visit a pharmacist when they need to fill a prescription. But regular consultations can help identify potential health risks early." },
            { type: 'divider' },
            { type: 'heading', text: 'The Role of the Modern Pharmacist' },
            { type: 'blockquote', text: "A consultation is a two-way street. Bring your bottles, your questions, and your health journals to every visit.", author: 'Health Care Advocate' },
            { type: 'list', items: ['What is the main goal of this medication?', 'Are there any foods or supplements I should avoid?', 'What should I do if I miss a dose?', 'How should I store this medication?'] },
        ],
    },
    {
        title: 'Top 10 Herbal Remedies That Actually Work According to Science',
        slug: 'herbal-remedies-that-work',
        author: 'Dr. Nkechi',
        date: 'January 15, 2026',
        excerpt: 'From turmeric to ginger, herbal remedies have been used for centuries across cultures. But which ones are backed by modern science?...',
        image: '/blog_herbal_remedies.png',
        categories: ['HERBAL', 'NATURAL', 'WELLNESS'],
        blocks: [
            { type: 'paragraph', text: 'From turmeric to ginger, herbal remedies have been used for centuries across cultures. But which ones are backed by modern science?' },
            { type: 'divider' },
            { type: 'heading', text: 'Science-Backed Herbal Solutions' },
            { type: 'list', items: ['Turmeric (Curcumin): Powerful anti-inflammatory and antioxidant properties.', 'Ginger: Outstanding for nausea reduction and digestive comfort.', 'Garlic: Supports cardiovascular health.', 'Echinacea: May shorten the common cold duration.'] },
            { type: 'blockquote', text: 'Herbal supplements can have potent active ingredients. They should be integrated carefully and discussed with your physician.', author: 'Dr. Nkechi' },
        ],
    },
    {
        title: 'Home Health Monitoring: Essential Devices Every Family Needs',
        slug: 'home-health-monitoring-devices',
        author: 'Editor',
        date: 'March 10, 2026',
        excerpt: 'With the rise of telemedicine and home health care, having the right monitoring devices at home is more important than ever...',
        image: '/blog_blood_pressure.png',
        categories: ['HEALTH', 'MONITORING', 'HOME CARE'],
        blocks: [
            { type: 'paragraph', text: 'With the rise of telemedicine and home health care, having the right monitoring devices at home is more important than ever.' },
            { type: 'divider' },
            { type: 'heading', text: 'Key Monitoring Tools for Your Home' },
            { type: 'list', items: ['Digital Blood Pressure Monitor: Ideal for tracking hypertension.', 'Pulse Oximeter: Measures blood oxygen saturation levels.', 'Digital Thermometer: Fast, accurate temperature readings.'] },
            { type: 'blockquote', text: 'Do not self-diagnose based on home readings. Use the records as a basis for consultations with medical professionals.', author: 'Telehealth Specialist' },
        ],
    },
];

// ─── Seed Function ────────────────────────────────────────────────────────────
const seed = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌  MONGODB_URI is not defined in .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('✅  Connected to MongoDB\n');

        // Clear existing records
        await Product.deleteMany({});
        await BlogPost.deleteMany({});
        console.log('🗑️   Cleared existing products and blog posts');

        // Insert fresh data
        const insertedProducts = await Product.insertMany(PRODUCTS);
        console.log(`✅  Seeded ${insertedProducts.length} products`);

        const insertedPosts = await BlogPost.insertMany(BLOG_POSTS);
        console.log(`✅  Seeded ${insertedPosts.length} blog posts`);

        console.log('\n🌱  Database seeded successfully!\n');
    } catch (error) {
        console.error('❌  Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌  Disconnected from MongoDB');
        process.exit(0);
    }
};

seed();
