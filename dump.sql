--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5 (Ubuntu 17.5-1.pgdg22.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: provinsi_enum; Type: TYPE; Schema: public; Owner: mbgku_owner
--

CREATE TYPE public.provinsi_enum AS ENUM (
    'Aceh',
    'Sumatera Utara',
    'Sumatera Barat',
    'Riau',
    'Kepulauan Riau',
    'Jambi',
    'Sumatera Selatan',
    'Bangka Belitung',
    'Bengkulu',
    'Lampung',
    'DKI Jakarta',
    'Jawa Barat',
    'Banten',
    'Jawa Tengah',
    'DI Yogyakarta',
    'Jawa Timur',
    'Bali',
    'Nusa Tenggara Barat',
    'Nusa Tenggara Timur',
    'Kalimantan Barat',
    'Kalimantan Tengah',
    'Kalimantan Selatan',
    'Kalimantan Timur',
    'Kalimantan Utara',
    'Sulawesi Utara',
    'Gorontalo',
    'Sulawesi Tengah',
    'Sulawesi Barat',
    'Sulawesi Selatan',
    'Sulawesi Tenggara',
    'Maluku',
    'Maluku Utara',
    'Papua',
    'Papua Tengah',
    'Papua Pegunungan',
    'Papua Selatan',
    'Papua Barat',
    'Papua Barat Daya'
);


ALTER TYPE public.provinsi_enum OWNER TO mbgku_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: governments; Type: TABLE; Schema: public; Owner: mbgku_owner
--

CREATE TABLE public.governments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    province_id text NOT NULL,
    password text NOT NULL,
    province public.provinsi_enum NOT NULL,
    contact_name text NOT NULL,
    contact_email text NOT NULL,
    contact_phone text,
    created_at timestamp with time zone
);


ALTER TABLE public.governments OWNER TO mbgku_owner;

--
-- Name: menus; Type: TABLE; Schema: public; Owner: mbgku_owner
--

CREATE TABLE public.menus (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    date date NOT NULL,
    price_per_portion integer NOT NULL,
    created_by uuid,
    image_url text,
    created_at timestamp with time zone
);


ALTER TABLE public.menus OWNER TO mbgku_owner;

--
-- Name: reception_logs; Type: TABLE; Schema: public; Owner: mbgku_owner
--

CREATE TABLE public.reception_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    school_menu_allocation_id uuid,
    received_at timestamp with time zone DEFAULT now(),
    date date NOT NULL,
    created_at timestamp with time zone
);


ALTER TABLE public.reception_logs OWNER TO mbgku_owner;

--
-- Name: school_menu_allocations; Type: TABLE; Schema: public; Owner: mbgku_owner
--

CREATE TABLE public.school_menu_allocations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    school_id uuid,
    menu_id uuid,
    date date NOT NULL,
    quantity integer NOT NULL,
    created_at timestamp with time zone
);


ALTER TABLE public.school_menu_allocations OWNER TO mbgku_owner;

--
-- Name: schools; Type: TABLE; Schema: public; Owner: mbgku_owner
--

CREATE TABLE public.schools (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    npsn text NOT NULL,
    school_id text NOT NULL,
    password text NOT NULL,
    address text,
    contact_person text,
    contact_email text,
    contact_phone text,
    government_id uuid,
    updated_at timestamp with time zone,
    created_at timestamp with time zone
);


ALTER TABLE public.schools OWNER TO mbgku_owner;

--
-- Name: students; Type: TABLE; Schema: public; Owner: mbgku_owner
--

CREATE TABLE public.students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    student_number text NOT NULL,
    class text NOT NULL,
    grade integer NOT NULL,
    address text,
    gender text,
    birth_date date,
    school_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    password text NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT users_gender_check CHECK ((gender = ANY (ARRAY['Laki-laki'::text, 'Perempuan'::text])))
);


ALTER TABLE public.students OWNER TO mbgku_owner;

--
-- Data for Name: governments; Type: TABLE DATA; Schema: public; Owner: mbgku_owner
--

COPY public.governments (id, province_id, password, province, contact_name, contact_email, contact_phone, created_at) FROM stdin;
2ab94e10-0ca5-4923-a075-0900d90be346	JKT	jaksel	Nusa Tenggara Barat	Christian	tian@gmail.com	082113383767	2025-05-27 06:25:25.734485+00
\.


--
-- Data for Name: menus; Type: TABLE DATA; Schema: public; Owner: mbgku_owner
--

COPY public.menus (id, name, description, date, price_per_portion, created_by, image_url, created_at) FROM stdin;
99b606fb-d834-4570-a6bd-44c600832493	Gado Gado	sehat sempurna	2025-05-27	10001	2ab94e10-0ca5-4923-a075-0900d90be346		2025-05-27 06:24:58.67828+00
a6959fd8-f3d7-4594-ac4a-99ea02c880a1	Nasi Goreng Kambing	\N	2025-05-27	15000	\N		2025-05-27 06:24:58.705709+00
aa7a0963-dbe1-48b6-9650-4ac499df7cd6	Nasi Goreng Kambing	enak kali la	2025-05-27	15000	2ab94e10-0ca5-4923-a075-0900d90be346		2025-05-27 06:24:58.732582+00
\.


--
-- Data for Name: reception_logs; Type: TABLE DATA; Schema: public; Owner: mbgku_owner
--

