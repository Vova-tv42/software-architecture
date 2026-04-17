ALTER TABLE "plugin_settings" ADD COLUMN "config_values" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "plugin_settings" DROP COLUMN "threshold_value";