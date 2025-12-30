const fs = require('fs');
const path = require('path');

const productsDir = path.join(__dirname, '../data/produits');
const outputFile = path.join(__dirname, '../data/products_index.json');

// Ensure directory exists
if (!fs.existsSync(productsDir)) {
  console.error('Directory not found:', productsDir);
  process.exit(1);
}

try {
  const files = fs.readdirSync(productsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => `data/produits/${file}`);

  fs.writeFileSync(outputFile, JSON.stringify(files, null, 2));
  console.log('Index created successfully:', outputFile);
  console.log('Files found:', files.length);
} catch (error) {
  console.error('Error creating index:', error);
  process.exit(1);
}
