ALTER TABLE `orders` ADD `fulfillmentStatus` enum('pending','processing','packed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `orders` ADD `trackingNumber` varchar(120);--> statement-breakpoint
ALTER TABLE `orders` ADD `carrier` varchar(80);--> statement-breakpoint
ALTER TABLE `products` ADD `stockQuantity` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `reorderLevel` int DEFAULT 5 NOT NULL;