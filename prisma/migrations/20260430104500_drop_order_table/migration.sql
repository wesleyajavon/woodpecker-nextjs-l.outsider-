-- Remove legacy single-product Order table (empty in production; checkout is MultiItemOrder only).
DROP TABLE IF EXISTS "Order";
