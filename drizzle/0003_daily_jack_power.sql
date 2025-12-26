CREATE TABLE `auth_tokens` (
	`uuid` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`token` varchar(255),
	`otp` varchar(6),
	`type` varchar(50) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auth_tokens_uuid` PRIMARY KEY(`uuid`)
);
--> statement-breakpoint
ALTER TABLE `refresh_tokens` MODIFY COLUMN `user_id` char(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `auth_tokens` ADD CONSTRAINT `auth_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;