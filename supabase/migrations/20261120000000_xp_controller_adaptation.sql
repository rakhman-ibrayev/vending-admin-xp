-- XP controller adaptation: remove temperature columns, update serial/slot defaults
ALTER TABLE vending_machines
  DROP COLUMN IF EXISTS temperature,
  DROP COLUMN IF EXISTS target_temperature,
  ALTER COLUMN baud_rate SET DEFAULT 115200,
  -- XP addresses up to 10 rows x 10 columns; the target machine has 10 coils.
  -- num_slots stays configurable per machine (validated in the app, max 100).
  ALTER COLUMN num_slots SET DEFAULT 10;

-- Migrate existing machines to the new baud rate
UPDATE vending_machines SET baud_rate = 115200;
