"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from flask_jwt_extended import create_access_token, get_jwt_identity, get_jwt, jwt_required

from api.models import db, User,TokenBlockedList
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt


app = Flask(__name__)
bcrypt = Bcrypt(app)

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

@api.route('/signup', methods=['POST'])
def user_signup():
    body = request.get_json()

    if 'email' not in body:
        return jsonify({"msg": "El campo email es obligatorio"}), 400
    if 'password' not in body:
        return jsonify({"msg": "El campo password es obligatorio"}), 400
    encrypted_password=bcrypt.generate_password_hash(body["password"]).decode('utf-8')
    user = User(email=body['email'], 
                password=encrypted_password, is_active=True)
    
    if "first_name" in body:
        user.first_name=body["first_name"]
    else:
        user.first_name=""

    if "last_name" in body:
        user.last_name=body["last_name"]
    else:
        user.last_name=""
    db.session.add(user)
    db.session.commit()
    return jsonify({"msg":"ok"})   

@api.route('/login', methods=['POST'])
def user_login():
    print(request.get_json()) 
    body=request.get_json()
    # Valido los campos del body de la peticion
    if 'email' not in body:
        return jsonify({"msg": "El campo email es requerido"}), 400
    if 'password' not in body:
        return jsonify({"msg": "El campo password es requerido"}), 400
        # busco al usuario en la base de datos con el correo
    user=User.query.filter_by(email=body["email"]).first()
        # si el usuario no esta, retorno error
    if user is None:
        return jsonify({"msg":"Usuario no encontrado"}),404
        # comparo el password que introduce con el de la base de datos 
    password_checked=bcrypt.check_password_hash(user.password, body["password"]) # returns True
        # Si es incorrecta la contraseña retorna error
    if password_checked ==False:
        return jsonify({"msg":"Contraseña erronea"}),401

    token = create_access_token(
        identity=user.id, additional_claims={"role":"user"})
    return jsonify({"token":token}),200 

@api.route('/logout', methods=['POST'])
@jwt_required()
def user_logout():
    jti=get_jwt()["jti"]
    token_blocked=TokenBlockedList(jti=jti)
    db.session.add(token_blocked) 
    db.session.commit()
    return jsonify({"msg":"Sesion cerrada"})

@api.route('/userinfo', methods=['GET'])
@jwt_required()
def user_info():
    user = get_jwt_identity()
    load = get_jwt()
    return jsonify({"user":user, "role":load["role"]})