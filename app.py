import os
from datetime import timedelta
from flask import Flask, render_template, request, redirect, url_for, flash, session
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = 'adlis_secret_key_pour_les_sessions'
app.permanent_session_lifetime = timedelta(days=7)

@app.after_request
def set_response_headers(response):
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0, private'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

#DB configue
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

ADMIN_CREDENTIALS = {
    "yanni.serrour@fgei.ummto.dz": "admin123",
    "nadjib.sadouki@fgei.ummto.dz": "admin123",
    "salim@fgei.ummto.dz": "admin123"
}

# les chemain
@app.route('/')
@app.route('/index')
@app.route('/index.html')
def index():
    return render_template('index.html')

@app.route('/auth')
@app.route('/auth.html')
def auth():
    if session.get('logged_in'):
        return redirect(url_for('index'))
    return render_template('auth.html')

@app.route('/formulaire')
@app.route('/formulaire.html')
def formulaire():
    return render_template('formulaire.html')

@app.route('/profile')
@app.route('/profile.html')
def profile():
    if not session.get('logged_in'):
        flash("Veuillez vous connecter pour accéder à votre profil.", "error")
        return redirect(url_for('auth'))

    user = {
        'nom': session.get('nom', 'Utilisateur'),
        'prenom': session.get('prenom', ''),
        'age': 34,
        'email': session.get('email', ''),
        'telephone': '0612345678',
        'ville': 'Alger',
        'avatar': 'profil-de-lutilisateur.png'
    }

    purchase_history = [
        {
            'date': '12/04/2026',
            'produit': "L'Alchimiste",
            'prix': '1200 DA',
            'status': 'Livré',
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

@app.route('/produit')
@app.route('/produit.html')
def produit():
    return render_template('produit.html')

@app.route('/panier')
@app.route('/panier.html')
def panier():
    if not session.get('logged_in'):
        flash("Veuillez vous connecter pour accéder au panier.", "error")
        return redirect(url_for('auth'))
    return render_template('panier.html')

@app.route('/admin')
@app.route('/admin.html')
def admin():
    if not session.get('logged_in') or not session.get('is_admin'):
        flash("Accès refusé. Cette zone est réservée aux administrateurs.", "error")
        return redirect(url_for('index'))
    return render_template('admin.html')



#DB inscription
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
        flash("Mot de passe trop court (8 caractères minimum)", "error")
        return redirect(url_for('auth'))
    
    connexion = None
    cursor = None
    try: 
        connexion = obtenir_connexion()
        cursor = connexion.cursor()
        
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
            
            flash("Inscription réussie ! Veuillez vous connecter.", "success")
            return redirect(url_for('auth'))
        
    except mysql.connector.Error as e:
        flash(f"Erreur technique de base de données : {e}")
        return redirect(url_for('auth'))
    
    finally:
        if cursor:
            cursor.close()
        if connexion:
            connexion.close()


#DB : connexion
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
            
            flash("Connexion Administrateur réussie !", "success")
            return redirect(url_for('admin')) 
        else:
            flash("Email ou mot de passe incorrect.", "error")
            return redirect(url_for('auth'))

    connexion_db = None
    cursor = None
    try: 
        connexion_db = obtenir_connexion()
        cursor = connexion_db.cursor()
        
        cursor.execute("SELECT email, nom, prenom, mot_de_passe FROM utilisateur WHERE email = %(email)s", {"email": email})
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
            flash("Connexion réussie !", "success")
            return redirect(url_for('index'))
    
    except mysql.connector.Error as e:
        flash(f"Erreur de connexion : {e}")
        return redirect(url_for('auth'))
    
    finally:
        if cursor:
            cursor.close()
        if connexion_db: 
            connexion_db.close()
            

@app.route('/deconnexion')
def deconnxion():
    session.clear()
    return redirect(url_for('index'))


@app.route('/admin/ajouter_produit', methods=['POST'])
def ajouter_produit():
    if not session.get('logged_in') or not session.get('is_admin'):
        flash("Accès refusé.", "error")
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
        INSERT INTO livre (titre, auteur, categorie, langue, prix, image)
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
            app.logger.info(f"Livre inséré. Nombre de livres en base: {nb_livres}")
        except Exception:
            app.logger.exception("Impossible de récupérer le nombre de livres après insertion.")

        flash("Le livre a été ajouté avec succès !", "success")

    except Exception as e:
        app.logger.exception("Erreur lors de l'ajout du produit dans la base de données")
        flash(f"Erreur lors de l'ajout du produit : {str(e)}", "error")

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

    
if __name__ == '__main__':
    app.run(debug=True)