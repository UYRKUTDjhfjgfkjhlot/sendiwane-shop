# Administration Decap CMS

Ce dossier contient l'interface d'administration pour gérer les produits du site.

## 🚀 Installation

### Option 1 : Avec Netlify (Recommandé)

1. Déployez votre site sur Netlify
2. Activez "Identity" dans les paramètres Netlify
3. Activez "Git Gateway" dans Identity
4. Accédez à `votre-site.netlify.app/admin/`

### Option 2 : Développement local

1. Installez Decap CMS en local :
```bash
npm install -g decap-server
```

2. Lancez le serveur de développement :
```bash
decap-server
```

3. Accédez à `http://localhost:8080/admin/`

## 📝 Utilisation

1. **Accéder à l'admin** : Allez sur `/admin/` dans votre navigateur
2. **Se connecter** : Utilisez votre compte Netlify Identity (ou le mode proxy en local)
3. **Ajouter un produit** :
   - Cliquez sur "Produits" dans le menu
   - Cliquez sur "New Product"
   - Remplissez les champs :
     - **ID** : Format `categorie-numero` (ex: `corporel-1`, `chambre-5`)
     - **Nom** : Nom du produit
     - **Prix** : Prix en FCFA (nombre entier)
     - **Catégorie** : Sélectionnez la catégorie
     - **Image** : Upload une image OU entrez une URL
4. **Modifier un produit** : Cliquez sur un produit existant pour le modifier
5. **Supprimer un produit** : Ouvrez un produit et cliquez sur "Delete"

## 🔄 Synchronisation avec products.js

Après avoir modifié des produits dans Decap CMS, vous devez convertir les fichiers JSON en `products.js` :

```bash
node admin/convert-to-js.js
```

Ce script :
- Lit tous les fichiers JSON dans `admin/data/products/`
- Les organise par catégorie
- Génère le fichier `products.js` à la racine

## 📁 Structure des fichiers

```
admin/
├── index.html          # Interface Decap CMS
├── config.yml          # Configuration Decap CMS
├── convert-to-js.js    # Script de conversion JSON → JS
├── README.md           # Ce fichier
└── data/
    └── products/       # Fichiers JSON des produits (générés par Decap CMS)
        ├── corporel-1.json
        ├── chambre-1.json
        └── ...
```

## ⚙️ Configuration

Le fichier `config.yml` contient la configuration de Decap CMS. Vous pouvez modifier :
- Le backend (git-gateway pour Netlify, proxy pour local)
- Les champs des produits
- Le dossier de stockage des images

## 🔐 Sécurité

- En production, utilisez toujours Netlify Identity avec Git Gateway
- Ne commitez jamais les fichiers JSON sensibles
- Protégez l'accès à `/admin/` si nécessaire

## 💡 Astuces

- Les IDs doivent être uniques par catégorie
- Utilisez des URLs d'images externes (PostImage, Imgur) pour de meilleures performances
- Sauvegardez régulièrement vos modifications
- Testez toujours après avoir régénéré `products.js`

