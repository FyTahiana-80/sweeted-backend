-- V3 — Autoriser le rôle Utilisateur (3) à supprimer son propre post
-- Idempotente : ne crée la ligne que si elle n'existe pas déjà.

INSERT INTO Permission_de_role (id_role, id_permission)
SELECT 3, p.id FROM Permissions p
WHERE p.nom = 'delete_post'
AND NOT EXISTS (SELECT 1 FROM Permission_de_role
WHERE id_role = 3 AND id_permission = p.id);
