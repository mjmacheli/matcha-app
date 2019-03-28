--
-- PostgreSQL database dump
--

-- Dumped from database version 11.2
-- Dumped by pg_dump version 11.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: interests; Type: TABLE; Schema: public; Owner: mmacheli
--

CREATE TABLE public.interests (
    interest_id integer NOT NULL,
    int1 character varying(25),
    int2 character varying(25),
    int3 character varying(25),
    int4 character varying(25),
    int5 character varying(25),
    user_id integer
);


ALTER TABLE public.interests OWNER TO mmacheli;

--
-- Name: interests_interest_id_seq; Type: SEQUENCE; Schema: public; Owner: mmacheli
--

CREATE SEQUENCE public.interests_interest_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.interests_interest_id_seq OWNER TO mmacheli;

--
-- Name: interests_interest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mmacheli
--

ALTER SEQUENCE public.interests_interest_id_seq OWNED BY public.interests.interest_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: mmacheli
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    surname character varying(50) NOT NULL,
    email character varying(50) NOT NULL,
    username character varying(50) NOT NULL,
    password text NOT NULL,
    pic1 text,
    pic2 text,
    pic3 text,
    pic4 text,
    pic5 text,
    auth boolean DEFAULT false,
    bio text,
    gender character varying(10)
);


ALTER TABLE public.users OWNER TO mmacheli;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: mmacheli
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO mmacheli;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mmacheli
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: interests interest_id; Type: DEFAULT; Schema: public; Owner: mmacheli
--

ALTER TABLE ONLY public.interests ALTER COLUMN interest_id SET DEFAULT nextval('public.interests_interest_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: mmacheli
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: interests; Type: TABLE DATA; Schema: public; Owner: mmacheli
--

COPY public.interests (interest_id, int1, int2, int3, int4, int5, user_id) FROM stdin;
1	boys	girls	Drinking beer	hiking	\N	\N
2	boys	girls	Drinking beer	hiking	\N	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: mmacheli
--

COPY public.users (id, name, surname, email, username, password, pic1, pic2, pic3, pic4, pic5, auth, bio, gender) FROM stdin;
3	Macheli	James	ma	mj	$2b$10$DpN7Hiz2aNq.yngOJRcpWuGOd800Tyy.qo7JEYhsjtFQIrEVcCjJG	\N	\N	\N	\N	\N	f	\N	\N
1	Malefetsane	Macheli	fetsihd	fetsihd	12345	\N	\N	\N	\N	\N	f	I am an awesome dude!!	\N
4	James	Macheli	fetsihd@gmail.com	mj3	$2b$10$3Uj1WIr9ImbDnYUXCPkcAOkv3MpN04qe1WK8QevFlGvBUJ5eoSgSe	\N	\N	\N	\N	\N	f	edited	\N
2	Macheli	Mokeona	fetsihdd@gmail.com11	newUser	1234	\N	\N	\N	\N	\N	f	helo world	nigg
\.


--
-- Name: interests_interest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mmacheli
--

SELECT pg_catalog.setval('public.interests_interest_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mmacheli
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: interests interests_pkey; Type: CONSTRAINT; Schema: public; Owner: mmacheli
--

ALTER TABLE ONLY public.interests
    ADD CONSTRAINT interests_pkey PRIMARY KEY (interest_id);


--
-- Name: interests interests_user_id_key; Type: CONSTRAINT; Schema: public; Owner: mmacheli
--

ALTER TABLE ONLY public.interests
    ADD CONSTRAINT interests_user_id_key UNIQUE (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: mmacheli
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_id_key; Type: CONSTRAINT; Schema: public; Owner: mmacheli
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_key UNIQUE (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: mmacheli
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id, username);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: mmacheli
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: interests interests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mmacheli
--

ALTER TABLE ONLY public.interests
    ADD CONSTRAINT interests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

