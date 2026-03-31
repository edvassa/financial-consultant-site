CREATE TABLE `blogSubscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`subscribed` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blogSubscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `blogSubscribers_email_unique` UNIQUE(`email`)
);
