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
    is_grand_final smallint DEFAULT '0'::smallint NOT NULL
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

COPY public.tournament (name, description, start_on, duration_min, input_count, output_count, id, is_grand_final) FROM stdin;
Tournament #1	\N	2019-03-22 10:30:00.527492	10	4	2	2	0
Tournament #2	\N	2019-03-22 11:30:00.527492	10	4	2	3	0
Tournament #3	\N	2019-03-22 12:30:00.527492	10	4	2	4	0
Tournament #4	\N	2019-03-22 13:30:00.527492	10	4	2	5	0
infinity	Death Match	2019-03-22 04:00:25.202974	-1	50	50	1	0
\.


--
-- Name: tournament_id_seq; Type: SEQUENCE SET; Schema: public; Owner: codefest
--

SELECT pg_catalog.setval('public.tournament_id_seq', 5, true);


--
-- Data for Name: tournaments_per_user; Type: TABLE DATA; Schema: public; Owner: codefest
--

COPY public.tournaments_per_user (user_id, tournament_id, kills, deaths, points, force) FROM stdin;
112	1	0	0	0	0
91	5	0	0	0	1
92	5	0	0	0	1
96	2	0	0	70	0
97	2	0	0	80	0
98	2	0	0	90	0
99	3	0	0	120	0
100	3	0	0	130	0
101	3	0	0	140	0
102	3	0	0	150	0
103	4	0	0	170	0
104	4	0	0	180	0
105	4	0	0	190	0
106	4	0	0	200	0
93	5	65	28	4001	0
94	5	30	20	400	0
107	1	0	0	0	0
108	1	0	0	0	0
109	1	0	0	0	0
110	1	0	0	0	0
111	1	0	0	0	0
95	2	0	0	60	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: codefest
--

COPY public.users (id, name, password) FROM stdin;
91	drew	7325d5cbca28a85849663d5d2552d45d9903c188849e932e721634f9d789a91b
92	drew1	ef320e8a8c42a0e52980c8526dec37455e0547bfcfb4b9623610475ad01daade
93	drew2	4415e4536d15a0d7e3d09459d10713c6f55e1af6a7f51d93d3a412577bf7967a
94	drew123	50093c3fb3966702b489c9839bdae030e199bd0b2e3563de62984c6af6eafaae
95	user@2gis.ru	f695b691b154b903f2e0d9d2f47c78cb2ff55b7a8dfa3feba8674878cf454797
96	asd444	ca20a4017187a3c71412bed29e7fff8b566452ce68bd5b109b1b6454ce581c78
97	dima	588702ccf170d19f84cc2b0198626cfca57114e24fb62f726b7c4f4c7cef40b2
98	asd123	63ecd1af703b9d39758a1f55e21027f2f20a39c59449d7ddf85236859840db4d
99	trufi	e0385ee217d587099b935648b279704e0e0c500527e13b50537b84c490796a64
100	3asd123	e11eacc0cb64e8fd7434c394de3d123c5fe7bb218d2c48d07d59b6345ae4745f
101	asd123123	db514235dd9441c88f12b93e2a95055b87d0a312ead1c017f848e86e79dda6a4
102	123123	4a60edcdcdd3c16b027c5d1c69399f0718e43e4ba6eba92d68bcb34d7974f589
103	dddd333	98e7bb1b8b17ec5455abc91be498137aa2aa724549be1c7b2d9d8c42d1ecdb96
104	asd1233	3d26e6f2426ab470560bc9058b1e89fa4a13e424b5d2f9a62e05c8c684759eb1
105	123456	98e0ff666370773a47d429fd4e93a2f5afb87e37f9cdc365a85138be6988afa3
106	Asd123	0deeefdb99fda1aae81ce8a3867a8a0899795ba433fb8d56e052061f8e80fd89
107	p.fomin	e09adb2c6087889499fe4071ba6fe12e94ca8ece3454bcecdec09136f6aeadfa
108	warden	5bfb0d37342fa21f4458e84ef39d4c6ab987817a6f18553fccaea49dafc56e31
109	Asd123ssss	26925ef28e59608c9d3362733cb228a24946e8657a7051fbf778e8270dcae494
110	Не летит	93737eb9180bdb72e520215720268b432e2e56ef7c6eb8096e383a97538bb419
111	1234	f92d7eeacefc745c98bc7d0aefd539ba9944c5e001ee8d216554b76db33f3a73
112	asd12312333	d7415c3cfa3c83b4a60b671bceea41653531558302ef9fb7ea7b9089dc1d09c5
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: codefest
--

SELECT pg_catalog.setval('public.users_id_seq', 112, true);


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

