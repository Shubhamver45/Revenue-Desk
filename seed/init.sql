-- ============================================================
-- Revenue Desk — Seed Database
-- Realistic sales data with a built-in "West region drop" story
-- and a hidden refund discrepancy for the Reviewer to catch.
-- ============================================================

-- ---- Schema ----

CREATE TABLE IF NOT EXISTS customers (
    id          INTEGER PRIMARY KEY,
    name        TEXT    NOT NULL,
    segment     TEXT    NOT NULL CHECK (segment IN ('enterprise','mid-market','smb')),
    region      TEXT    NOT NULL CHECK (region  IN ('west','east','central','south')),
    created_at  DATE    NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id          INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    amount      REAL    NOT NULL,
    order_date  DATE    NOT NULL,
    is_repeat   INTEGER NOT NULL DEFAULT 0   -- 0 = first purchase, 1 = repeat
);

CREATE TABLE IF NOT EXISTS refunds (
    id          INTEGER PRIMARY KEY,
    order_id    INTEGER NOT NULL REFERENCES orders(id),
    amount      REAL    NOT NULL,
    reason      TEXT    NOT NULL,
    refund_date DATE    NOT NULL
);

CREATE TABLE IF NOT EXISTS campaigns (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    target_segment  TEXT,
    target_region   TEXT,
    discount_pct    REAL    DEFAULT 10.0,
    status          TEXT    NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','proposed','approved','executed','rejected')),
    created_by      TEXT    NOT NULL,
    approved_by     TEXT,
    details         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at     TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaign_targets (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id   INTEGER NOT NULL REFERENCES campaigns(id),
    customer_id   INTEGER NOT NULL REFERENCES customers(id),
    message       TEXT
);

CREATE TABLE IF NOT EXISTS decision_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    decision    TEXT    NOT NULL,
    made_by     TEXT    NOT NULL,
    context     TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name          TEXT NOT NULL,
    company       TEXT NOT NULL DEFAULT 'Acme Cloud Inc.',
    role          TEXT NOT NULL DEFAULT 'VP Revenue Operations',
    provider      TEXT NOT NULL DEFAULT 'credentials',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id              INTEGER PRIMARY KEY,
    customer_id     INTEGER NOT NULL REFERENCES customers(id),
    mrr_amount      REAL    NOT NULL,
    status          TEXT    NOT NULL CHECK (status IN ('active','past_due','cancelled')),
    billing_cycle   TEXT    NOT NULL DEFAULT 'monthly',
    updated_at      DATE    NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id               INTEGER PRIMARY KEY,
    order_id         INTEGER REFERENCES orders(id),
    customer_id      INTEGER NOT NULL REFERENCES customers(id),
    amount           REAL    NOT NULL,
    settled_amount   REAL    NOT NULL,
    status           TEXT    NOT NULL CHECK (status IN ('settled','failed','processing','disputed')),
    gateway          TEXT    NOT NULL DEFAULT 'stripe',
    failure_reason   TEXT,
    transaction_date DATE    NOT NULL
);

INSERT OR IGNORE INTO users (id, email, password_hash, name, company, role, provider)
VALUES (1, 'alex.rivera@acmecloud.com', '376a619141d23f56e2287461cd7c2162b9c07db779a21278d86797e3430a1358', 'Alex Rivera', 'Acme Cloud Inc.', 'VP Revenue Operations', 'credentials');

-- ---- Customers (80 across 4 regions) ----

-- WEST region — 20 customers (includes 5 high-value enterprise that will lapse)
INSERT INTO customers VALUES (1,  'Westfield Industries',    'enterprise',  'west', '2025-12-01');
INSERT INTO customers VALUES (2,  'Pacific Solutions',       'enterprise',  'west', '2025-11-15');
INSERT INTO customers VALUES (3,  'Golden Gate Corp',        'enterprise',  'west', '2026-01-10');
INSERT INTO customers VALUES (4,  'Sierra Analytics',        'enterprise',  'west', '2025-10-20');
INSERT INTO customers VALUES (5,  'Redwood Partners',        'enterprise',  'west', '2025-09-05');
INSERT INTO customers VALUES (6,  'Bay Area Logistics',      'mid-market',  'west', '2026-02-14');
INSERT INTO customers VALUES (7,  'Cascade Systems',         'mid-market',  'west', '2026-03-01');
INSERT INTO customers VALUES (8,  'Sequoia Services',        'mid-market',  'west', '2026-01-20');
INSERT INTO customers VALUES (9,  'Olympic Tech',            'mid-market',  'west', '2026-04-10');
INSERT INTO customers VALUES (10, 'Crater Lake Digital',     'mid-market',  'west', '2026-05-01');
INSERT INTO customers VALUES (11, 'Portland Press',          'smb',         'west', '2026-03-15');
INSERT INTO customers VALUES (12, 'Sunset Bakery Supply',    'smb',         'west', '2026-04-20');
INSERT INTO customers VALUES (13, 'Valley Print Co',         'smb',         'west', '2026-02-28');
INSERT INTO customers VALUES (14, 'Napa Craft Goods',        'smb',         'west', '2026-05-10');
INSERT INTO customers VALUES (15, 'Tahoe Outfitters',        'smb',         'west', '2026-06-01');
INSERT INTO customers VALUES (16, 'Marina Del Rey Tech',     'smb',         'west', '2026-03-22');
INSERT INTO customers VALUES (17, 'SoCal Widgets',           'mid-market',  'west', '2026-04-15');
INSERT INTO customers VALUES (18, 'Desert Sun LLC',          'smb',         'west', '2026-05-30');
INSERT INTO customers VALUES (19, 'Cascade Coffee Roasters', 'smb',         'west', '2026-06-10');
INSERT INTO customers VALUES (20, 'Mount Shasta Supply',     'smb',         'west', '2026-07-01');

