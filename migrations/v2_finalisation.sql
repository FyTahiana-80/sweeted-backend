-- Migration V2 — Finalisation (seule évolution de schéma autorisée pour l'étape 1)
-- Source : prompt_maitre.md section 2.3
-- À exécuter sur l'instance MySQL Aiven (base `sweeted`).

-- 1. Unicité du matricule (anti doublons de comptes)
ALTER TABLE Users ADD CONSTRAINT uq_matricule UNIQUE (matricule_number);

-- 2. Compte Admin (direction) = 5-40014/25
UPDATE Users SET id_role = 1 WHERE matricule_number = '5-40014/25';
