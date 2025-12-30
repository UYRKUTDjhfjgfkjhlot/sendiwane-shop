/**
 * Script pour importer les données de products.js vers Decap CMS
 * 
 * Utilisation:
 * node admin/import-from-js.js
 * 
 * Ce script lit products.js et crée les fichiers JSON correspondants
 * dans admin/data/products/
 */

const fs = require('fs');
const path = require('path');

// Lire products.js
const productsJsPath = path.join(__dirname, '..', 'products.js');
const productsJsContent = fs.readFileSync(productsJsPath, 'utf8');

// Extraire l'objet PRODUCTS (méthode simple)
const productsMatch = productsJsContent.match(/const PRODUCTS = ({[\s\S]*?});/);
if (!productsMatch) {
  console.error('❌ Impossible de parser products.js');
  process.exit(1);
}

// Évaluer l'objet (attention: nécessite que products.js soit valide)
const PRODUCTS = eval('(' + productsMatch[1] + ')');

const productsDir = path.join(__dirname, 'data', 'products');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

let totalProducts = 0;

// Parcourir chaque catégorie
Object.keys(PRODUCTS).forEach(category => {
  const products = PRODUCTS[category];
  
  products.forEach(product => {
    // Créer l'objet pour Decap CMS
    const cmsProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      imageUrl: product.image // Utiliser imageUrl pour les URLs externes
    };
    
    // Si l'image est une URL locale, utiliser le champ image
    if (product.image && !product.image.startsWith('http')) {
      cmsProduct.image = product.image;
      delete cmsProduct.imageUrl;
    }
    
    // Créer le fichier JSON
    const fileName = `${product.id}.json`;
    const filePath = path.join(productsDir, fileName);
    
    fs.writeFileSync(
      filePath,
      JSON.stringify(cmsProduct, null, 2),
      'utf8'
    );
    
    totalProducts++;
  });
  
  console.log(`✅ ${products.length} produits importés pour la catégorie "${category}"`);
});

console.log(`\n🎉 Import terminé ! ${totalProducts} produits au total`);
console.log(`📁 Fichiers créés dans: ${productsDir}`);
console.log(`\n💡 Vous pouvez maintenant utiliser Decap CMS pour modifier ces produits`);