-- EAST region — 20 customers
INSERT INTO customers VALUES (21, 'Atlantic Holdings',       'enterprise',  'east', '2025-11-01');
INSERT INTO customers VALUES (22, 'Manhattan Solutions',      'enterprise',  'east', '2025-12-15');
INSERT INTO customers VALUES (23, 'Liberty Corp',            'enterprise',  'east', '2026-01-05');
INSERT INTO customers VALUES (24, 'Beacon Hill Group',       'enterprise',  'east', '2025-10-10');
INSERT INTO customers VALUES (25, 'Harbor Tech',             'enterprise',  'east', '2026-02-01');
INSERT INTO customers VALUES (26, 'Chesapeake Systems',      'mid-market',  'east', '2026-03-10');
INSERT INTO customers VALUES (27, 'Colonial Data',           'mid-market',  'east', '2026-01-25');
INSERT INTO customers VALUES (28, 'Patriot Services',        'mid-market',  'east', '2026-04-01');
INSERT INTO customers VALUES (29, 'Fenway Analytics',        'mid-market',  'east', '2026-02-20');
INSERT INTO customers VALUES (30, 'Capitol Systems',         'mid-market',  'east', '2026-05-15');
INSERT INTO customers VALUES (31, 'Brooklyn Bytes',          'smb',         'east', '2026-03-05');
INSERT INTO customers VALUES (32, 'Queens Digital',          'smb',         'east', '2026-04-12');
INSERT INTO customers VALUES (33, 'Philly Print Shop',       'smb',         'east', '2026-02-18');
INSERT INTO customers VALUES (34, 'Beantown Crafts',         'smb',         'east', '2026-05-22');
INSERT INTO customers VALUES (35, 'Cape Cod Supply',         'smb',         'east', '2026-06-08');
INSERT INTO customers VALUES (36, 'Hartford Hardware',       'smb',         'east', '2026-04-28');
INSERT INTO customers VALUES (37, 'Providence Tech',         'mid-market',  'east', '2026-05-05');
INSERT INTO customers VALUES (38, 'Newark Logistics',        'smb',         'east', '2026-06-15');
INSERT INTO customers VALUES (39, 'Baltimore Books',         'smb',         'east', '2026-07-02');
INSERT INTO customers VALUES (40, 'Richmond Supply Co',      'smb',         'east', '2026-07-10');

-- CENTRAL region — 20 customers
INSERT INTO customers VALUES (41, 'Heartland Industries',    'enterprise',  'central', '2025-11-20');
INSERT INTO customers VALUES (42, 'Prairie Solutions',       'enterprise',  'central', '2026-01-15');
INSERT INTO customers VALUES (43, 'Great Lakes Corp',        'enterprise',  'central', '2025-12-01');
INSERT INTO customers VALUES (44, 'Midwest Analytics',       'enterprise',  'central', '2026-02-10');
INSERT INTO customers VALUES (45, 'Plains Partners',         'enterprise',  'central', '2025-10-30');
INSERT INTO customers VALUES (46, 'Windy City Systems',      'mid-market',  'central', '2026-03-20');
INSERT INTO customers VALUES (47, 'Cornfield Data',          'mid-market',  'central', '2026-01-30');
INSERT INTO customers VALUES (48, 'Gateway Services',        'mid-market',  'central', '2026-04-05');
INSERT INTO customers VALUES (49, 'Twin Cities Tech',        'mid-market',  'central', '2026-02-25');
INSERT INTO customers VALUES (50, 'Badger Analytics',        'mid-market',  'central', '2026-05-10');
INSERT INTO customers VALUES (51, 'Des Moines Digital',      'smb',         'central', '2026-03-12');
INSERT INTO customers VALUES (52, 'Omaha Outfitters',        'smb',         'central', '2026-04-18');
INSERT INTO customers VALUES (53, 'Fargo Fresh Goods',       'smb',         'central', '2026-02-22');
INSERT INTO customers VALUES (54, 'Topeka Tools',            'smb',         'central', '2026-05-28');
INSERT INTO customers VALUES (55, 'Sioux Falls Supply',      'smb',         'central', '2026-06-05');
INSERT INTO customers VALUES (56, 'Wichita Widgets',         'smb',         'central', '2026-04-25');
INSERT INTO customers VALUES (57, 'Springfield Systems',     'mid-market',  'central', '2026-05-12');
INSERT INTO customers VALUES (58, 'Duluth Data',             'smb',         'central', '2026-06-18');
INSERT INTO customers VALUES (59, 'Bismarck Books',          'smb',         'central', '2026-07-05');
INSERT INTO customers VALUES (60, 'Lincoln Logistics',       'smb',         'central', '2026-07-15');

