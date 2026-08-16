ALTER TABLE `orders` ADD `invoiceToken` varchar(64);--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_invoiceToken_unique` UNIQUE(`invoiceToken`);