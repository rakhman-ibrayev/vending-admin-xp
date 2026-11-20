// The XP controller addresses motors as 1-based row/column, up to 10 rows x 10
// columns. The kiosk maps slot_index -> row/col (10 columns per row) and builds
// the serial frame itself (vending-xp/services/xp-frame.ts); the backend only
// needs the addressable slot limit for validation.
export const XP_MAX_SLOTS = 100
