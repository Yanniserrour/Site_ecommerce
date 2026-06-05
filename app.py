import os
from datetime import timedelta
from flask import Flask, render_template, request, redirect, url_for, flash, session
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
    DB_PASSWORD = "Yani2003@"
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
@app.route('/profile')
@app.route('/profile.html')
def profile():
    if not session.get('logged_in'):
        flash("Veuillez vous connecter pour acceder a votre profil.", "error")
        return redirect(url_for('auth'))

    user = {
        'nom': session.get('nom', 'Utilisateur'),
        'prenom': session.get('prenom', ''),
        'age': 34,
        'email': session.get('email', ''),
        'telephone': '0612345678',
        'ville': 'Alger',
        'avatar': session.get('avatar', 'profil-de-lutilisateur.png')
    }

    purchase_history = [
        {
            'date': '12/04/2026',
            'produit': "L'Alchimiste",
            'prix': '1200 DA',
            'status': 'Livre',
            'status_class': 'delivered'
        },
        {
            'date': '20/04/2026',
            'produit': 'Think Again',
            'prix': '2500 DA',
            'status': 'En cours',
            'status_class': 'pending'
        }
    ]
    return render_template('profile.html', user=user, purchase_history=purchase_history)

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
        flash("Acces refuse. Cette zone est reservee aux administrateurs.", "error")
        return redirect(url_for('index'))
    return render_template('admin.html')


# Route pour authentification et inscription: 
# Inscription
@app.route('/inscription', methods=['POST'])
def inscription(): 
    nom   = (request.form.get('nom') or '').strip()
    email = (request.form.get('email') or '').strip()
    mdp   = request.form.get('mot_de_passe') or '' 
    prenom     = "Non renseigne"
    date_naiss = "2001-09-11"
    num_tel    = 0  

    if not nom or not email or not mdp:
        flash("Tous les champs sont requis.", "error")
        return redirect(url_for('auth'))

    if len(mdp) < 8: 
        flash("Mot de passe trop court (8 caracteres minimum)", "error")
        return redirect(url_for('auth'))
    
    connexion = None
    cursor = None
    try: 
        connexion = obtenir_connexion()
        cursor = connexion.cursor(buffered=True)
        
        cursor.execute("SELECT email FROM utilisateur WHERE email = %(email)s", {"email": email})
        compte_existant = cursor.fetchone()
        
        if compte_existant:
            flash("Compte existant, veuillez vous connecter", "error")
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

# Connexion
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
            session['user_name'] = utilisateur[1]
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

# Deconnexion
@app.route('/deconnexion')
def deconnxion():
    session.clear()
    return redirect(url_for('index'))

# Route pour le profil et avatar: 
@app.route('/profile/update_avatar', methods=['POST'])
def update_avatar():
    if not session.get('logged_in'):
        return redirect(url_for('auth'))

    nom_avatar = request.form.get('avatar_choice')
    if not nom_avatar:
        flash("Aucun avatar selectionne.", "error")
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


# Route pour l'ajout des produits a partir de admin
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

# ROUTES: API JSON (livres, panier, commandes)
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

        cursor.execute("""
            INSERT INTO commande (email, wilaya_livraison, statue) 
            VALUES (%(email)s, %(wilaya)s, 'En attente')
        """, {"email": email, "wilaya": wilaya})
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

# Demarrage: 
if __name__ == '__main__':
    app.run(debug=True)