-- SOUTH region — 20 customers
INSERT INTO customers VALUES (61, 'Southern Holdings',       'enterprise',  'south', '2025-11-10');
INSERT INTO customers VALUES (62, 'Dixie Solutions',         'enterprise',  'south', '2025-12-20');
INSERT INTO customers VALUES (63, 'Magnolia Corp',           'enterprise',  'south', '2026-01-08');
INSERT INTO customers VALUES (64, 'Peachtree Analytics',     'enterprise',  'south', '2026-02-15');
INSERT INTO customers VALUES (65, 'Bayou Partners',          'enterprise',  'south', '2025-10-25');
INSERT INTO customers VALUES (66, 'Gulf Coast Systems',      'mid-market',  'south', '2026-03-18');
INSERT INTO customers VALUES (67, 'Palmetto Data',           'mid-market',  'south', '2026-01-28');
INSERT INTO customers VALUES (68, 'Bluegrass Services',      'mid-market',  'south', '2026-04-08');
INSERT INTO customers VALUES (69, 'Lone Star Tech',          'mid-market',  'south', '2026-02-22');
INSERT INTO customers VALUES (70, 'Ozark Analytics',         'mid-market',  'south', '2026-05-18');
INSERT INTO customers VALUES (71, 'Nashville Notes',         'smb',         'south', '2026-03-08');
INSERT INTO customers VALUES (72, 'Memphis Music Supply',    'smb',         'south', '2026-04-15');
INSERT INTO customers VALUES (73, 'Savannah Crafts',         'smb',         'south', '2026-02-25');
INSERT INTO customers VALUES (74, 'Charleston Goods',        'smb',         'south', '2026-05-25');
INSERT INTO customers VALUES (75, 'Key West Outfitters',     'smb',         'south', '2026-06-12');
INSERT INTO customers VALUES (76, 'Austin Artisans',         'smb',         'south', '2026-04-30');
INSERT INTO customers VALUES (77, 'Raleigh Robotics',        'mid-market',  'south', '2026-05-08');
INSERT INTO customers VALUES (78, 'Tampa Tools',             'smb',         'south', '2026-06-20');
INSERT INTO customers VALUES (79, 'Charlotte Coffee',        'smb',         'south', '2026-07-08');
INSERT INTO customers VALUES (80, 'Jacksonville Supply',     'smb',         'south', '2026-07-18');


-- ============================================================
-- ORDERS — ~500 orders across June–October 2026
--
-- THE STORY:
--   West enterprise customers (IDs 1-5) placed large repeat orders
--   every month from June–September. In October they all went silent.
--   This is the "drop" the manager will ask about.
--
-- THE TRAP (for the Analyst to miss):
--   8 orders in Oct for West mid-market customers were later refunded.
--   A naive query counting Oct orders will overcount West revenue.
--   The Reviewer's query will subtract refunds and get different numbers.
-- ============================================================

-- === JUNE 2026 ===
-- West enterprise — strong repeat orders
INSERT INTO orders VALUES (1,   1,  12500.00, '2026-06-03', 1);
INSERT INTO orders VALUES (2,   2,  9800.00,  '2026-06-05', 1);
INSERT INTO orders VALUES (3,   3,  15200.00, '2026-06-08', 1);
INSERT INTO orders VALUES (4,   4,  11000.00, '2026-06-10', 1);
INSERT INTO orders VALUES (5,   5,  8700.00,  '2026-06-12', 1);
-- West mid-market & SMB
INSERT INTO orders VALUES (6,   6,  3200.00,  '2026-06-04', 1);
INSERT INTO orders VALUES (7,   7,  2800.00,  '2026-06-07', 1);
INSERT INTO orders VALUES (8,   8,  4100.00,  '2026-06-11', 1);
INSERT INTO orders VALUES (9,   11, 850.00,   '2026-06-15', 1);
INSERT INTO orders VALUES (10,  12, 620.00,   '2026-06-18', 0);
INSERT INTO orders VALUES (11,  13, 1200.00,  '2026-06-20', 1);
INSERT INTO orders VALUES (12,  14, 540.00,   '2026-06-22', 0);
-- East — steady
INSERT INTO orders VALUES (13,  21, 14000.00, '2026-06-02', 1);
INSERT INTO orders VALUES (14,  22, 11500.00, '2026-06-06', 1);
INSERT INTO orders VALUES (15,  23, 9200.00,  '2026-06-09', 1);
INSERT INTO orders VALUES (16,  24, 13800.00, '2026-06-13', 1);
INSERT INTO orders VALUES (17,  25, 7600.00,  '2026-06-16', 1);
INSERT INTO orders VALUES (18,  26, 3500.00,  '2026-06-04', 1);
INSERT INTO orders VALUES (19,  27, 2900.00,  '2026-06-08', 1);
INSERT INTO orders VALUES (20,  31, 780.00,   '2026-06-19', 0);
INSERT INTO orders VALUES (21,  32, 920.00,   '2026-06-21', 1);
INSERT INTO orders VALUES (22,  33, 1100.00,  '2026-06-24', 1);
-- Central — steady
INSERT INTO orders VALUES (23,  41, 12000.00, '2026-06-03', 1);
INSERT INTO orders VALUES (24,  42, 10500.00, '2026-06-07', 1);
INSERT INTO orders VALUES (25,  43, 8800.00,  '2026-06-10', 1);
INSERT INTO orders VALUES (26,  44, 11200.00, '2026-06-14', 1);
INSERT INTO orders VALUES (27,  45, 9500.00,  '2026-06-17', 1);
INSERT INTO orders VALUES (28,  46, 3800.00,  '2026-06-05', 1);
INSERT INTO orders VALUES (29,  47, 2600.00,  '2026-06-09', 1);
INSERT INTO orders VALUES (30,  51, 690.00,   '2026-06-20', 0);
INSERT INTO orders VALUES (31,  52, 810.00,   '2026-06-23', 1);
-- South — steady
INSERT INTO orders VALUES (32,  61, 13500.00, '2026-06-04', 1);
INSERT INTO orders VALUES (33,  62, 10800.00, '2026-06-08', 1);
INSERT INTO orders VALUES (34,  63, 9600.00,  '2026-06-11', 1);
INSERT INTO orders VALUES (35,  64, 12200.00, '2026-06-15', 1);
INSERT INTO orders VALUES (36,  65, 8400.00,  '2026-06-18', 1);
INSERT INTO orders VALUES (37,  66, 3300.00,  '2026-06-06', 1);
INSERT INTO orders VALUES (38,  67, 2700.00,  '2026-06-10', 1);
INSERT INTO orders VALUES (39,  71, 720.00,   '2026-06-21', 0);
INSERT INTO orders VALUES (40,  72, 880.00,   '2026-06-25', 1);

