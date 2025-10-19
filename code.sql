-- 1. Create the table
CREATE TABLE public.food_items
(
    id serial NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    storage_type character varying(50) NOT NULL,
    date_stored date NOT NULL,
    use_by_date date NOT NULL,
    days_left integer,
    PRIMARY KEY (id)
);

-- 2. Insert a test item
INSERT INTO public.food_items
(name, description, storage_type, date_stored, use_by_date, days_left)
VALUES
('Apples', 'Bag of 6 honeycrisp apples', 'pantry', '2025-10-07', '2025-10-20', 13);

-- 3. Query to verify the data
SELECT * FROM public.food_items;

