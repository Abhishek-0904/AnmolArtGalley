-- Anmol Art Gallery - Complete MySQL Database Schema
-- Run this in phpMyAdmin (http://localhost/phpmyadmin) or MySQL CLI

CREATE DATABASE IF NOT EXISTS `anmol_art_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `anmol_art_db`;

-- 1. Studio Settings Table
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `studio_name` VARCHAR(255) NOT NULL DEFAULT 'Anmol Art',
  `tagline` VARCHAR(255) DEFAULT 'Sketch Studio',
  `logo_letter` VARCHAR(10) DEFAULT 'A',
  `whatsapp_number` VARCHAR(32) DEFAULT '919876543210',
  `instagram_handle` VARCHAR(255) DEFAULT 'anmolart_gallery',
  `instagram_url` VARCHAR(255) DEFAULT 'https://www.instagram.com/anmolart_gallery/',
  `artist_name` VARCHAR(255) DEFAULT 'Anmol',
  `artist_title` VARCHAR(255) DEFAULT 'Lead Fine Artist & Charcoal Specialist',
  `artist_bio` TEXT,
  `announcement` TEXT,
  `admin_password` VARCHAR(255) DEFAULT 'AnmolArtGallery',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Artworks Inventory Table (Available For Sale & Completed Orders)
CREATE TABLE IF NOT EXISTS `artworks` (
  `id` VARCHAR(100) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(64) DEFAULT 'sketching',
  `medium` VARCHAR(255) DEFAULT NULL,
  `paper` VARCHAR(255) DEFAULT NULL,
  `dimensions` VARCHAR(128) DEFAULT NULL,
  `price` INT NOT NULL DEFAULT 0,
  `image` MEDIUMTEXT NOT NULL,
  `description` TEXT DEFAULT NULL,
  `is_original` TINYINT(1) DEFAULT 1,
  `tag` VARCHAR(100) DEFAULT NULL,
  `listing_type` VARCHAR(32) NOT NULL DEFAULT 'sale', -- 'sale' or 'completed'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Customer Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(100) PRIMARY KEY,
  `order_date` VARCHAR(100) DEFAULT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(64) NOT NULL,
  `address` TEXT NOT NULL,
  `items` JSON NOT NULL,
  `total` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(64) NOT NULL DEFAULT 'New', -- 'New', 'In Progress', 'Completed'
  `order_type` VARCHAR(32) NOT NULL DEFAULT 'ready', -- 'ready' or 'custom'
  `custom_details` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Customer Reviews & Feedback Table
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` VARCHAR(100) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `city` VARCHAR(255) DEFAULT NULL,
  `stars` INT NOT NULL DEFAULT 5,
  `quote` TEXT NOT NULL,
  `item` VARCHAR(255) DEFAULT NULL,
  `review_date` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