-- === JULY 2026 ===
-- West enterprise — strong repeat orders continue
INSERT INTO orders VALUES (41,  1,  13100.00, '2026-07-02', 1);
INSERT INTO orders VALUES (42,  2,  10200.00, '2026-07-05', 1);
INSERT INTO orders VALUES (43,  3,  14800.00, '2026-07-08', 1);
INSERT INTO orders VALUES (44,  4,  11500.00, '2026-07-11', 1);
INSERT INTO orders VALUES (45,  5,  9200.00,  '2026-07-14', 1);
-- West others
INSERT INTO orders VALUES (46,  6,  3400.00,  '2026-07-03', 1);
INSERT INTO orders VALUES (47,  7,  2950.00,  '2026-07-06', 1);
INSERT INTO orders VALUES (48,  9,  3800.00,  '2026-07-09', 0);
INSERT INTO orders VALUES (49,  10, 2200.00,  '2026-07-12', 0);
INSERT INTO orders VALUES (50,  11, 900.00,   '2026-07-15', 1);
INSERT INTO orders VALUES (51,  13, 1350.00,  '2026-07-18', 1);
INSERT INTO orders VALUES (52,  15, 480.00,   '2026-07-20', 0);
INSERT INTO orders VALUES (53,  16, 750.00,   '2026-07-22', 1);
-- East
INSERT INTO orders VALUES (54,  21, 14500.00, '2026-07-01', 1);
INSERT INTO orders VALUES (55,  22, 12000.00, '2026-07-04', 1);
INSERT INTO orders VALUES (56,  23, 9800.00,  '2026-07-07', 1);
INSERT INTO orders VALUES (57,  24, 14200.00, '2026-07-10', 1);
INSERT INTO orders VALUES (58,  25, 8100.00,  '2026-07-13', 1);
INSERT INTO orders VALUES (59,  26, 3700.00,  '2026-07-03', 1);
INSERT INTO orders VALUES (60,  28, 4200.00,  '2026-07-06', 0);
INSERT INTO orders VALUES (61,  31, 820.00,   '2026-07-16', 1);
INSERT INTO orders VALUES (62,  34, 670.00,   '2026-07-19', 0);
INSERT INTO orders VALUES (63,  35, 590.00,   '2026-07-21', 0);
-- Central
INSERT INTO orders VALUES (64,  41, 12800.00, '2026-07-02', 1);
INSERT INTO orders VALUES (65,  42, 10900.00, '2026-07-05', 1);
INSERT INTO orders VALUES (66,  43, 9200.00,  '2026-07-08', 1);
INSERT INTO orders VALUES (67,  44, 11800.00, '2026-07-11', 1);
INSERT INTO orders VALUES (68,  45, 9800.00,  '2026-07-14', 1);
INSERT INTO orders VALUES (69,  46, 4000.00,  '2026-07-04', 1);
INSERT INTO orders VALUES (70,  48, 3600.00,  '2026-07-07', 0);
INSERT INTO orders VALUES (71,  51, 720.00,   '2026-07-17', 1);
INSERT INTO orders VALUES (72,  53, 580.00,   '2026-07-20', 1);
-- South
INSERT INTO orders VALUES (73,  61, 14000.00, '2026-07-03', 1);
INSERT INTO orders VALUES (74,  62, 11200.00, '2026-07-06', 1);
INSERT INTO orders VALUES (75,  63, 10100.00, '2026-07-09', 1);
INSERT INTO orders VALUES (76,  64, 12800.00, '2026-07-12', 1);
INSERT INTO orders VALUES (77,  65, 8900.00,  '2026-07-15', 1);
INSERT INTO orders VALUES (78,  66, 3500.00,  '2026-07-05', 1);
INSERT INTO orders VALUES (79,  68, 3900.00,  '2026-07-08', 0);
INSERT INTO orders VALUES (80,  71, 760.00,   '2026-07-18', 1);
INSERT INTO orders VALUES (81,  73, 640.00,   '2026-07-22', 1);

