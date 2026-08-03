DROP DATABASE IF EXISTS `ag7spot`;
CREATE DATABASE `ag7spot` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ag7spot`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `collection_shops`;
DROP TABLE IF EXISTS `flash_deals`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `collections`;
DROP TABLE IF EXISTS `shops`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('seller','buyer') NOT NULL DEFAULT 'buyer',
  `avatar` VARCHAR(100) NOT NULL DEFAULT '',
  `points` INT NOT NULL DEFAULT 0,
  `shop_id` INT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `shops` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `owner_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `lat` DECIMAL(10,7) NOT NULL,
  `lng` DECIMAL(10,7) NOT NULL,
  `avatar` VARCHAR(255) NOT NULL,
  `cover` VARCHAR(255) NOT NULL,
  `followed` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('open','closed','break') NOT NULL DEFAULT 'closed',
  `address` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_shops_owner_id` (`owner_id`),
  CONSTRAINT `fk_shops_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `shop_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `image` VARCHAR(255) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `distance` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_shop_id` (`shop_id`),
  CONSTRAINT `fk_products_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `flash_deals` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `shop_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `discount` TINYINT UNSIGNED NOT NULL,
  `end_time` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_flash_deals_shop_id` (`shop_id`),
  KEY `idx_flash_deals_product_id` (`product_id`),
  CONSTRAINT `fk_flash_deals_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_flash_deals_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `collections` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `creator` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_collections_creator` (`creator`),
  CONSTRAINT `fk_collections_creator` FOREIGN KEY (`creator`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `collection_shops` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `collection_id` INT UNSIGNED NOT NULL,
  `shop_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_collection_shop` (`collection_id`,`shop_id`),
  KEY `idx_collection_shops_collection_id` (`collection_id`),
  KEY `idx_collection_shops_shop_id` (`shop_id`),
  CONSTRAINT `fk_collection_shops_collection` FOREIGN KEY (`collection_id`) REFERENCES `collections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_collection_shops_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `avatar`, `points`, `shop_id`) VALUES
--   (1, 'Ag7 Dev', 'ag7@dev.com', 'password123', 'seller', 'AG', 450, 1),
--   (2, 'Lina Achete', 'lina@achete.com', 'acheteur123', 'buyer', 'LA', 120, NULL),
--   (3, 'Tech Vendeur', 'tech@vendeur.com', 'vendeur123', 'seller', 'TV', 230, 3);

-- INSERT INTO `shops` (`id`, `owner_id`, `name`, `category`, `lat`, `lng`, `avatar`, `cover`, `followed`, `status`, `address`) VALUES
--   (1, 1, 'Urban Wear Lyon', 'fashion', 45.7640000, 4.8357000, 'https://picsum.photos/seed/urban/100/100', 'https://picsum.photos/seed/urban/600/300', 1, 'open', '15 Rue de la République, Lyon'),
--   (2, 2, 'Librairie du Coin', 'books', 45.7580000, 4.8450000, 'https://picsum.photos/seed/librairie/100/100', 'https://picsum.photos/seed/librairie/600/300', 0, 'open', '8 Place des Terreaux, Lyon'),
--   (3, 3, 'ElectroShop Pro', 'tech', 45.7700000, 4.8250000, 'https://picsum.photos/seed/electro/100/100', 'https://picsum.photos/seed/electro/600/300', 1, 'break', '42 Rue Garibaldi, Lyon'),
--   (4, 4, 'Boulangerie des Artisans', 'food', 45.7550000, 4.8600000, 'https://picsum.photos/seed/boulangerie/100/100', 'https://picsum.photos/seed/boulangerie/600/300', 0, 'open', '3 Rue Tête d''Or, Lyon'),
--   (5, 5, 'Beauty & Co', 'beauty', 45.7620000, 4.8500000, 'https://picsum.photos/seed/beauty/100/100', 'https://picsum.photos/seed/beauty/600/300', 0, 'closed', '10 Rue Victor Hugo, Lyon');

-- INSERT INTO `products` (`id`, `shop_id`, `name`, `price`, `image`, `stock`, `distance`, `description`) VALUES
--   (101, 1, 'Sweat Oversize X', 49.99, 'https://picsum.photos/seed/sweat1/400/400', 12, 1.20, NULL),
--   (102, 1, 'Jeans Vintage Coupe', 69.00, 'https://picsum.photos/seed/jeans1/400/400', 3, 1.20, NULL),
--   (103, 1, 'Casquette Edition Limitee', 29.99, 'https://picsum.photos/seed/casquette/400/400', 0, 1.20, NULL),
--   (201, 2, 'L''Etranger - Albert Camus', 12.90, 'https://picsum.photos/seed/livre1/400/400', 8, 0.80, NULL),
--   (301, 3, 'Ecouteurs ANC Pro', 89.00, 'https://picsum.photos/seed/ecouteurs/400/400', 5, 2.50, NULL),
--   (302, 3, 'Station de charge rapide', 34.99, 'https://picsum.photos/seed/charge/400/400', 2, 2.50, NULL),
--   (401, 4, 'Pain au chocolat (x6)', 8.50, 'https://picsum.photos/seed/pain/400/400', 20, 0.40, NULL),
--   (501, 5, 'Crème hydratante bio', 24.90, 'https://picsum.photos/seed/creme/400/400', 7, 1.80, NULL);

-- INSERT INTO `flash_deals` (`id`, `shop_id`, `product_id`, `discount`, `end_time`) VALUES
--   (1, 1, 101, 30, '2026-07-30 14:00:00'),
--   (2, 3, 301, 20, '2026-07-30 16:00:00');

-- INSERT INTO `collections` (`id`, `name`, `description`, `creator`) VALUES
--   (1, 'Mode Vintage à Lyon', 'Les meilleures adresses pour du vintage', 1),
--   (2, 'Petit-déjeuner gourmand', 'Boulangeries et café de quartier', 2);

