from flask import Flask
from flask_wtf import FlaskForm
from flask_wtf.file import FileAllowed, FileRequired
from wtforms import BooleanField, SubmitField, StringField, SelectField, RadioField, DateField, PasswordField, IntegerField, EmailField, FileField
from wtforms.validators import InputRequired, NumberRange, EqualTo, Email, DataRequired


class RegistrationForm(FlaskForm):
    user_name = StringField("Username:", validators=[DataRequired("Username required")])
    password = PasswordField("Password:", validators=[DataRequired("Password required")])
    password2 = PasswordField("Confirm Password:", validators=[DataRequired("Please confirm password"), EqualTo("password", message="Passwords Must be Equal")])
    submit = SubmitField("submit")

class LoginForm(FlaskForm):
    user_name = StringField("Username:", validators=[DataRequired("Username required")])
    password = PasswordField("Password:", validators=[DataRequired("Password required")])
    submit = SubmitField("submit")