-- === AUGUST 2026 ===
-- West enterprise — still strong
INSERT INTO orders VALUES (82,  1,  12800.00, '2026-08-04', 1);
INSERT INTO orders VALUES (83,  2,  10500.00, '2026-08-06', 1);
INSERT INTO orders VALUES (84,  3,  15500.00, '2026-08-09', 1);
INSERT INTO orders VALUES (85,  4,  10800.00, '2026-08-12', 1);
INSERT INTO orders VALUES (86,  5,  9500.00,  '2026-08-15', 1);
-- West others
INSERT INTO orders VALUES (87,  6,  3600.00,  '2026-08-03', 1);
INSERT INTO orders VALUES (88,  8,  4300.00,  '2026-08-07', 1);
INSERT INTO orders VALUES (89,  9,  3900.00,  '2026-08-10', 1);
INSERT INTO orders VALUES (90,  10, 2400.00,  '2026-08-13', 1);
INSERT INTO orders VALUES (91,  11, 950.00,   '2026-08-16', 1);
INSERT INTO orders VALUES (92,  14, 580.00,   '2026-08-19', 1);
INSERT INTO orders VALUES (93,  17, 3100.00,  '2026-08-21', 1);
INSERT INTO orders VALUES (94,  18, 420.00,   '2026-08-23', 0);
-- East
INSERT INTO orders VALUES (95,  21, 13800.00, '2026-08-03', 1);
INSERT INTO orders VALUES (96,  22, 11800.00, '2026-08-05', 1);
INSERT INTO orders VALUES (97,  23, 9500.00,  '2026-08-08', 1);
INSERT INTO orders VALUES (98,  24, 13500.00, '2026-08-11', 1);
INSERT INTO orders VALUES (99,  25, 7800.00,  '2026-08-14', 1);
INSERT INTO orders VALUES (100, 26, 3600.00,  '2026-08-04', 1);
INSERT INTO orders VALUES (101, 27, 3100.00,  '2026-08-07', 1);
INSERT INTO orders VALUES (102, 29, 3400.00,  '2026-08-10', 1);
INSERT INTO orders VALUES (103, 31, 850.00,   '2026-08-17', 1);
INSERT INTO orders VALUES (104, 32, 960.00,   '2026-08-20', 1);
INSERT INTO orders VALUES (105, 36, 1100.00,  '2026-08-22', 0);
-- Central
INSERT INTO orders VALUES (106, 41, 13200.00, '2026-08-02', 1);
INSERT INTO orders VALUES (107, 42, 11100.00, '2026-08-05', 1);
INSERT INTO orders VALUES (108, 43, 9500.00,  '2026-08-08', 1);
INSERT INTO orders VALUES (109, 44, 12000.00, '2026-08-11', 1);
INSERT INTO orders VALUES (110, 45, 10100.00, '2026-08-14', 1);
INSERT INTO orders VALUES (111, 46, 4200.00,  '2026-08-03', 1);
INSERT INTO orders VALUES (112, 47, 2800.00,  '2026-08-06', 1);
INSERT INTO orders VALUES (113, 49, 3500.00,  '2026-08-09', 1);
INSERT INTO orders VALUES (114, 52, 850.00,   '2026-08-18', 1);
INSERT INTO orders VALUES (115, 54, 620.00,   '2026-08-21', 0);
-- South
INSERT INTO orders VALUES (116, 61, 13800.00, '2026-08-04', 1);
INSERT INTO orders VALUES (117, 62, 11500.00, '2026-08-07', 1);
INSERT INTO orders VALUES (118, 63, 9900.00,  '2026-08-10', 1);
INSERT INTO orders VALUES (119, 64, 12500.00, '2026-08-13', 1);
INSERT INTO orders VALUES (120, 65, 8600.00,  '2026-08-16', 1);
INSERT INTO orders VALUES (121, 66, 3400.00,  '2026-08-05', 1);
INSERT INTO orders VALUES (122, 67, 2900.00,  '2026-08-08', 1);
INSERT INTO orders VALUES (123, 69, 3200.00,  '2026-08-11', 1);
INSERT INTO orders VALUES (124, 72, 920.00,   '2026-08-19', 1);
INSERT INTO orders VALUES (125, 74, 560.00,   '2026-08-22', 0);

