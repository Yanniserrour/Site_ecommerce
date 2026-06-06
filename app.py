import os
from datetime import timedelta
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename


# Configuration: BDD et Admin
app = Flask(__name__)
app.secret_key = 'adlis_secret_key_pour_les_sessions'
app.permanent_session_lifetime = timedelta(days=7)

@app.after_request
def set_response_headers(response):
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0, private'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

# DB config
ENV = 'DEVELOPPEMENT' 

if ENV == "DEVELOPPEMENT":
    DB_HOST     = "localhost"
    DB_USER     = "root"
    DB_PASSWORD = "admin123"
    DB_NAME     = "adlis"
else: 
    DB_HOST     = "serveur_debergement"  #a changer
    DB_USER     = "adlis_prod"           #a changer
    DB_PASSWORD = "mot_de_passe_distant" #a changer
    DB_NAME     = "adlis"                #a changer

def obtenir_connexion():
    return mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME)

# Identifiants admin
ADMIN_CREDENTIALS = {
    "yanni.serrour@fgei.ummto.dz": "admin123",
    "nadjib.sadouki@fgei.ummto.dz": "admin123",
    "salim@fgei.ummto.dz": "admin123"
}



# Fonctions utilitaire:
def _get_logged_user_email():
    return session.get('email')

