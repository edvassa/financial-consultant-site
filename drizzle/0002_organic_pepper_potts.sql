CREATE TABLE `blogArticles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`imageUrl` varchar(1024),
	`imageKey` varchar(1024),
	`published` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blogArticles_id` PRIMARY KEY(`id`),
	CONSTRAINT `blogArticles_slug_unique` UNIQUE(`slug`)
);
