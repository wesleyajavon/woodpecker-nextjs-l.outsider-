-- Renommer la colonne mode en scale_mode pour éviter le conflit avec la fonction mode() de PostgreSQL
-- (erreur: WITHIN GROUP is required for ordered-set aggregate mode)
ALTER TABLE "Beat" RENAME COLUMN "mode" TO "scale_mode";