COPY public.reception_logs (id, user_id, school_menu_allocation_id, received_at, date, created_at) FROM stdin;
4898b5f0-6970-4ed2-8e22-143a86d1684d	c7e27366-2c1c-4f8a-8f87-ccfb748fd016	4db6a77c-70ae-48dd-81ac-f44b45c5403d	2025-05-27 06:34:24.237751+00	2025-05-27	\N
\.


--
-- Data for Name: school_menu_allocations; Type: TABLE DATA; Schema: public; Owner: mbgku_owner
--

COPY public.school_menu_allocations (id, school_id, menu_id, date, quantity, created_at) FROM stdin;
4db6a77c-70ae-48dd-81ac-f44b45c5403d	72431142-83b0-447e-bf77-b6ab31a9150a	99b606fb-d834-4570-a6bd-44c600832493	2025-05-27	10	2025-05-27 06:26:14.846632+00
592717fc-5f12-4c8a-b051-b0d76ecee7bb	72431142-83b0-447e-bf77-b6ab31a9150a	aa7a0963-dbe1-48b6-9650-4ac499df7cd6	2025-05-27	50	2025-05-27 06:26:14.873542+00
\.


--
-- Data for Name: schools; Type: TABLE DATA; Schema: public; Owner: mbgku_owner
--

COPY public.schools (id, name, npsn, school_id, password, address, contact_person, contact_email, contact_phone, government_id, updated_at, created_at) FROM stdin;
72431142-83b0-447e-bf77-b6ab31a9150a	SDN Cipinang Muara 19	12345678	CM19	$2b$10$wrhup9YVJjM9N2NWoh/.E.PLfc7UDzIWs4tTssAQ8FDEBqzokc5M.	Jalan Dimana kah itu	christianhadiwijaya	tianrider@gmail.com	082113383767	2ab94e10-0ca5-4923-a075-0900d90be346	2025-05-26 19:11:20.341497+00	2025-05-27 06:22:46.003636+00
b92951a5-104c-4644-9839-d3920909f107	SDN Cipinang Muara 20	12345677	CM20	$2b$10$wrhup9YVJjM9N2NWoh/.E.PLfc7UDzIWs4tTssAQ8FDEBqzokc5M.	\N	\N	\N	\N	2ab94e10-0ca5-4923-a075-0900d90be346	\N	2025-05-27 06:22:46.049844+00
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: mbgku_owner
--

COPY public.students (id, name, student_number, class, grade, address, gender, birth_date, school_id, created_at, password, updated_at) FROM stdin;
c7e27366-2c1c-4f8a-8f87-ccfb748fd016	Bonifasius Raditya	2306161952	A	12	surga	Laki-laki	2022-02-27	72431142-83b0-447e-bf77-b6ab31a9150a	2025-05-26 20:09:59.037+00	$2b$10$tNo7WaGfysQJ12dPmUuEi.Fz42bEvjKVd8v6vJLmcwRES9s2PJSqa	2025-05-26 20:20:57.024+00
\.


--
-- Name: governments governments_contact_email_key; Type: CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.governments
    ADD CONSTRAINT governments_contact_email_key UNIQUE (contact_email);


--
-- Name: governments governments_pkey; Type: CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.governments
    ADD CONSTRAINT governments_pkey PRIMARY KEY (id);


--
-- Name: governments governments_province_id_key; Type: CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.governments
    ADD CONSTRAINT governments_province_id_key UNIQUE (province_id);


--
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (id);


--
-- Name: reception_logs reception_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.reception_logs
    ADD CONSTRAINT reception_logs_pkey PRIMARY KEY (id);


--
-- Name: reception_logs reception_logs_user_id_date_key; Type: CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.reception_logs
    ADD CONSTRAINT reception_logs_user_id_date_key UNIQUE (user_id, date);


--
-- Name: school_menu_allocations school_menu_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.school_menu_allocations
    ADD CONSTRAINT school_menu_allocations_pkey PRIMARY KEY (id);


--
-- Name: school_menu_allocations school_menu_allocations_school_id_menu_id_date_key; Type: CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.school_menu_allocations
    ADD CONSTRAINT school_menu_allocations_school_id_menu_id_date_key UNIQUE (school_id, menu_id, date);


--
-- Name: schools schools_npsn_key; Type: CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_npsn_key UNIQUE (npsn);


--
-- Name: schools schools_pkey; Type: CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_pkey PRIMARY KEY (id);


--
-- Name: schools schools_school_id_key; Type: CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_school_id_key UNIQUE (school_id);


--
-- Name: students users_pkey; Type: CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: students users_student_number_key; Type: CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT users_student_number_key UNIQUE (student_number);


--
-- Name: menus menus_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.governments(id) ON DELETE SET NULL;


--
-- Name: reception_logs reception_logs_school_menu_allocation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.reception_logs
    ADD CONSTRAINT reception_logs_school_menu_allocation_id_fkey FOREIGN KEY (school_menu_allocation_id) REFERENCES public.school_menu_allocations(id);


--
-- Name: reception_logs reception_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.reception_logs
    ADD CONSTRAINT reception_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: school_menu_allocations school_menu_allocations_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.school_menu_allocations
    ADD CONSTRAINT school_menu_allocations_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(id) ON DELETE CASCADE;


--
-- Name: school_menu_allocations school_menu_allocations_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.school_menu_allocations
    ADD CONSTRAINT school_menu_allocations_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: schools schools_government_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_government_id_fkey FOREIGN KEY (government_id) REFERENCES public.governments(id) ON DELETE CASCADE;


--
-- Name: students users_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mbgku_owner
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT users_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

