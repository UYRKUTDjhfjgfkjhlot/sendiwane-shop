/**
 * Script pour convertir les fichiers JSON de Decap CMS en products.js
 * 
 * Utilisation:
 * 1. Placez ce script dans le dossier admin
 * 2. Exécutez: node admin/convert-to-js.js
 * 
 * Ce script lit tous les fichiers JSON dans admin/data/products/
 * et génère le fichier products.js
 */

const fs = require('fs');
const path = require('path');

const productsDir = path.join(__dirname, 'data', 'products');
const outputFile = path.join(__dirname, '..', 'products.js');

// Lire tous les fichiers JSON
const files = fs.readdirSync(productsDir).filter(file => file.endsWith('.json'));

// Organiser les produits par catégorie
const productsByCategory = {
  corporel: [],
  chambre: [],
  thiouraye: [],
  vetement: []
};

files.forEach(file => {
  const filePath = path.join(productsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const product = JSON.parse(content);
  
  // Utiliser imageUrl si disponible, sinon utiliser image (chemin relatif)
  if (product.imageUrl) {
    product.image = product.imageUrl;
  } else if (product.image) {
    // Convertir le chemin relatif en chemin public
    product.image = product.image.startsWith('/') ? product.image : '/' + product.image;
  }
  
  // Supprimer imageUrl du produit final
  delete product.imageUrl;
  
  // Ajouter à la bonne catégorie
  if (productsByCategory[product.category]) {
    productsByCategory[product.category].push(product);
  }
});

// Trier les produits par ID pour chaque catégorie
Object.keys(productsByCategory).forEach(category => {
  productsByCategory[category].sort((a, b) => {
    const aNum = parseInt(a.id.split('-')[1]) || 0;
    const bNum = parseInt(b.id.split('-')[1]) || 0;
    return aNum - bNum;
  });
});

// Générer le contenu du fichier products.js
let jsContent = '// Données des produits par catégorie\n';
jsContent += '// Ce fichier est généré automatiquement depuis admin/data/products/\n';
jsContent += '// Ne modifiez pas ce fichier manuellement !\n';
jsContent += '// Utilisez /admin/ pour modifier les produits\n\n';
jsContent += 'const PRODUCTS = {\n';

// Générer chaque catégorie
const categoryLabels = {
  corporel: 'Parfums Corporels',
  chambre: 'Parfums de Chambre',
  thiouraye: 'Thiouraye',
  vetement: 'Vêtements'
};

Object.keys(productsByCategory).forEach(category => {
  const products = productsByCategory[category];
  jsContent += `  // ${categoryLabels[category]}\n`;
  jsContent += `  ${category}: [\n`;
  
  products.forEach((product, index) => {
    jsContent += '    {\n';
    jsContent += `      id: '${product.id}',\n`;
    jsContent += `      name: '${product.name.replace(/'/g, "\\'")}',\n`;
    jsContent += `      price: ${product.price},\n`;
    jsContent += `      image: '${product.image}',\n`;
    jsContent += `      category: '${product.category}'\n`;
    jsContent += '    }';
    if (index < products.length - 1) {
      jsContent += ',';
    }
    jsContent += '\n';
  });
  
  jsContent += '  ]';
  if (category !== 'vetement') {
    jsContent += ',';
  }
  jsContent += '\n\n';
});

jsContent += '};';

// Écrire le fichier
fs.writeFileSync(outputFile, jsContent, 'utf8');
console.log(`✅ Fichier products.js généré avec succès !`);
console.log(`   ${productsByCategory.corporel.length} produits corporel`);
console.log(`   ${productsByCategory.chambre.length} produits chambre`);
console.log(`   ${productsByCategory.thiouraye.length} produits thiouraye`);
console.log(`   ${productsByCategory.vetement.length} produits vetement`);

