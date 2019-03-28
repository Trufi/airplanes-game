--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.12
-- Dumped by pg_dump version 9.6.12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: achievements; Type: TABLE; Schema: public; Owner: codefest
--

CREATE TABLE public.achievements (
    id bigint NOT NULL,
    name text,
    description text,
    machine_name text
);


ALTER TABLE public.achievements OWNER TO codefest;

--
-- Name: achievements_has_users; Type: TABLE; Schema: public; Owner: codefest
--

CREATE TABLE public.achievements_has_users (
    achievements_id bigint NOT NULL,
    users_id bigint NOT NULL
);


ALTER TABLE public.achievements_has_users OWNER TO codefest;

--
-- Name: achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: codefest
--

CREATE SEQUENCE public.achievements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.achievements_id_seq OWNER TO codefest;

--
-- Name: achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: codefest
--

ALTER SEQUENCE public.achievements_id_seq OWNED BY public.achievements.id;


--
-- Name: tournament; Type: TABLE; Schema: public; Owner: codefest
--

CREATE TABLE public.tournament (
    name text NOT NULL,
    description text,
    start_on timestamp without time zone NOT NULL,
    duration_min bigint DEFAULT '10'::bigint NOT NULL,
    input_count bigint DEFAULT '20'::bigint NOT NULL,
    output_count bigint DEFAULT '5'::bigint NOT NULL,
    id bigint NOT NULL,
    is_grand_final smallint DEFAULT '0'::smallint NOT NULL,
    machine_name text DEFAULT 't'::text NOT NULL
);


ALTER TABLE public.tournament OWNER TO codefest;

--
-- Name: tournament_id_seq; Type: SEQUENCE; Schema: public; Owner: codefest
--

CREATE SEQUENCE public.tournament_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tournament_id_seq OWNER TO codefest;

--
-- Name: tournament_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: codefest
--

ALTER SEQUENCE public.tournament_id_seq OWNED BY public.tournament.id;


--
-- Name: tournaments_per_user; Type: TABLE; Schema: public; Owner: codefest
--

CREATE TABLE public.tournaments_per_user (
    user_id bigint NOT NULL,
    tournament_id integer NOT NULL,
    kills integer DEFAULT 0 NOT NULL,
    deaths integer DEFAULT 0 NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    force integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.tournaments_per_user OWNER TO codefest;

--
-- Name: users; Type: TABLE; Schema: public; Owner: codefest
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name text,
    password text
);


ALTER TABLE public.users OWNER TO codefest;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: codefest
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO codefest;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: codefest
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: achievements id; Type: DEFAULT; Schema: public; Owner: codefest
--

ALTER TABLE ONLY public.achievements ALTER COLUMN id SET DEFAULT nextval('public.achievements_id_seq'::regclass);


--
-- Name: tournament id; Type: DEFAULT; Schema: public; Owner: codefest
--

ALTER TABLE ONLY public.tournament ALTER COLUMN id SET DEFAULT nextval('public.tournament_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: codefest
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: codefest
--

COPY public.achievements (id, name, description, machine_name) FROM stdin;
\.


--
-- Data for Name: achievements_has_users; Type: TABLE DATA; Schema: public; Owner: codefest
--

COPY public.achievements_has_users (achievements_id, users_id) FROM stdin;
\.


--
-- Name: achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: codefest
--

SELECT pg_catalog.setval('public.achievements_id_seq', 1, true);


--
-- Data for Name: tournament; Type: TABLE DATA; Schema: public; Owner: codefest
--

COPY public.tournament (name, description, start_on, duration_min, input_count, output_count, id, is_grand_final, machine_name) FROM stdin;
Tournament #1		2019-03-22 10:30:00.527492	10	4	2	2	0	t1
Tournament #2		2019-03-22 11:30:00.527492	10	4	2	3	0	t2
Tournament #3		2019-03-22 12:30:00.527492	10	4	2	4	0	t3
Tournament #4		2019-03-22 13:30:00.527492	10	4	2	5	0	t4
infinity	Death Match	2019-03-22 04:00:25.202974	-1	50	50	1	0	infinity
GSL CODE S	GLOBAL STARCRAFT LEAGUR	2019-03-27 08:57:18.325372	10	20	5	6	1	g1
\.


--
-- Name: tournament_id_seq; Type: SEQUENCE SET; Schema: public; Owner: codefest
--

SELECT pg_catalog.setval('public.tournament_id_seq', 6, true);


--
-- Data for Name: tournaments_per_user; Type: TABLE DATA; Schema: public; Owner: codefest
--

COPY public.tournaments_per_user (user_id, tournament_id, kills, deaths, points, force) FROM stdin;
286	1	0	0	0	0
287	1	0	0	0	0
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: codefest
--

COPY public.users (id, name, password) FROM stdin;
287	p.fomin	e09adb2c6087889499fe4071ba6fe12e94ca8ece3454bcecdec09136f6aeadfa
286	trufi	e0385ee217d587099b935648b279704e0e0c500527e13b50537b84c490796a64
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: codefest
--

SELECT pg_catalog.setval('public.users_id_seq', 287, true);


--
-- Name: achievements idx_16388_primary; Type: CONSTRAINT; Schema: public; Owner: codefest
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT idx_16388_primary PRIMARY KEY (id);


--
-- Name: achievements_has_users idx_16395_primary; Type: CONSTRAINT; Schema: public; Owner: codefest
--

ALTER TABLE ONLY public.achievements_has_users
    ADD CONSTRAINT idx_16395_primary PRIMARY KEY (achievements_id, users_id);


--
-- Name: users idx_16400_primary; Type: CONSTRAINT; Schema: public; Owner: codefest
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT idx_16400_primary PRIMARY KEY (id);


--
-- Name: tournament tournament_id; Type: CONSTRAINT; Schema: public; Owner: codefest
--

ALTER TABLE ONLY public.tournament
    ADD CONSTRAINT tournament_id PRIMARY KEY (id);


--
-- Name: idx_16395_fk_achievements_has_users_achievements_idx; Type: INDEX; Schema: public; Owner: codefest
--

CREATE INDEX idx_16395_fk_achievements_has_users_achievements_idx ON public.achievements_has_users USING btree (achievements_id);


--
-- Name: idx_16395_fk_achievements_has_users_users1_idx; Type: INDEX; Schema: public; Owner: codefest
--

CREATE INDEX idx_16395_fk_achievements_has_users_users1_idx ON public.achievements_has_users USING btree (users_id);


--
-- Name: achievements_has_users fk_achievements_has_users_achievements; Type: FK CONSTRAINT; Schema: public; Owner: codefest
--

ALTER TABLE ONLY public.achievements_has_users
    ADD CONSTRAINT fk_achievements_has_users_achievements FOREIGN KEY (achievements_id) REFERENCES public.achievements(id);


--
-- Name: achievements_has_users fk_achievements_has_users_users1; Type: FK CONSTRAINT; Schema: public; Owner: codefest
--

ALTER TABLE ONLY public.achievements_has_users
    ADD CONSTRAINT fk_achievements_has_users_users1 FOREIGN KEY (users_id) REFERENCES public.users(id);


--
-- Name: tournaments_per_user tournaments_per_user_tournament_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: codefest
--

ALTER TABLE ONLY public.tournaments_per_user
    ADD CONSTRAINT tournaments_per_user_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournament(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: tournaments_per_user tournaments_per_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: codefest
--

ALTER TABLE ONLY public.tournaments_per_user
    ADD CONSTRAINT tournaments_per_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

