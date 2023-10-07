from flask import Flask, render_template, request, redirect, g, url_for, session
from database import get_db, close_db
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash
from form import RegistrationForm, LoginForm
from datetime import datetime
from functools import wraps

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
app.teardown_appcontext(close_db)

@app.before_request
def logged_in_user():
    g.user_name = session.get("user_name", None)

def login_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if g.user_name is None:
            return redirect(url_for("login", next=request.url))
        return view(*args,**kwargs)
    return wrapped_view 
    
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/game")
def game():
    return render_template("game.html")

@app.route("/leaderboard")
def leaderboard():
    db = get_db()
    #top 10 high scores
    top_scores = db.execute(""" SELECT * FROM scores ORDER BY score DESC LIMIT 10;""").fetchall()
    return render_template("leaderboard.html", top_scores=top_scores)

@app.route("/register", methods=["GET","POST"])
def register():
    form = RegistrationForm()

    if form.validate_on_submit():
        user_name = form.user_name.data
        user_name = user_name.lower()
        user_name = user_name.title()
        password = form.password.data
        password2 = form.password2.data
        db = get_db()
 
        #checking for clashing names
        possible_clashing_user = db.execute(""" SELECT * FROM login WHERE user_name=?;""",(user_name,)).fetchone()

        if possible_clashing_user is not None:
            form.user_name.errors.append("Username already taken!")
        else:
            db.execute(""" INSERT INTO login (user_name,password) VALUES (?,?)""",(user_name,generate_password_hash(password)))
            db.commit()
            return redirect(url_for("login"))


    return render_template("register.html", form=form)

@app.route("/login", methods=["GET","POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user_name = form.user_name.data
        user_name = user_name.lower()
        user_name = user_name.title()
        password = form.password.data
        db = get_db()
        possible_clashing_user = db.execute(""" SELECT * FROM login WHERE user_name=?;""",(user_name,)).fetchone()
        if possible_clashing_user is None:
            form.user_name.errors.append("No such users!")
        elif not check_password_hash(possible_clashing_user["password"], password):
            form.password.errors.append("Incorrect password!")
        else:
            session.clear()
            session["user_name"] = user_name
            db = get_db() 

            next_page = request.args.get("next")
            if not next_page:
                next_page = url_for("index")

            return redirect(next_page)

    return render_template("login.html", form=form)

@app.route("/logout")
def logout():
    session.clear()
    return redirect( url_for("index"))

@app.route("/store_score", methods=["POST"])
def store_score():
    print(request.form)
    score = int(request.form["score"])
    time = request.form["time"]
    small_mob = request.form["small_mob"]
    medium_mob = request.form["medium_mob"]
    large_mob = request.form["large_mob"]
    record_date = datetime.now().strftime("%Y-%m-%d")
    db = get_db()
    if session:
        user_records = db.execute(""" SELECT * FROM scores WHERE user_name = ?;""", (g.user_name,)).fetchone()
        if user_records is None:
            db.execute(""" INSERT INTO scores (user_name,score,small_mob,medium_mob,large_mob,time,date) VALUES (?,?,?,?,?,?,?);""", (g.user_name,score,small_mob,medium_mob,large_mob,time,record_date))
            db.commit()
        else:
            current_score = user_records["score"]
            if score > current_score:
                db.execute(""" UPDATE scores SET score = ?, time = ?, date = ?, small_mob = ?, medium_mob = ?, large_mob = ? WHERE user_name = ?;""", (score,time,record_date,small_mob,medium_mob,large_mob,g.user_name))
                db.commit()        
        return "success"
    return "failure"