--
-- PostgreSQL database dump
--
-- Dumped from database version 14.5 (Debian 14.5-1.pgdg110+1)
-- Dumped by pg_dump version 14.5 (Debian 14.5-1.pgdg110+1)
SET
    statement_timeout = 0;

SET
    lock_timeout = 0;

SET
    idle_in_transaction_session_timeout = 0;

SET
    client_encoding = 'UTF8';

SET
    standard_conforming_strings = on;

SELECT
    pg_catalog.set_config('search_path', '', false);

SET
    check_function_bodies = false;

SET
    xmloption = content;

SET
    client_min_messages = warning;

SET
    row_security = off;

--
-- Name: faucet; Type: SCHEMA; Schema: -; Owner: postgres
--
CREATE SCHEMA faucet;

ALTER SCHEMA faucet OWNER TO postgres;

SET
    default_tablespace = '';

SET
    default_table_access_method = heap;

--
-- Name: auth_channel; Type: TABLE; Schema: faucet; Owner: postgres
--
CREATE TABLE faucet.auth_channel (
    auth_name character varying(50) NOT NULL,
    audience character varying(300) NOT NULL,
    username_claim character varying(50) NOT NULL,
    distribution_amount bigint NOT NULL,
    auth_provider character varying(50) NOT NULL
);

ALTER TABLE
    faucet.auth_channel OWNER TO postgres;

--
-- Name: auth_provider; Type: TABLE; Schema: faucet; Owner: postgres
--
CREATE TABLE faucet.auth_provider (
    auth_provider character varying(50) NOT NULL,
    key_url character varying(300) NOT NULL,
    issuer character varying(300) NOT NULL
);

ALTER TABLE
    faucet.auth_provider OWNER TO postgres;

--
-- Name: distribution; Type: TABLE; Schema: faucet; Owner: postgres
--
CREATE TABLE faucet.distribution (
    distribution_id bigint NOT NULL,
    address character varying(55) NOT NULL,
    amount bigint NOT NULL,
    auth_name character varying(50) NOT NULL,
    username character varying(350) NOT NULL,
    distributed_at timestamp with time zone NOT NULL,
    user_id character varying(75) NOT NULL
);

ALTER TABLE
    faucet.distribution OWNER TO postgres;

--
-- Name: distribution_distribution_id_seq; Type: SEQUENCE; Schema: faucet; Owner: postgres
--
CREATE SEQUENCE faucet.distribution_distribution_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    faucet.distribution_distribution_id_seq OWNER TO postgres;

--
-- Name: distribution_distribution_id_seq; Type: SEQUENCE OWNED BY; Schema: faucet; Owner: postgres
--
ALTER SEQUENCE faucet.distribution_distribution_id_seq OWNED BY faucet.distribution.distribution_id;

--
-- Name: distribution distribution_id; Type: DEFAULT; Schema: faucet; Owner: postgres
--
ALTER TABLE
    ONLY faucet.distribution
ALTER COLUMN
    distribution_id
SET
    DEFAULT nextval(
        'faucet.distribution_distribution_id_seq' :: regclass
    );

--
-- Name: auth_channel auth_channel_pk; Type: CONSTRAINT; Schema: faucet; Owner: postgres
--
ALTER TABLE
    ONLY faucet.auth_channel
ADD
    CONSTRAINT auth_channel_pk PRIMARY KEY (auth_name);

--
-- Name: auth_provider auth_provider_pk; Type: CONSTRAINT; Schema: faucet; Owner: postgres
--
ALTER TABLE
    ONLY faucet.auth_provider
ADD
    CONSTRAINT auth_provider_pk PRIMARY KEY (auth_provider);

--
-- Name: distribution distribution_pk; Type: CONSTRAINT; Schema: faucet; Owner: postgres
--
ALTER TABLE
    ONLY faucet.distribution
ADD
    CONSTRAINT distribution_pk PRIMARY KEY (distribution_id);

--
-- Name: distribution_address_idx; Type: INDEX; Schema: faucet; Owner: postgres
--
CREATE INDEX distribution_address_idx ON faucet.distribution USING btree (address);

--
-- Name: distribution_distributed_at_idx; Type: INDEX; Schema: faucet; Owner: postgres
--
CREATE INDEX distribution_distributed_at_idx ON faucet.distribution USING btree (distributed_at);

--
-- Name: distribution_user_id_auth_name_idx; Type: INDEX; Schema: faucet; Owner: postgres
--
CREATE INDEX distribution_user_id_auth_name_idx ON faucet.distribution (user_id,auth_name);

--
-- Name: auth_channel auth_channel_fk; Type: FK CONSTRAINT; Schema: faucet; Owner: postgres
--
ALTER TABLE
    ONLY faucet.auth_channel
ADD
    CONSTRAINT auth_channel_fk FOREIGN KEY (auth_provider) REFERENCES faucet.auth_provider(auth_provider);

INSERT INTO
    faucet.auth_provider (auth_provider, key_url, issuer)
VALUES
    (
        'google',
        'https://www.googleapis.com/oauth2/v3/certs',
        'https://accounts.google.com'
    );

INSERT INTO
    faucet.auth_channel (
        auth_name,
        audience,
        username_claim,
        distribution_amount,
        auth_provider
    )
VALUES
    (
        'hashed-portal-google',
        '281519001757-5694ukk11kka29kcmq7ifdk6e4ci26dd.apps.googleusercontent.com',
        'email',
        1000000000,
        'google'
    );

INSERT INTO
    faucet.auth_channel (
        auth_name,
        audience,
        username_claim,
        distribution_amount,
        auth_provider
    )
VALUES
    (
        'afloat-portal-google',
        '7985216537-gcduocqttdkt3bd9e949hpe6i2lmasnq.apps.googleusercontent.com',
        'email',
        1000000000,
        'google'
    );

--
-- PostgreSQL database dump complete
--