def _prix_to_decimal(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    s = str(value)
    s = s.replace('DA', '').strip()
    s = s.replace(' ', '')
    s = s.replace(',', '.')
    try:
        return float(s)
    except ValueError:
        return None


# Routes des pages:
# Accueil
@app.route('/')
@app.route('/index')
@app.route('/index.html')
def index():
    return render_template('index.html')

# Authentification
@app.route('/auth')
@app.route('/auth.html')
def auth():
    if session.get('logged_in'):
        return redirect(url_for('index'))
    return render_template('auth.html')

# Formulaire de commande
@app.route('/formulaire')
@app.route('/formulaire.html')
def formulaire():
    return render_template('formulaire.html')

# Profil utilisateur 
@app.route('/profile/view')
@app.route('/profile.html')
def profile_page():
    if not session.get('logged_in'):
        flash("Veuillez vous connecter pour acceder a votre profil.", "error")
        return redirect(url_for('auth'))
    
    # Données charger via JavaScript
    return render_template('profile.html')

# Produits
@app.route('/produit')
@app.route('/produit.html')
def produit():
    return render_template('produit.html')

# Panier
@app.route('/panier')
@app.route('/panier.html')
def panier():
    if not session.get('logged_in'):
        flash("Veuillez vous connecter pour acceder au panier.", "error")
        return redirect(url_for('auth'))
    return render_template('panier.html')


# Administration
@app.route('/admin')
@app.route('/admin.html')
def admin():
    if not session.get('logged_in') or not session.get('is_admin'):
        flash("Acces refusé. Cette zone est reservée aux administrateurs.", "error")
        return redirect(url_for('index'))
    return render_template('admin.html')

# Route router profil: 
@app.route('/profile')
def profile_router():
    if not session.get('logged_in'):
        flash("Veuillez vous connecter", "error")
        return redirect(url_for('auth'))

    if session.get('is_admin'):
        return redirect(url_for('admin'))

    return redirect(url_for('profile_page'))

# Route d'auth/inscription
# Inscription
@app.route('/inscription', methods=['POST'])
def inscription(): 
    nom     = "Non renseigne"
    email = (request.form.get('email') or '').strip()
    mdp   = request.form.get('mot_de_passe') or '' 
    prenom   = (request.form.get('prenom') or '').strip()
    date_naiss = "2001-09-11"
    num_tel    = 0  

    if not nom or not email or not mdp:
        flash("Tous les champs sont requis.", "error")
        return redirect(url_for('auth'))

    if len(mdp) < 8: 
        flash("Mot de passe trop court (8 caractéres minimum)", "error")
        return redirect(url_for('auth'))
    
    connexion = None
    cursor = None
    try: 
        connexion = obtenir_connexion()
        cursor = connexion.cursor(buffered=True)
        
        cursor.execute("SELECT email FROM utilisateur WHERE email = %(email)s", {"email": email})
        compte_existant = cursor.fetchone()
        
        if compte_existant:
            flash("Compte existant, veuillez vous connecter.", "error")
            return redirect(url_for('auth'))
        else:
            mdp_hashed = generate_password_hash(mdp)
            
            requete_sql = """
            INSERT INTO utilisateur(email, nom, prenom, date_naissance, mot_de_passe, num_telephone)
            VALUES(%(email)s, %(nom)s, %(prenom)s, %(date_naiss)s, %(mdp_hashed)s, %(num_tel)s)
            """
            
            cursor.execute(requete_sql, {
                "email": email, "nom": nom, "prenom": prenom, 
                "date_naiss": date_naiss, "mdp_hashed": mdp_hashed, "num_tel": num_tel
            })
            connexion.commit()
            
            flash("Inscription reussie ! Veuillez vous connecter.", "success")
            return redirect(url_for('auth'))
        
    except mysql.connector.Error as e:
        flash(f"Erreur technique de base de donnees : {e}")
        return redirect(url_for('auth'))
    
    finally:
        if cursor:
            cursor.close()
        if connexion:
            connexion.close()

# route Connexion
@app.route('/connexion', methods=['POST'])
def connexion():
    email = (request.form.get('email') or '').strip()
    mdp   = request.form.get('mot_de_passe') or ''
    
    if not email or not mdp:
        flash("Email ou mot de passe incorrect.", "error")
        return redirect(url_for('auth'))

    email_lower = email.lower()
    if email_lower in ADMIN_CREDENTIALS:
        if mdp == ADMIN_CREDENTIALS[email_lower]:
            session.permanent = True
            session['logged_in'] = True
            session['is_admin'] = True
            session['email'] = email_lower
            session['nom'] = "Admin"
            session['prenom'] = email_lower.split('.')[0].capitalize() 
            session['user_name'] = "Admin"
            
            flash("Connexion Administrateur reussie !", "success")
            return redirect(url_for('admin')) 
        else:
            flash("Email ou mot de passe incorrect.", "error")
            return redirect(url_for('auth'))

    connexion_db = None
    cursor = None
    try: 
        connexion_db = obtenir_connexion()
        cursor = connexion_db.cursor(buffered=True)   
        cursor.execute("SELECT email, nom, prenom, mot_de_passe, avatar FROM utilisateur WHERE email = %(email)s", {"email": email})
        utilisateur = cursor.fetchone()
        
        if not utilisateur:
            flash("Email ou mot de passe incorrect.", "error")
            return redirect(url_for('auth'))
        else:
            mot_de_passe_hashed_stock = utilisateur[3]
            if not mdp or not check_password_hash(mot_de_passe_hashed_stock, mdp):
                flash("Email ou mot de passe incorrect.", "error")
                return redirect(url_for('auth'))

            session.permanent = True
            session['logged_in'] = True
            session['is_admin'] = False 
            session['email'] = utilisateur[0]
            session['nom'] = utilisateur[1]
            session['prenom'] = utilisateur[2]
            session['user_name'] = utilisateur[2]
            session['avatar'] = utilisateur[4] if utilisateur[4] else 'profil-de-lutilisateur.png'
            flash("Connexion reussie !", "success")
            return redirect(url_for('index'))
    
    except mysql.connector.Error as e:
        flash(f"Erreur de connexion : {e}")
        return redirect(url_for('auth'))
    
    finally:
        if cursor:
            cursor.close()
        if connexion_db: 
            connexion_db.close()

# route Deconnexion
@app.route('/deconnexion')
def deconnxion():
    session.clear()
    return redirect(url_for('index'))

# Route Profile/avatar 
@app.route('/profile/update_avatar', methods=['POST'])
def update_avatar():
    if not session.get('logged_in'):
        return redirect(url_for('auth'))

    nom_avatar = request.form.get('avatar_choice')
    if not nom_avatar:
        flash("Aucun avatar selectionné.", "error")
        return redirect(url_for('profile'))

    connexion = None
    cursor = None
    try:
        connexion = obtenir_connexion()
        cursor = connexion.cursor()
        cursor.execute(
            "UPDATE utilisateur SET avatar = %(avatar)s WHERE email = %(email)s",
            {"avatar": nom_avatar, "email": session['email']}
        )
        connexion.commit()
        session['avatar'] = nom_avatar
        flash("Avatar mis a jour !", "success")
    except mysql.connector.Error as e:
        flash(f"Erreur : {e}", "error")
    finally:
        if cursor:
            cursor.close()
        if connexion:
            connexion.close()

    return redirect(url_for('profile'))


# Route API/ recuperer les donnée pour le profile 
@app.route('/api/user/profile', methods=['GET'])
@app.route('/api/user/profile', methods=['GET'])
def api_user_profile():
    if not session.get('logged_in'):
        return jsonify({"ok": False, "error": "Non authentifié"}), 401
    
    email = session.get('email')
    connexion = None
    cursor = None
    
    try:
        connexion = obtenir_connexion()
        cursor = connexion.cursor(dictionary=True, buffered=True)
        
        cursor.execute("""
            SELECT email, nom, prenom, date_naissance, num_telephone, ville, avatar,
                   TIMESTAMPDIFF(YEAR, date_naissance, CURDATE()) as age
            FROM utilisateur 
            WHERE email = %(email)s
        """, {"email": email})
        
        user = cursor.fetchone()
        
        if user:
            # Convertir l'avatar de bytes à string si nécessaire
            if user.get('avatar') and isinstance(user['avatar'], bytes):
                user['avatar'] = user['avatar'].decode('utf-8')
            elif not user.get('avatar'):
                user['avatar'] = 'profil-de-lutilisateur.png'
            
            # Convertir la date en string pour le JSON
            if user.get('date_naissance'):
                user['date_naissance'] = str(user['date_naissance'])
            
            # Convertir num_telephone en string si c'est un nombre
            if user.get('num_telephone'):
                user['num_telephone'] = str(user['num_telephone'])
            
            # Si ville est None, mettre une valeur par défaut
            if not user.get('ville'):
                user['ville'] = 'Non renseigné'
            
            return jsonify({"ok": True, "user": user})
        else:
            return jsonify({"ok": False, "error": "Utilisateur non trouvé"}), 404
            
    except mysql.connector.Error as e:
        return jsonify({"ok": False, "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if connexion:
            connexion.close()

# Route modifier et sauvegarder les données du profil: 
@app.route('/api/user/update_profile', methods=['POST'])
def api_update_profile():
    if not session.get('logged_in'):
        return jsonify({"ok": False, "error": "Non authentifie"}), 401

    email = session.get('email')
    data = request.get_json(silent=True) or {}

    nom = data.get('nom')
    prenom = data.get('prenom')
    date_naissance = data.get('date_naissance')
    num_telephone = data.get('num_telephone')

    if num_telephone:
        num_telephone = num_telephone.strip()
    if num_telephone in ("", "0", "Non renseigne", "Non defini"):
        num_telephone = None
    else:
        num_telephone = None

    ville = data.get('ville')

    connexion = None
    cursor = None
    try:
        connexion = obtenir_connexion()
        cursor = connexion.cursor()
        cursor.execute("""
            UPDATE utilisateur 
            SET nom = %(nom)s, prenom = %(prenom)s, date_naissance = %(date_naissance)s,
                num_telephone = %(num_telephone)s, ville = %(ville)s
            WHERE email = %(email)s
        """, {
            "nom": nom, "prenom": prenom, "date_naissance": date_naissance,
            "num_telephone": num_telephone, "ville": ville, "email": email
        })
        connexion.commit()

        session['nom'] = nom
        session['prenom'] = prenom
        session['user_name'] = prenom

        return jsonify({"ok": True})
    except mysql.connector.Error as e:
        return jsonify({"ok": False, "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if connexion:
            connexion.close()


# Route API/ recuperer l'historique d'chats
@app.route('/api/user/purchases', methods=['GET'])
def api_user_purchases():
    if not session.get('logged_in'):
        return jsonify({"ok": False, "error": "Non authentifié"}), 401
    
    email = session.get('email')
    connexion = None
    cursor = None
    
    try:
        connexion = obtenir_connexion()
        cursor = connexion.cursor(dictionary=True, buffered=True)
        
        cursor.execute("""
            SELECT 
                c.date_commande as date,
                l.nom_livre as produit,
                c.prix_total as prix,
                c.statue as status
            FROM commande c
            JOIN contient ct ON c.id_commande = ct.id_commande
            JOIN livre l ON ct.id_livre = l.id_livre
            WHERE c.email = %(email)s
            ORDER BY c.date_commande DESC
        """, {"email": email})
        
        purchases = cursor.fetchall() or []
        
        formatted_purchases = []
        for purchase in purchases:
            status = purchase.get('status', 'En attente')
            status_class = 'pending'
            if status.lower() == 'livré':
                status_class = 'delivered'
            elif status.lower() == 'annulé':
                status_class = 'cancelled'
            
            formatted_purchases.append({
                'date': str(purchase.get('date', '')) if purchase.get('date') else 'N/A',
                'produit': purchase.get('produit', 'N/A'),
                'prix': str(purchase.get('prix', '0')),
                'status': status,
                'status_class': status_class
            })
        
        return jsonify({"ok": True, "purchases": formatted_purchases})
        
    except mysql.connector.Error as e:
        return jsonify({"ok": False, "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if connexion:
            connexion.close()


# Route ajouter des produit a partir de admin
@app.route('/admin/ajouter_produit', methods=['POST'])
def ajouter_produit():
    if not session.get('logged_in') or not session.get('is_admin'):
        flash("Acces refuse.", "error")
        return redirect(url_for('index'))
        
    nom       = request.form.get('nom')
    auteur    = request.form.get('auteur')
    categorie = request.form.get('categorie')
    langue    = request.form.get('langue')
    prix      = request.form.get('prix')
    
    fichier_image = request.files.get('image_fichier')
    if fichier_image and fichier_image.filename != '':
        nom_image = secure_filename(fichier_image.filename)
        chemin_sauvegarde = os.path.join(app.root_path, 'static', 'img', nom_image)
        fichier_image.save(chemin_sauvegarde)
    else:
        nom_image = 'default_book.png'
    
    if not nom or not auteur or not prix:
        flash("Les champs 'Nom', 'Auteur' et 'Prix' sont obligatoires.", "error")
        return redirect(url_for('admin'))

    connexion = None
    cursor = None
    try:
        connexion = obtenir_connexion()
        cursor = connexion.cursor()

        requete_sql = """
        INSERT INTO livre (nom_livre, autheur, categorie, langue, prix, image_livre)
        VALUES (%(nom)s, %(auteur)s, %(categorie)s, %(langue)s, %(prix)s, %(image)s)
        """

        cursor.execute(requete_sql, {
            "nom": nom, "auteur": auteur, "categorie": categorie,
            "langue": langue, "prix": prix, "image": nom_image
        })

        connexion.commit()

        try:
            cursor.execute("SELECT COUNT(*) FROM livre")
            nb_livres = cursor.fetchone()[0]
            app.logger.info(f"Livre insere. Nombre de livres en base: {nb_livres}")
        except Exception:
            app.logger.exception("Impossible de recuperer le nombre de livres apres insertion.")

        flash("Le livre a ete ajoute avec succes !", "success")

    except Exception as e:
        app.logger.exception("Erreur lors de l ajout du produit dans la base de donnees")
        flash(f"Erreur lors de l ajout du produit : {str(e)}", "error")

    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if connexion:
            try:
                connexion.close()
            except Exception:
                pass
    
    return redirect(url_for('admin'))

# Liste des produits pour admin
@app.route('/api/admin/produits', methods=['GET'])
def api_admin_produits():
    connexion = None
    cursor = None
    try:
        connexion = obtenir_connexion()
        cursor = connexion.cursor(buffered=True)
        cursor.execute("SELECT id_livre, nom_livre, categorie, prix FROM livre ORDER BY id_livre DESC")
        rows = cursor.fetchall() or []
        produits = []
        for r in rows:
            produits.append({'id': r[0], 'name': r[1], 'category': r[2], 'price': str(r[3])})
        return {"ok": True, "produits": produits}
    except mysql.connector.Error as e:
        return {"ok": False, "error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if connexion:
            connexion.close()

# Supprimer un produit
@app.route('/api/admin/produit/<int:id_livre>', methods=['DELETE'])
def api_delete_produit(id_livre):
    if not session.get('logged_in') or not session.get('is_admin'):
        return {"ok": False, "error": "Acces refuse"}, 403
    connexion = None
    cursor = None
    try:
        connexion = obtenir_connexion()
        cursor = connexion.cursor()
        cursor.execute("DELETE FROM livre WHERE id_livre = %(id)s", {"id": id_livre})
        connexion.commit()
        return {"ok": True}
    except mysql.connector.Error as e:
        return {"ok": False, "error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if connexion:
            connexion.close()

#~~~~~~~~~~~~~~~~~~ A CONFIRMER ~~~~~~~~~~~~~~~~~~~~~~~
# ROUTES API JSON (livres, panier, commandes)
# Liste des livres
@app.route('/api/livres', methods=['GET'])
def api_livres():
    connexion = None
    cursor = None
    try:
        connexion = obtenir_connexion()
        cursor = connexion.cursor(buffered=True)
        cursor.execute("SELECT id_livre, nom_livre, autheur, prix, image_livre, categorie, langue FROM livre")
        rows = cursor.fetchall() or []
        livres = []
        for r in rows:
            livres.append({
                'id_livre': r[0],
                'title': r[1],
                'author': r[2],
                'price': str(r[3]),
                'image': r[4],
                'category': r[5],
                'language': r[6],
            })
        return {"ok": True, "livres": livres}
    except mysql.connector.Error as e:
        return {"ok": False, "error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if connexion:
            connexion.close()

# Recuperer le panier
@app.route('/api/cart', methods=['GET'])
def api_get_cart():
    email = _get_logged_user_email()
    if not email:
        return {"ok": False, "error": "not_logged_in"}, 401

    connexion = None
    cursor = None
    try:
        connexion = obtenir_connexion()
        cursor = connexion.cursor(buffered=True)
        cursor.execute(
            """
            SELECT p.id_livre, l.nom_livre, l.autheur, l.prix, l.image_livre, l.categorie, l.langue, p.quantite
            FROM panier p
            JOIN livre l ON l.id_livre = p.id_livre
            WHERE p.email = %(email)s
            """,
            {"email": email}
        )
        rows = cursor.fetchall() or []

        items = []
        for r in rows:
            items.append({
                'id_livre': r[0],
                'title': r[1],
                'author': r[2],
                'price': str(r[3]),
                'image': r[4],
                'category': r[5],
                'language': r[6],
                'quantity': int(r[7]),
            })

        return {"ok": True, "items": items}
    except mysql.connector.Error as e:
        return {"ok": False, "error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if connexion:
            connexion.close()

# Synchroniser le panier
@app.route('/api/cart/sync', methods=['POST'])
def api_cart_sync():
    email = _get_logged_user_email()
    if not email:
        return {"ok": False, "error": "not_logged_in"}, 401

    payload = request.get_json(silent=True) or {}
    items = payload.get('items') or []

    connexion = None
    cursor = None
    try:
        connexion = obtenir_connexion()
        cursor = connexion.cursor(buffered=True)

        cursor.execute("DELETE FROM panier WHERE email = %(email)s", {"email": email})

        insert_sql = """
            INSERT INTO panier(email, id_livre, quantite)
            VALUES (%(email)s, %(id_livre)s, %(quantite)s)
        """

        for it in items:
            id_livre = it.get('id_livre')
            qty = it.get('quantity')
            try:
                id_livre_int = int(id_livre)
                qty_int = int(qty)
            except (TypeError, ValueError):
                continue
            if qty_int <= 0:
                continue

            cursor.execute(insert_sql, {
                "email": email,
                "id_livre": id_livre_int,
                "quantite": qty_int,
            })

        connexion.commit()
        return {"ok": True}
    except mysql.connector.Error as e:
        if connexion:
            connexion.rollback()
        return {"ok": False, "error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if connexion:
            connexion.close()


# Finaliser la commande
@app.route('/commander', methods=['POST'])
def commander():
    if not session.get('logged_in'):
        return {"ok": False, "error": "Veuillez vous connecter pour commander."}, 401

    email = session.get('email')
    wilaya = request.form.get('wilaya') or 'Alger'

    connexion = None
    cursor = None
    try:
        connexion = obtenir_connexion()
        cursor = connexion.cursor(buffered=True)

        cursor.execute("""
            SELECT p.id_livre, p.quantite, l.prix 
            FROM panier p 
            JOIN livre l ON p.id_livre = l.id_livre 
            WHERE p.email = %(email)s
        """, {"email": email})
        items = cursor.fetchall()

        if not items:
            return {"ok": False, "error": "Votre panier est vide."}, 400

        prix_total = sum(float(prix) * int(quantite) for _, quantite, prix in items)

        cursor.execute("""
            INSERT INTO commande (email, wilaya_livraison, statue, prix_total) 
            VALUES (%(email)s, %(wilaya)s, 'En attente', %(prix_total)s)
        """, {"email": email, "wilaya": wilaya, "prix_total": prix_total})
        id_commande = cursor.lastrowid

        for id_livre, quantite, prix in items:
            cursor.execute("""
                INSERT INTO contient (id_commande, id_livre, quantite_commandee, prix_achat)
                VALUES (%(id_cmd)s, %(id_lv)s, %(qty)s, %(px)s)
            """, {"id_cmd": id_commande, "id_lv": id_livre, "qty": quantite, "px": prix})

        cursor.execute("DELETE FROM panier WHERE email = %(email)s", {"email": email})

        connexion.commit()
        return {"ok": True}

    except mysql.connector.Error as e:
        if connexion:
            connexion.rollback()
        return {"ok": False, "error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if connexion:
            connexion.close()
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  



# API: Liste de toutes les commandes (admin)
@app.route('/api/admin/commandes', methods=['GET'])
def api_admin_commandes():
    if not session.get('logged_in') or not session.get('is_admin'):
        return jsonify({"ok": False, "error": "Acces refuse"}), 403
    connexion = None
    cursor = None
    try:
        connexion = obtenir_connexion()
        cursor = connexion.cursor(dictionary=True, buffered=True)
        cursor.execute("""
            SELECT
                c.id_commande,
                u.nom,
                u.prenom,
                u.num_telephone,
                c.wilaya_livraison,
                c.date_commande,
                c.prix_total,
                c.statue,
                GROUP_CONCAT(l.nom_livre ORDER BY l.nom_livre SEPARATOR ', ') AS produits
            FROM commande c
            JOIN utilisateur u ON c.email = u.email
            JOIN contient ct ON c.id_commande = ct.id_commande
            JOIN livre l ON ct.id_livre = l.id_livre
            GROUP BY c.id_commande
            ORDER BY c.date_commande DESC
        """)
        rows = cursor.fetchall() or []
        commandes = []
        for r in rows:
            commandes.append({
                'id_commande': r['id_commande'],
                'client': (r['nom'] or '') + ' ' + (r['prenom'] or ''),
                'telephone': str(r['num_telephone']) if r['num_telephone'] else 'N/A',
                'wilaya': r['wilaya_livraison'] or 'N/A',
                'date': str(r['date_commande']) if r['date_commande'] else 'N/A',
                'prix_total': str(r['prix_total']) if r['prix_total'] else '0',
                'statue': r['statue'] or 'En attente',
                'produits': r['produits'] or 'N/A',
            })
        return jsonify({"ok": True, "commandes": commandes})
    except mysql.connector.Error as e:
        return jsonify({"ok": False, "error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if connexion: connexion.close()


# API: Changer le statut d une commande (admin)
@app.route('/api/admin/commande/<int:id_commande>/statue', methods=['POST'])
def api_update_commande_statue(id_commande):
    if not session.get('logged_in') or not session.get('is_admin'):
        return jsonify({"ok": False, "error": "Acces refuse"}), 403
    data = request.get_json(silent=True) or {}
    new_statue = data.get('statue')
    statuts_valides = ['En attente', 'Validée', 'Livrée', 'Annulée']
    if new_statue not in statuts_valides:
        return jsonify({"ok": False, "error": "Statut invalide"}), 400
    connexion = None
    cursor = None
    try:
        connexion = obtenir_connexion()
        cursor = connexion.cursor()
        cursor.execute(
            "UPDATE commande SET statue = %(statue)s WHERE id_commande = %(id)s",
            {"statue": new_statue, "id": id_commande}
        )
        connexion.commit()
        return jsonify({"ok": True})
    except mysql.connector.Error as e:
        return jsonify({"ok": False, "error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if connexion: connexion.close()


# API: Historique des commandes de l utilisateur connecte
@app.route('/api/user/commandes', methods=['GET'])
def api_user_commandes():
    if not session.get('logged_in'):
        return jsonify({"ok": False, "error": "Non authentifie"}), 401
    email = session.get('email')
    connexion = None
    cursor = None
    try:
        connexion = obtenir_connexion()
        cursor = connexion.cursor(dictionary=True, buffered=True)
        cursor.execute("""
            SELECT
                c.id_commande,
                c.date_commande,
                c.prix_total,
                c.wilaya_livraison,
                c.statue,
                GROUP_CONCAT(l.nom_livre ORDER BY l.nom_livre SEPARATOR ', ') AS produits
            FROM commande c
            JOIN contient ct ON c.id_commande = ct.id_commande
            JOIN livre l ON ct.id_livre = l.id_livre
            WHERE c.email = %(email)s
            GROUP BY c.id_commande
            ORDER BY c.date_commande DESC
        """, {"email": email})
        rows = cursor.fetchall() or []
        commandes = []
        for r in rows:
            statue = r['statue'] or 'En attente'
            statue_class = 'pending'
            if statue.lower() in ('livrée', 'livree'):
                statue_class = 'delivered'
            elif statue.lower() in ('annulée', 'annulee'):
                statue_class = 'cancelled'
            elif statue.lower() in ('validée', 'validee'):
                statue_class = 'validated'
            commandes.append({
                'id_commande': r['id_commande'],
                'date': str(r['date_commande']) if r['date_commande'] else 'N/A',
                'produits': r['produits'] or 'N/A',
                'prix_total': str(r['prix_total']) if r['prix_total'] else '0',
                'wilaya': r['wilaya_livraison'] or 'N/A',
                'statue': statue,
                'statue_class': statue_class,
            })
        return jsonify({"ok": True, "commandes": commandes})
    except mysql.connector.Error as e:
        return jsonify({"ok": False, "error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if connexion: connexion.close()


# Demarrage
if __name__ == '__main__':
    app.run(debug=True)