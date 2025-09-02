# Frontend AIR

**Association d'Insertion et de Réinsertion (A.I.R.)**

Ce repository contient le frontend de l'Association d'Insertion et de Réinsertion, composé de deux applications web distinctes.

## 🏗️ Structure du projet

```
front-air/
├── astro-site/          # Site web public (Astro)
├── admin-dashboard/      # Interface d'administration (Angular)
└── README.md            # Ce fichier
```

## 📱 Applications

### 1. Site Web Public (`astro-site/`)
- **Technologie :** [Astro](https://astro.build/)
- **Objectif :** Site vitrine public de l'association
- **Fonctionnalités :**
  - Présentation de l'association
  - Actualités et événements
  - Informations sur les services
  - Section recrutement
  - Blog et ressources

### 2. Dashboard Administratif (`admin-dashboard/`)
- **Technologie :** [Angular](https://angular.io/)
- **Objectif :** Interface d'administration pour le personnel
- **Fonctionnalités :**
  - Gestion des actualités
  - Gestion des partenaires
  - Gestion des structures
  - Gestion des offres d'emploi
  - Gestion des fichiers et documents
  - Tableaux de bord et statistiques

## 🚀 Installation et développement

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn

### Installation

1. **Cloner le repository**
   ```bash
   git clone [URL_DU_REPO]
   cd front-air
   ```

2. **Installer les dépendances du site Astro**
   ```bash
   cd astro-site
   npm install
   ```

3. **Installer les dépendances du dashboard Angular**
   ```bash
   cd ../admin-dashboard
   npm install
   ```

### Développement

#### Site Astro
```bash
cd astro-site
npm run dev          # Démarre le serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualisation du build
```

#### Dashboard Angular
```bash
cd admin-dashboard
npm start            # Démarre le serveur de développement
npm run build        # Build de production
npm test             # Lance les tests
```

## 🐳 Déploiement avec Docker

### Site Astro
```bash
cd astro-site
docker build -t air-astro-site .
docker run -p 3000:80 air-astro-site
```

### Dashboard Angular
```bash
cd admin-dashboard
docker build -t air-admin-dashboard .
docker run -p 4200:80 air-admin-dashboard
```

## 📁 Structure détaillée

### `astro-site/`
- **`src/components/`** - Composants réutilisables
- **`src/pages/`** - Pages du site
- **`src/layouts/`** - Layouts de base
- **`src/styles/`** - Fichiers CSS
- **`public/`** - Assets statiques

### `admin-dashboard/`
- **`src/app/pages/`** - Pages de l'interface admin
- **`src/app/services/`** - Services API
- **`src/app/models/`** - Modèles de données
- **`src/app/utils/`** - Utilitaires (sanitisation, etc.)

## 🔧 Technologies utilisées

- **Frontend :** HTML5, CSS3, TypeScript
- **Frameworks :** Astro, Angular
- **Styling :** SCSS
- **Build tools :** Vite (Astro), Angular CLI
- **Déploiement :** Docker, Nginx

## 📞 Contact

**Association d'Insertion et de Réinsertion (A.I.R.)**  
📍 108 RUE JEAN-JACQUES ROUSSEAU (LOMME) 59000 LILLE  
📧 secretariat@asso-air.org  
📞 03 20 04 16 85

## 📄 Licence

Ce projet est propriétaire de l'Association d'Insertion et de Réinsertion (A.I.R.).