#ki generiert
PRAGMA foreign_keys = ON;

INSERT INTO COUNTRY (id, name, is_democratic, population) VALUES
(1, 'Germany', 1, 83000000),
(2, 'France', 1, 67000000),
(3, 'Italy', 1, 59000000),
(4, 'China', 0, 1400000000);

INSERT INTO CITY (id, name, coordinates, population, country_id) VALUES
(1, 'Berlin', '52.52,13.40', 3600000, 1),
(2, 'Munich', '48.13,11.58', 1500000, 1),
(3, 'Paris', '48.85,2.35', 2100000, 2),
(4, 'Rome', '41.90,12.50', 2800000, 3),
(5, 'Beijing', '39.90,116.40', 21500000, 4);

INSERT INTO RIVER (id, name, length) VALUES
(1, 'Rhine', 1230),
(2, 'Danube', 2850),
(3, 'Seine', 777),
(4, 'Tiber', 405),
(5, 'Yellow River', 5464);

INSERT INTO LOCATED_ON (city_id, river_id) VALUES
(1, 2),  -- Berlin → Danube 
(2, 2),  -- Munich → Danube
(3, 3),  -- Paris → Seine
(4, 4),  -- Rome → Tiber
(5, 5);  -- Beijing → Yellow River

INSERT INTO HAS_RIVER (country_id, river_id) VALUES
(1, 1), -- Germany → Rhine
(1, 2), -- Germany → Danube
(2, 3), -- France → Seine
(3, 4), -- Italy → Tiber
(4, 5); -- China → Yellow River

INSERT INTO CAPITAL (country_id, capital_city_id) VALUES
(1, 1), -- Germany → Berlin
(2, 3), -- France → Paris
(3, 4), -- Italy → Rome
(4, 5); -- China → Beijing