-- === SEPTEMBER 2026 ===
-- West enterprise — LAST month of strong repeat orders
INSERT INTO orders VALUES (126, 1,  13500.00, '2026-09-02', 1);
INSERT INTO orders VALUES (127, 2,  10800.00, '2026-09-04', 1);
INSERT INTO orders VALUES (128, 3,  16000.00, '2026-09-07', 1);
INSERT INTO orders VALUES (129, 4,  11200.00, '2026-09-10', 1);
INSERT INTO orders VALUES (130, 5,  9800.00,  '2026-09-13', 1);
-- West others
INSERT INTO orders VALUES (131, 6,  3500.00,  '2026-09-03', 1);
INSERT INTO orders VALUES (132, 7,  3100.00,  '2026-09-06', 1);
INSERT INTO orders VALUES (133, 8,  4500.00,  '2026-09-09', 1);
INSERT INTO orders VALUES (134, 9,  4000.00,  '2026-09-12', 1);
INSERT INTO orders VALUES (135, 10, 2500.00,  '2026-09-15', 1);
INSERT INTO orders VALUES (136, 11, 1000.00,  '2026-09-18', 1);
INSERT INTO orders VALUES (137, 12, 680.00,   '2026-09-20', 1);
INSERT INTO orders VALUES (138, 16, 800.00,   '2026-09-22', 1);
INSERT INTO orders VALUES (139, 17, 3300.00,  '2026-09-24', 1);
INSERT INTO orders VALUES (140, 19, 350.00,   '2026-09-26', 0);
-- East
INSERT INTO orders VALUES (141, 21, 14200.00, '2026-09-01', 1);
INSERT INTO orders VALUES (142, 22, 12200.00, '2026-09-03', 1);
INSERT INTO orders VALUES (143, 23, 9900.00,  '2026-09-06', 1);
INSERT INTO orders VALUES (144, 24, 14000.00, '2026-09-09', 1);
INSERT INTO orders VALUES (145, 25, 8200.00,  '2026-09-12', 1);
INSERT INTO orders VALUES (146, 26, 3800.00,  '2026-09-02', 1);
INSERT INTO orders VALUES (147, 27, 3200.00,  '2026-09-05', 1);
INSERT INTO orders VALUES (148, 28, 4500.00,  '2026-09-08', 1);
INSERT INTO orders VALUES (149, 30, 3000.00,  '2026-09-11', 0);
INSERT INTO orders VALUES (150, 31, 890.00,   '2026-09-15', 1);
INSERT INTO orders VALUES (151, 33, 1150.00,  '2026-09-18', 1);
INSERT INTO orders VALUES (152, 37, 3600.00,  '2026-09-20', 1);
-- Central
INSERT INTO orders VALUES (153, 41, 13500.00, '2026-09-03', 1);
INSERT INTO orders VALUES (154, 42, 11500.00, '2026-09-05', 1);
INSERT INTO orders VALUES (155, 43, 9800.00,  '2026-09-08', 1);
INSERT INTO orders VALUES (156, 44, 12300.00, '2026-09-11', 1);
INSERT INTO orders VALUES (157, 45, 10500.00, '2026-09-14', 1);
INSERT INTO orders VALUES (158, 46, 4300.00,  '2026-09-04', 1);
INSERT INTO orders VALUES (159, 47, 2900.00,  '2026-09-07', 1);
INSERT INTO orders VALUES (160, 48, 3800.00,  '2026-09-10', 1);
INSERT INTO orders VALUES (161, 50, 2800.00,  '2026-09-13', 0);
INSERT INTO orders VALUES (162, 51, 750.00,   '2026-09-17', 1);
INSERT INTO orders VALUES (163, 55, 500.00,   '2026-09-20', 0);
INSERT INTO orders VALUES (164, 57, 3500.00,  '2026-09-22', 1);
-- South
INSERT INTO orders VALUES (165, 61, 14200.00, '2026-09-02', 1);
INSERT INTO orders VALUES (166, 62, 11800.00, '2026-09-04', 1);
INSERT INTO orders VALUES (167, 63, 10200.00, '2026-09-07', 1);
INSERT INTO orders VALUES (168, 64, 13000.00, '2026-09-10', 1);
INSERT INTO orders VALUES (169, 65, 9100.00,  '2026-09-13', 1);
INSERT INTO orders VALUES (170, 66, 3600.00,  '2026-09-03', 1);
INSERT INTO orders VALUES (171, 67, 3000.00,  '2026-09-06', 1);
INSERT INTO orders VALUES (172, 68, 4100.00,  '2026-09-09', 1);
INSERT INTO orders VALUES (173, 70, 2600.00,  '2026-09-12', 0);
INSERT INTO orders VALUES (174, 71, 800.00,   '2026-09-16', 1);
INSERT INTO orders VALUES (175, 76, 520.00,   '2026-09-19', 1);
INSERT INTO orders VALUES (176, 77, 3400.00,  '2026-09-21', 1);

-- === OCTOBER 2026 ===
-- *** THE DROP: West enterprise customers 1-5 place ZERO orders ***
-- West mid-market & SMB — some orders, BUT 8 of them will be refunded (the trap!)
INSERT INTO orders VALUES (177, 6,  3200.00,  '2026-10-02', 1);  -- will be refunded
INSERT INTO orders VALUES (178, 7,  2800.00,  '2026-10-04', 1);  -- will be refunded
INSERT INTO orders VALUES (179, 8,  4000.00,  '2026-10-07', 1);  -- will be refunded
INSERT INTO orders VALUES (180, 9,  3700.00,  '2026-10-09', 1);  -- will be refunded
INSERT INTO orders VALUES (181, 10, 2300.00,  '2026-10-11', 1);  -- will be refunded
INSERT INTO orders VALUES (182, 17, 2900.00,  '2026-10-14', 1);  -- will be refunded
INSERT INTO orders VALUES (183, 11, 880.00,   '2026-10-16', 1);  -- will be refunded
INSERT INTO orders VALUES (184, 12, 650.00,   '2026-10-18', 1);  -- will be refunded
INSERT INTO orders VALUES (185, 13, 1100.00,  '2026-10-20', 1);  -- NOT refunded (legit)
INSERT INTO orders VALUES (186, 14, 520.00,   '2026-10-22', 1);  -- NOT refunded
INSERT INTO orders VALUES (187, 15, 430.00,   '2026-10-24', 0);  -- NOT refunded (first purchase)
INSERT INTO orders VALUES (188, 16, 780.00,   '2026-10-26', 1);  -- NOT refunded
INSERT INTO orders VALUES (189, 18, 380.00,   '2026-10-28', 0);  -- NOT refunded
INSERT INTO orders VALUES (190, 19, 320.00,   '2026-10-29', 1);  -- NOT refunded
INSERT INTO orders VALUES (191, 20, 290.00,   '2026-10-30', 0);  -- NOT refunded

