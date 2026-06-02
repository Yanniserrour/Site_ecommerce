from flask import Flask, render_template

app = Flask(__name__)
app.secret_key = 'adlis_secret_key_pour_les_sessions'

# Route pour la page d'accueil (index)
@app.route('/')
def index():
    return render_template('index.html')

# Route pour la page d'authentification
@app.route('/auth')
def auth():
    return render_template('auth.html')

# Route pour la page de formulaire de commande
@app.route('/formulaire')
def formulaire():
    return render_template('formulaire.html')

# Route pour la page de profil
@app.route('/profile')
def profile():
    return render_template('profile.html')

# Route pour la page des produits
@app.route('/produit')
def produit():
    return render_template('produit.html')

# Route pour la page du panier
@app.route('/panier')
def panier():
    return render_template('panier.html')

# Route pour la page administrateur
@app.route('/admin')
def admin():
    return render_template('admin.html')

# Démarrer le serveur Flask en mode de débogage (debug)
if __name__ == '__main__':
    app.run(debug=True)