DROP TABLE contient CASCADE CONSTRAINTS;
DROP TABLE panier CASCADE CONSTRAINTS;
DROP TABLE commande CASCADE CONSTRAINTS;
DROP TABLE livre CASCADE CONSTRAINTS;
DROP TABLE utilisateur CASCADE CONSTRAINTS;

CREATE TABLE utilisateur(
    email VARCHAR2(100) PRIMARY KEY,
    nom VARCHAR2(50) NOT NULL, 
    prenom VARCHAR2(50) ,
    date_naissance DATE ,
    mot_de_passe VARCHAR2(255) NOT NULL,
    num_telephone NUMBER(10),
    avatar LONG RAW 
);

CREATE TABLE livre(
    id_livre NUMBER(5) PRIMARY KEY,
    nom_livre VARCHAR2(150) NOT NULL,
    autheur VARCHAR2(100) NOT NULL,
    prix NUMBER(8,2) NOT NULL,        
    image_livre LONG RAW NOT NULL,  
    categorie VARCHAR2(255) NOT NULL,
    langue VARCHAR(255) NOT NULL
);

CREATE TABLE commande(
    id_commande NUMBER(5) PRIMARY KEY,
    email VARCHAR2(100) NOT NULL, 
    date_achat DATE DEFAULT SYSDATE NOT NULL, 
    wilaya_livraison VARCHAR2(50) NOT NULL,
    statue VARCHAR2(20) NOT NULL, 
    CONSTRAINT fk_commande_user FOREIGN KEY (email) REFERENCES utilisateur(email) ON DELETE CASCADE
);

CREATE TABLE panier(
    email VARCHAR2(100),
    id_livre NUMBER(5),
    quantite NUMBER(3) DEFAULT 1 NOT NULL,
    CONSTRAINT pk_panier PRIMARY KEY (email, id_livre),
    CONSTRAINT fk_panier_user FOREIGN KEY (email) REFERENCES utilisateur(email) ON DELETE CASCADE,
    CONSTRAINT fk_panier_livre FOREIGN KEY (id_livre) REFERENCES livre(id_livre) ON DELETE CASCADE,
    CONSTRAINT chk_quantite_panier CHECK (quantite > 0)
);

CREATE TABLE contient(
    id_commande NUMBER(5),
    id_livre NUMBER(5),
    quantite_commandee NUMBER(3) NOT NULL,
    prix_achat NUMBER(8,2) NOT NULL, 
    CONSTRAINT pk_contient PRIMARY KEY (id_commande, id_livre),
    CONSTRAINT fk_contient_commande FOREIGN KEY (id_commande) REFERENCES commande(id_commande) ON DELETE CASCADE,
    CONSTRAINT fk_contient_livre FOREIGN KEY (id_livre) REFERENCES livre(id_livre) ON DELETE CASCADE,
    CONSTRAINT chk_quantite_contient CHECK (quantite_commandee > 0)
);

COMMIT;