DROP TABLE IF EXISTS contient;
DROP TABLE IF EXISTS panier;
DROP TABLE IF EXISTS commande;
DROP TABLE IF EXISTS livre;
DROP TABLE IF EXISTS utilisateur;

CREATE TABLE utilisateur(
    email VARCHAR(100) PRIMARY KEY,
    nom VARCHAR(50) NOT NULL, 
    prenom VARCHAR(50),
    date_naissance DATE,
    mot_de_passe VARCHAR(255) NOT NULL,
    num_telephone BIGINT,
    avatar VARCHAR(255) DEFAULT NULL,
    ville VARCHAR(100) DEFAULT 'Non renseigné'
);

CREATE TABLE livre(
    id_livre INT AUTO_INCREMENT PRIMARY KEY,
    nom_livre VARCHAR(150) NOT NULL,
    autheur VARCHAR(100) NOT NULL,
    prix DECIMAL(8,2) NOT NULL,        
    image_livre VARCHAR(255) NOT NULL,  
    categorie VARCHAR(255) NOT NULL,
    langue VARCHAR(255) NOT NULL
);

CREATE TABLE commande(
    id_commande INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL, 
    date_commande DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    prix_total DECIMAL(10,2) DEFAULT 0,
    wilaya_livraison VARCHAR(50) NOT NULL,
    statue VARCHAR(20) NOT NULL, 
    CONSTRAINT fk_commande_user FOREIGN KEY (email) REFERENCES utilisateur(email) ON DELETE CASCADE
);

CREATE TABLE panier(
    email VARCHAR(100),
    id_livre INT,
    quantite INT DEFAULT 1 NOT NULL,
    CONSTRAINT pk_panier PRIMARY KEY (email, id_livre),
    CONSTRAINT fk_panier_user FOREIGN KEY (email) REFERENCES utilisateur(email) ON DELETE CASCADE,
    CONSTRAINT fk_panier_livre FOREIGN KEY (id_livre) REFERENCES livre(id_livre) ON DELETE CASCADE,
    CONSTRAINT chk_quantite_panier CHECK (quantite > 0)
);

CREATE TABLE contient(
    id_commande INT,
    id_livre INT,
    quantite_commandee INT NOT NULL,
    prix_achat DECIMAL(8,2) NOT NULL, 
    CONSTRAINT pk_contient PRIMARY KEY (id_commande, id_livre),
    CONSTRAINT fk_contient_commande FOREIGN KEY (id_commande) REFERENCES commande(id_commande) ON DELETE CASCADE,
    CONSTRAINT fk_contient_livre FOREIGN KEY (id_livre) REFERENCES livre(id_livre) ON DELETE CASCADE,
    CONSTRAINT chk_quantite_contient CHECK (quantite_commandee > 0)
);