from flask import Flask, render_template, request, redirect, url_for, flash
import oracledb
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'adlis_secret_key_pour_les_sessions'

#DB configue
ENV = 'DEVELOPPEMENT' 

if ENV == "DEVELOPPEMENT":
    DB_USER     = "system"
    DB_PASSWORD = "yani"
    DB_DSN      = "localhost:1521/XEPDB1"
else: 
    DB_USER     = "adlis_prod" #a changer
    DB_PASSWORD = "mot_de_passe_distant" #a changer
    DB_DSN      = "serveur_debergement" #a changer

def obtenir_connexion():
    return oracledb.connect(user=DB_USER, password=DB_PASSWORD, dsn=DB_DSN)

# les chemain
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/auth')
def auth():
    return render_template('auth.html')

@app.route('/formulaire')
def formulaire():
    return render_template('formulaire.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/produit')
def produit():
    return render_template('produit.html')

@app.route('/panier')
def panier():
    return render_template('panier.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')

#DB inscription
@app.route('/inscription', methods=['POST'])
def inscription(): 
    nom   = request.form.get('nom')
    email = request.form.get('email')
    mdp   = request.form.get('mot_de_passe')
    
    # Valeurs par défaut 
    prenom     = "Non renseigne"
    date_naiss = "2001-09-11"
    num_tel    = 0  

    if len(mdp) < 8: 
        flash("Mot de passe trop court (8 caractères minimum)")
        return redirect(url_for('auth'))
    
    connexion = None
    try: 
        connexion = obtenir_connexion()
        cursor = connexion.cursor()
        
        cursor.execute("SELECT email FROM utilisateur WHERE email = :email", [email])
        compte_existant = cursor.fetchone()
        
        if compte_existant: 
            flash("Compte existant, veuillez vous connecter")
            return redirect(url_for('auth'))
        else:
            mdp_hashed = generate_password_hash(mdp)
            
            requete_sql = """
            INSERT INTO utilisateur(email, nom, prenom, date_naissance, mot_de_passe, num_telephone)
            VALUES(:email, :nom, :prenom, TO_DATE(:date_naiss, 'YYYY-MM-DD'), :mdp_hashed, :num_tel)
            """
            
            cursor.execute(requete_sql, {
                "email": email, "nom": nom, "prenom": prenom, 
                "date_naiss": date_naiss, "mdp_hashed": mdp_hashed, "num_tel": num_tel
            })
            connexion.commit()
            
            flash("Inscription réussie ! Connectez-vous maintenant.")
            return redirect(url_for('auth'))
        
    except oracledb.DatabaseError as e:
        error, = e.args
        flash(f"Erreur technique de base de données : {error.message}")
        return redirect(url_for('auth'))
    
    finally:
        if connexion:
            cursor.close()
            connexion.close()


#DB : connexion
@app.route('/connexion', methods=['POST'])
def connexion():
    email = request.form.get('email')
    mdp   = request.form.get('mot_de_passe')
    
    connexion = None
    try: 
        connexion = obtenir_connexion()
        cursor    = connexion.cursor()
        
        cursor.execute("SELECT email, mot_de_passe FROM utilisateur WHERE email = :email", [email])
        utilisateur = cursor.fetchone()
        
        if not utilisateur:
            flash("Email ou mot de passe incorrect.")
            return redirect(url_for('auth'))
        else:
            mot_de_passe_hashed_stock = utilisateur[1]
            
            if check_password_hash(mot_de_passe_hashed_stock, mdp):
                flash("Connexion réussie !")
                return redirect(url_for('index')) 
            else: 
                flash("Email ou mot de passe incorrect.")
                return redirect(url_for('auth'))
    
    except oracledb.DatabaseError as e:
        error, = e.args
        flash(f"Erreur de connexion : {error.message}")
        return redirect(url_for('auth'))
    
    finally:
        if connexion: 
            cursor.close()
            connexion.close()

if __name__ == '__main__':
    app.run(debug=True, port=50000)