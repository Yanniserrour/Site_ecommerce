from flask import Flask, render_template

app = Flask(__name__)
app.secret_key = 'adlis_secret_key_pour_les_sessions'

# Route pour la page d'accueil (index)
@app.route('/')
@app.route('/index')
@app.route('/index.html')
def index():
    return render_template('index.html')

# Route pour la page d'authentification
@app.route('/auth')
@app.route('/auth.html')
def auth():
    return render_template('auth.html')

# Route pour la page de formulaire de commande
@app.route('/formulaire')
@app.route('/formulaire.html')
def formulaire():
    return render_template('formulaire.html')

# Route pour la page de profil
@app.route('/profile')
@app.route('/profile.html')
def profile():
    user = {
        'nom': 'Nadjib',
        'prenom': 'Yani',
        'age': 34,
        'email': 'nadjib.yani@example.com',
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

# Route pour la page des produits
@app.route('/produit')
@app.route('/produit.html')
def produit():
    return render_template('produit.html')

# Route pour la page du panier
@app.route('/panier')
@app.route('/panier.html')
def panier():
    return render_template('panier.html')

# Route pour la page administrateur
@app.route('/admin')
@app.route('/admin.html')
def admin():
    return render_template('admin.html')

# Démarrer le serveur Flask en mode de débogage (debug)
if __name__ == '__main__':
    app.run(debug=True)
