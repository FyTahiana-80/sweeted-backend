-- Migration SQL pour ajouter la permission update_post
-- À exécuter sur la base sweeted_db.
INSERT INTO permissions (nom)
SELECT 'update_post'
WHERE NOT EXISTS (
        SELECT 1
        FROM permissions
        WHERE nom = 'update_post'
    );
-- Associer la permission aux rôles Admin, Modérateur et Utilisateur si ceux-ci existent.
SET @update_post_id := (
        SELECT id
        FROM permissions
        WHERE nom = 'update_post'
        LIMIT 1
    );
SET @admin_role_id := (
        SELECT id
        FROM roles
        WHERE nom = 'Admin'
        LIMIT 1
    );
SET @moderator_role_id := (
        SELECT id
        FROM roles
        WHERE nom = 'Modérateur'
        LIMIT 1
    );
SET @user_role_id := (
        SELECT id
        FROM roles
        WHERE nom = 'Utilisateur'
        LIMIT 1
    );
INSERT INTO permission_de_role (id_role, id_permission)
SELECT @admin_role_id,
    @update_post_id
WHERE @admin_role_id IS NOT NULL
    AND @update_post_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1
        FROM permission_de_role
        WHERE id_role = @admin_role_id
            AND id_permission = @update_post_id
    );
INSERT INTO permission_de_role (id_role, id_permission)
SELECT @moderator_role_id,
    @update_post_id
WHERE @moderator_role_id IS NOT NULL
    AND @update_post_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1
        FROM permission_de_role
        WHERE id_role = @moderator_role_id
            AND id_permission = @update_post_id
    );
INSERT INTO permission_de_role (id_role, id_permission)
SELECT @user_role_id,
    @update_post_id
WHERE @user_role_id IS NOT NULL
    AND @update_post_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1
        FROM permission_de_role
        WHERE id_role = @user_role_id
            AND id_permission = @update_post_id
    );