-- East — steady (slightly up)
INSERT INTO orders VALUES (192, 21, 14800.00, '2026-10-01', 1);
INSERT INTO orders VALUES (193, 22, 12500.00, '2026-10-03', 1);
INSERT INTO orders VALUES (194, 23, 10200.00, '2026-10-06', 1);
INSERT INTO orders VALUES (195, 24, 14500.00, '2026-10-08', 1);
INSERT INTO orders VALUES (196, 25, 8500.00,  '2026-10-10', 1);
INSERT INTO orders VALUES (197, 26, 3900.00,  '2026-10-02', 1);
INSERT INTO orders VALUES (198, 27, 3300.00,  '2026-10-05', 1);
INSERT INTO orders VALUES (199, 28, 4600.00,  '2026-10-08', 1);
INSERT INTO orders VALUES (200, 29, 3500.00,  '2026-10-11', 1);
INSERT INTO orders VALUES (201, 30, 3200.00,  '2026-10-14', 1);
INSERT INTO orders VALUES (202, 31, 920.00,   '2026-10-17', 1);
INSERT INTO orders VALUES (203, 32, 980.00,   '2026-10-19', 1);
INSERT INTO orders VALUES (204, 33, 1200.00,  '2026-10-21', 1);
INSERT INTO orders VALUES (205, 34, 700.00,   '2026-10-23', 1);
INSERT INTO orders VALUES (206, 37, 3800.00,  '2026-10-25', 1);
INSERT INTO orders VALUES (207, 38, 450.00,   '2026-10-27', 0);

-- Central — steady
INSERT INTO orders VALUES (208, 41, 13800.00, '2026-10-02', 1);
INSERT INTO orders VALUES (209, 42, 11800.00, '2026-10-04', 1);
INSERT INTO orders VALUES (210, 43, 10000.00, '2026-10-07', 1);
INSERT INTO orders VALUES (211, 44, 12500.00, '2026-10-09', 1);
INSERT INTO orders VALUES (212, 45, 10800.00, '2026-10-12', 1);
INSERT INTO orders VALUES (213, 46, 4400.00,  '2026-10-03', 1);
INSERT INTO orders VALUES (214, 47, 3000.00,  '2026-10-06', 1);
INSERT INTO orders VALUES (215, 48, 4000.00,  '2026-10-09', 1);
INSERT INTO orders VALUES (216, 49, 3600.00,  '2026-10-12', 1);
INSERT INTO orders VALUES (217, 50, 3000.00,  '2026-10-15', 1);
INSERT INTO orders VALUES (218, 51, 780.00,   '2026-10-18', 1);
INSERT INTO orders VALUES (219, 52, 880.00,   '2026-10-20', 1);
INSERT INTO orders VALUES (220, 56, 600.00,   '2026-10-22', 1);
INSERT INTO orders VALUES (221, 57, 3700.00,  '2026-10-24', 1);
INSERT INTO orders VALUES (222, 58, 420.00,   '2026-10-26', 0);

-- South — steady
INSERT INTO orders VALUES (223, 61, 14500.00, '2026-10-01', 1);
INSERT INTO orders VALUES (224, 62, 12000.00, '2026-10-03', 1);
INSERT INTO orders VALUES (225, 63, 10500.00, '2026-10-06', 1);
INSERT INTO orders VALUES (226, 64, 13200.00, '2026-10-08', 1);
INSERT INTO orders VALUES (227, 65, 9300.00,  '2026-10-11', 1);
INSERT INTO orders VALUES (228, 66, 3700.00,  '2026-10-02', 1);
INSERT INTO orders VALUES (229, 67, 3100.00,  '2026-10-05', 1);
INSERT INTO orders VALUES (230, 68, 4300.00,  '2026-10-08', 1);
INSERT INTO orders VALUES (231, 69, 3300.00,  '2026-10-11', 1);
INSERT INTO orders VALUES (232, 70, 2800.00,  '2026-10-14', 1);
INSERT INTO orders VALUES (233, 71, 840.00,   '2026-10-17', 1);
INSERT INTO orders VALUES (234, 72, 950.00,   '2026-10-19', 1);
INSERT INTO orders VALUES (235, 74, 580.00,   '2026-10-21', 1);
INSERT INTO orders VALUES (236, 77, 3600.00,  '2026-10-23', 1);
INSERT INTO orders VALUES (237, 78, 480.00,   '2026-10-25', 0);


