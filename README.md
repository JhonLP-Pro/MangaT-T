# MangaT-T - Lecteur de Manga

Une application web pour lire des mangas en utilisant l'API MangaDex.

## Fonctionnalités

- 🔍 Recherche de mangas
- 📚 Lecture de chapitres en français et en anglais
- 🌓 Mode sombre/clair (en cours de développement)
- 📱 Interface responsive
- 🔤 Filtrage des chapitres par langue
- 🔢 Recherche rapide par numéro de chapitre

## Caractéristiques techniques

- Vue.js 3
- API MangaDex
- Vite
- Axios pour les requêtes API

## Installation

```sh
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Compiler pour la production
npm run build
```

## Utilisation

1. Recherchez un manga dans la barre de recherche
2. Cliquez sur un manga pour voir ses détails
3. Vous pouvez :
   - Commencer la lecture depuis le premier chapitre
   - Aller directement au dernier chapitre
   - Voir la liste complète des chapitres
4. Dans la liste des chapitres, vous pouvez :
   - Filtrer par langue (FR/EN) (en cours de développement)
   - Rechercher un numéro de chapitre spécifique
   - Charger plus de chapitres si disponibles
