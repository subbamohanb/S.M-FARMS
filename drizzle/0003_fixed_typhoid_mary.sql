CREATE TABLE `pushTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(255) NOT NULL,
	`customerEmail` varchar(320),
	`customerPhone` varchar(32),
	`platform` enum('android','ios','web') NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pushTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `pushTokens_token_unique` UNIQUE(`token`)
);
