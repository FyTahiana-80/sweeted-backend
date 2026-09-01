-- Migration Étape 3 — MVP Sweeted
-- À exécuter sur la base sweeted_db.
-- Ne contient que des ALTER TABLE, jamais de DROP/ recreation.

-- 1. Colonne image_url sur les posts (upload d'image)
ALTER TABLE posts ADD COLUMN image_url VARCHAR(255) DEFAULT NULL AFTER content;

-- 2. Champs de profil sur les users
ALTER TABLE users ADD COLUMN display_name VARCHAR(100) DEFAULT NULL AFTER matricule_number;
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN bio VARCHAR(280) DEFAULT NULL;
