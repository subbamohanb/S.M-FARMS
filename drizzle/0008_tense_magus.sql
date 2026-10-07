ALTER TABLE `orders` ADD `deliverySlot` varchar(80);--> statement-breakpoint
ALTER TABLE `products` ADD `ingredients` text DEFAULT ('See product label for complete ingredients.') NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `storageInstructions` text DEFAULT ('Store in a cool, dry place away from direct sunlight.') NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `usageGuidance` text DEFAULT ('Follow the product label and use only as directed.') NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `deliveryType` varchar(24) DEFAULT 'standard' NOT NULL;