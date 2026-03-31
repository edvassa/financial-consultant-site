CREATE TABLE `contentPages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageKey` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentPages_id` PRIMARY KEY(`id`),
	CONSTRAINT `contentPages_pageKey_unique` UNIQUE(`pageKey`)
);