-- ============================================================
-- REFUNDS — The hidden trap
-- 8 October West orders were refunded due to a pricing system glitch.
-- A naive "total October revenue" query will overcount by ~$20,430.
-- ============================================================

INSERT INTO refunds VALUES (1, 177, 3200.00,  'Pricing system glitch — duplicate charge',     '2026-10-15');
INSERT INTO refunds VALUES (2, 178, 2800.00,  'Pricing system glitch — incorrect rate applied','2026-10-15');
INSERT INTO refunds VALUES (3, 179, 4000.00,  'Pricing system glitch — duplicate charge',     '2026-10-16');
INSERT INTO refunds VALUES (4, 180, 3700.00,  'Pricing system glitch — incorrect rate applied','2026-10-16');
INSERT INTO refunds VALUES (5, 181, 2300.00,  'Pricing system glitch — duplicate charge',     '2026-10-17');
INSERT INTO refunds VALUES (6, 182, 2900.00,  'Pricing system glitch — incorrect rate applied','2026-10-17');
INSERT INTO refunds VALUES (7, 183, 880.00,   'Pricing system glitch — duplicate charge',     '2026-10-18');
INSERT INTO refunds VALUES (8, 184, 650.00,   'Pricing system glitch — duplicate charge',     '2026-10-18');

-- Total refunded: $20,430.00
-- These were all "repeat" orders, so they inflate both revenue AND repeat-order counts


-- ============================================================
-- Summary of the baked-in story:
--
-- September West repeat revenue from enterprise (IDs 1-5):
--   $13,500 + $10,800 + $16,000 + $11,200 + $9,800 = $61,300
--
-- October West enterprise repeat revenue: $0 (they all churned)
--
-- October West total orders (naive): 15 orders, $24,250
-- October West total orders (after refunds): 7 orders, $3,820
-- October West repeat orders (naive): 12 repeat orders
-- October West repeat orders (after refunds): 4 repeat orders
--
-- The Analyst will likely report ~$24K in West Oct revenue with
-- 12 repeat orders. The Reviewer will catch that $20,430 was
-- refunded, leaving only $3,820 net revenue and 4 real repeat orders.
-- The true story is even worse than the Analyst initially reports.
-- ============================================================

-- ============================================================
-- SCENARIO 2: Subscriptions & Recurring Revenue (Churn vs Payment Failures)
-- 4 enterprise accounts (IDs 1-4) marked past_due in October
-- because of expired card webhook failures ($14,200 MRR total), NOT actual cancellation.
-- ============================================================

INSERT INTO subscriptions VALUES (1, 1, 3500.00, 'past_due',  'monthly', '2026-10-12');
INSERT INTO subscriptions VALUES (2, 2, 4200.00, 'past_due',  'monthly', '2026-10-14');
INSERT INTO subscriptions VALUES (3, 3, 3800.00, 'past_due',  'monthly', '2026-10-15');
INSERT INTO subscriptions VALUES (4, 4, 2700.00, 'past_due',  'monthly', '2026-10-18');
INSERT INTO subscriptions VALUES (5, 5, 4500.00, 'cancelled', 'monthly', '2026-10-02');
INSERT INTO subscriptions VALUES (6, 6, 1200.00, 'active',    'monthly', '2026-10-01');
INSERT INTO subscriptions VALUES (7, 7, 1800.00, 'active',    'monthly', '2026-10-01');
INSERT INTO subscriptions VALUES (8, 8, 2200.00, 'active',    'monthly', '2026-10-01');
INSERT INTO subscriptions VALUES (9, 9, 1500.00, 'active',    'monthly', '2026-10-01');
INSERT INTO subscriptions VALUES (10, 10, 1900.00, 'active',   'monthly', '2026-10-01');

-- Payment transactions for Scenario 2 & 3:
INSERT INTO payment_transactions VALUES (1, 177, 1, 3500.00, 0.00,    'failed',     'stripe', 'expired_card',        '2026-10-12');
INSERT INTO payment_transactions VALUES (2, 178, 2, 4200.00, 0.00,    'failed',     'stripe', 'expired_card',        '2026-10-14');
INSERT INTO payment_transactions VALUES (3, 179, 3, 3800.00, 0.00,    'failed',     'stripe', 'expired_card',        '2026-10-15');
INSERT INTO payment_transactions VALUES (4, 180, 4, 2700.00, 0.00,    'failed',     'stripe', 'expired_card',        '2026-10-18');
INSERT INTO payment_transactions VALUES (5, 185, 6, 1200.00, 1200.00, 'settled',    'stripe', NULL,                  '2026-10-01');
INSERT INTO payment_transactions VALUES (6, 186, 7, 1800.00, 1800.00, 'settled',    'stripe', NULL,                  '2026-10-01');

-- SCENARIO 3: Sales ledger vs Payment gateway reconciliation differences ($4,120 discrepancy)
INSERT INTO payment_transactions VALUES (7, 201, 21, 6200.00, 4100.00, 'disputed',   'adyen',  'chargeback_hold',     '2026-10-08');
INSERT INTO payment_transactions VALUES (8, 202, 22, 5400.00, 3380.00, 'processing', 'adyen',  'fx_conversion_delay', '2026-10-11');


