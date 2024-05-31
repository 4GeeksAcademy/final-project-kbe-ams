import json, os, functools
from datetime import timedelta
from types import SimpleNamespace
from flask import jsonify, request, Response
from flask_jwt_extended import *
from scrypt import hash
from .aws_utils import get_public_link, DEFAULT_ICON, DEFAULT_THUMBNAIL
from .utils import get_current_timestamp, get_current_millistamp, read_file, fnv1256, fnv1128, fnv164, fnv132
from .models import db, User, Workspace, Board, List, Task

current_app= None
ENV = "dev" if os.environ.get("FLASK_DEBUG", "0") == "1" else "prod"

MIMETYPE_PLAIN= 'text/plain'
MIMETYPE_JSON= 'application/json'
MIMETYPE_MULTIPART= 'multipart/form-data'

CONTENT_TYPE_PLAIN= {'Content-Type': MIMETYPE_PLAIN}
CONTENT_TYPE_JSON= {'Content-Type': MIMETYPE_JSON}
CONTENT_TYPE_MULTIPART= {'Content-Type': MIMETYPE_MULTIPART}

#--- check a list of properties against data
def check_missing_properties_manual(data, props):
  for p in props:
    if not p in data:
      return f"missing required property '{p}'"
  return None

def response_plain(status:int, data=None) -> Response:
  return Response( data, status, mimetype= MIMETYPE_PLAIN )

def response(status:int, msg:str, data=None, debug=None) -> Response:
  obj= { "msg": msg }
  if data: obj['res']= data
  if debug: obj['_']= json.loads(json.dumps(debug, default=json_object_safe))
  return Response( json.dumps(obj), status, mimetype= MIMETYPE_JSON )

def response_119(user:dict): return response(119, "session refreshed", user, None) # non-standard HTTP status code

def response_200(data=None, debug=None): return response(200, "ok", data, debug)
def response_201(data=None, debug=None): return response(201, "created", data, debug)
def response_400(data=None, debug=None): return response(400, "bad request", data, debug)
def response_401(data=None, debug=None): return response(401, "unauthorized", data, debug)
def response_403(data=None, debug=None): return response(403, "forbidden", data, debug)
def response_404(): return response(404, "not found", None, None)
def response_419(): return response(404, "session expired", None, None)
def response_500(data=None, debug=None): return response(500, "server error", data, debug)

def json_object_safe(obj):
  dict= obj.__dict__
  return dict if dict else type(obj).__name__

#--- get the user with given username and email
def get_user(username:str=None, email:str=None) -> tuple[User|None, int|None]:
  user= db.session.query(User).filter(User.email==email or User.username==username).first()
  mode= None
  if user: mode= 1 if user.username==username else 2
  return user, mode

#--- get the user by acount
def get_user_by_username_or_email(account:str) -> tuple[User|None, int|None]:
  return get_user(account, account)

#--- get the user by current jwt identity
def get_user_by_identity() -> tuple[User|None, Response|None]:
  try:
    identity= get_jwt_identity()
    user= db.session.query(User).filter(User.email==identity['e'] or User.username==identity['u']).first()
    if not user: None, response(400, "invalid or expired session")
  except Exception as e: return None, response_500(repr(e))
  return user, None

def get_user_by_username(username:str):
  return db.session.query(User).filter(User.username==username).first()

def get_user_by_email(email:str):
  return db.session.query(User).filter(User.email==email).first()

#--- check the user's login
def get_user_login(account:str, password:str) -> tuple[User|None, Response|None]:
  user= get_user_by_username(account)
  if not user: user= get_user_by_email(account)
  if not user: return None, response(400, "invalid credentials")
  print(user.serialize())
  # bad password returns a 401 unauthorized instead of 400 bad request just so we can do a fast check to prompt a "forgot password" shit in frontend
  if not check_password(password, user.password): return None, response(401, "invalid password")
  return user, None

#--- create both refresh and access tokens for a given user -- called ONLY on login
def create_new_tokens(response:Response, user:User, remember:bool) -> Response:
  identity= {
    'i': user.id,
    'u': user.username, 
    'e': user.email, 
    'p': user.permission, 
    't': user.millistamp
  }
  create_new_refresh_token(identity, remember)
  return create_new_access_token(response, identity)

#--- checks and tries to rotate (renew) the tokens automatically if their expiry date is coming
def test_rotate_tokens(response:Response, apayload:dict, identity) -> Response:
  
  # refresh token
  target_timestamp = get_current_timestamp() + timedelta(minutes=30)
  user, _= get_user(identity['u'], identity['e'])
  if user and user.refreshtoken:
    rpayload= decode_token(str(user.refreshtoken, 'utf-8'))
    if target_timestamp > rpayload['exp']:
      create_new_refresh_token(identity, rpayload['r'])

  # access token
  target_timestamp = get_current_timestamp() + timedelta(minutes=5)
  if target_timestamp > apayload['exp']:
    return create_new_access_token(response, identity)

#--- creates a new refresh token
def create_new_refresh_token(identity, remember:bool):
  # refresh token -- lifespan: 30 days if 'remember', 16 hours if not
  rtoken = create_refresh_token(identity, additional_claims={'r':remember}, expires_delta=None if remember else timedelta(hours=16)) # expires= None means 30 days by our jwt settings
  user= db.session.get(User, identity['i'])
  if user:
    user.refreshtoken= bytes(rtoken, 'utf-8')
    db.session.commit()

#--- creates a new access token
def create_new_access_token(response:Response, identity) -> Response:
  # access token -- lifespan: 15 min
  atoken = create_access_token(identity)
  set_access_cookies(response, atoken, max_age=timedelta(minutes=30)) # access token is saved on cookie, if not 'remember', its deleted on session end (navigator close)
  return response

#--- remove user tokens
def remove_token_cookie() -> Response:
  fres= response_200()
  unset_access_cookies(fres, domain=current_app.config['SERVER_NAME'])
  return fres

#--- check valid access for a token and returns the user
def get_user_with_check_access(identity:str=None) -> tuple[User|None, Response|None]:
  if not identity: 
    identity = get_jwt_identity()
    if not identity: return None, response_401() # unauthorized -- NOT logged-in
  user= User.query.filter((User.username==identity['u'] and User.email==identity['e'])).first()
  if not user: return None, response(400, "bad token") # shouldn't ever happen
  return user, None

#--- check valid access for a token
def check_user_forbidden(level:int=0) -> Response|None:
  user_identity = get_jwt_identity()
  if not user_identity: return response_401() # unauthorized -- NOT logged-in
  _, error= get_user_with_check_access(user_identity)
  if error: return error
  if user_identity['p'] < level: return response_403() # forbidden -- NOT allowed
  return None
    
#--- encrypt a password
def hash_password(password:str) -> bytes:

  const= fnv1256(current_app.config["JWT_SECRET_KEY"])

  hashparts=[
    str(fnv132(f"{password}{current_app.config['JWT_SECRET_KEY']}")),
    str(fnv164(f"{current_app.config['JWT_SECRET_KEY']}{password}"))
  ]

  nbytes= bytes("".join(hashparts), 'utf-8')
  hash= fnv1256(password)

  result = bytearray()

  for b in nbytes:
    hash= hash * const
    hash= hash ^ b
    result.append(hash & 0xFF)

  return bytes(result)

#--- test a password
def check_password(input:str, hashed:bytes) -> bool:
  if input == str(hashed): return True
  return hash_password(input) == hashed

#--- custom decorator, a safe endpoint wrapper and data retriever
# wrapper version of the one commented above
def endpoint_safe(
    content_type: str = None,
    data_type: str = None,
    required_props: tuple = None,
    props_strict: bool = False,
    required_params: tuple = None,
    params_strict: bool = False
) -> any:
  
  def wrapper(fn):
    @functools.wraps(fn)
    def decorator(*args, **kwargs):

      __parsed_data__= {}
      __type= data_type
      
      #try:
      if content_type: # check for content_type
        if not 'Content-Type' in request.headers or request.headers['Content-Type'] != content_type: return response(400, f"Content-Type is not '{content_type}'")
        if __type: return response(400, "cannot define shell data-type if content-type is beign defined")
        if content_type == 'application/json':
          if not request.data: return response(400, "body must contain data")
          __type= "json"
        elif content_type == 'multipart/form-data':
          if not request.form and not request.files: return response(400, "body must contain data")
          __type= "multipart"
      if __type:
        if __type=="json": # parse json
          try: __parsed_data__['json']= request.get_json(force=True)
          except: return response(400, "body contains no valid JSON")
          if not __parsed_data__['json'] and required_props: return response(400, "body contains no JSON")
        if __type=="multipart": # parse multipart json + files
          try: __parsed_data__['json']= json.loads(request.form['json'])
          except: pass
          try: __parsed_data__['files']= request.files
          except: pass
          if __parsed_data__['json'] and not __parsed_data__['files']: return response(400, "body contains no data")
        if required_props: # check required json properties
          if not __parsed_data__['json']: return response(400, "given required properties but no data received")
          __json= __parsed_data__['json']
          print(type(required_props))
          for p in required_props:
            if not p in __json: return response(400, f"missing required property '{p}'")
            if type(__json[p])== str and __json[p]== "": return response(400, f"empty required property '{p}'")
          if props_strict and len(__json.keys()) > len(required_props): return response(400, f"too many json properties")
      if required_params: # check required url parameters
        __params= {}
        for p in required_params:
          if not p in request.args: return response(400, f"missing required url parameter '{p}'")
          if not request.args[p] or (type(request.args[p])== str and request.args[p]== ""): return response(400, f"empty required url parameter '{p}'")
          __params[p]= request.args[p]
        if params_strict and len(__params.keys()) > len(required_params): return response(400, f"too many url parameters")
        __parsed_data__['params']= __params

      return current_app.ensure_sync(fn)(*args, **kwargs, **__parsed_data__) # execute the actual endpoint function
      
      #except Exception as e: # any unhandled error (even in endpoint function) ends up here
      #  print(e)
      #  return response_500(repr(e))
      
    return decorator

  return wrapper

# load obvects from a json file
def load_rows_from_file(filepath):

  jdata= json.loads(read_file(filepath))

  # User
  if 'users' in jdata:

    for data in jdata["users"]:
      
      try:

        # skip if already exists
        if db.session.query(User).filter(
          User.username== data['username'] or
          User.email== data['email']
        ).first(): continue

        # random avatar
        avatar= data['avatar'].lower() if data['avatar'] else 'default'
        if avatar == 'default': data['avatar']= DEFAULT_ICON['user']
        elif avatar == 'random': data['avatar']= f"https://api.dicebear.com/8.x/pixel-art/png?seed={data['username']}"
        
        data['password']= hash_password(data['password'])

        # add to database
        db.session.add(User(
          **data,
          millistamp= get_current_millistamp()
        ))

      except Exception as e:
        print(f"---- couldn't add user...\n")
        print(data)
        print(type(e), e.__repr__())
        print('\n')
        continue

  db.session.flush()
  
  # Workspace
  if 'workspaces' in jdata:
    for data in jdata["workspaces"]:
      
      try:

        thumbnail= data['thumbnail'].lower() if data['thumbnail'] else 'default'
        if thumbnail == 'default': data['thumbnail']= DEFAULT_THUMBNAIL['workspace']
        
        # add to database
        db.session.add(Workspace(
          **data,
          millistamp= get_current_millistamp()
        ))

      except Exception as e:
        print(f"---- couldn't add workspace...\n")
        print(data)
        print(type(e), e.__repr__())
        print('\n')
        continue
      
  db.session.flush()

  # Board
  if 'boards' in jdata:
    for data in jdata["boards"]:
      
      try:
        
        icon= data['icon'].lower() if data['icon'] else 'default'
        if icon == 'default': data['icon']= DEFAULT_ICON['board']
        
        thumbnail= data['thumbnail'].lower() if data['thumbnail'] else 'default'
        if thumbnail == 'default': data['thumbnail']= DEFAULT_THUMBNAIL['board']
        
        # add to database
        db.session.add(Board(
          **data,
          millistamp= get_current_millistamp()
        ))

      except Exception as e:
        print(f"---- couldn't add board...\n")
        print(data)
        print(type(e), e.__repr__())
        print('\n')
        continue
      
  db.session.flush()

  # List
  if 'lists' in jdata:
    for data in jdata["lists"]:
      
      try:

        # add to database
        db.session.add(List(
          **data,
          millistamp= get_current_millistamp()
        ))

      except Exception as e:
        print(f"---- couldn't add list...\n")
        print(data)
        print(type(e), e.__repr__())
        print('\n')
        continue
  
  db.session.flush()

  # Task
  if 'tasks' in jdata:
    for data in jdata["tasks"]:
      
      try:
        
        # add to database
        db.session.add(Task(
          **data,
          millistamp= get_current_millistamp()
        ))

      except Exception as e:
        print(f"---- couldn't add task...\n")
        print(data)
        print(type(e), e.__repr__())
        print('\n')
        continue

  db.session.commit()

#--- clears all data in the database
def clear_database(commit=True):
  for table in db.metadata.sorted_tables: db.session.execute(table.delete())
  if commit: db.session.commit()

# delete shit

def delete_user(element, commit=True):
  workspaces= element.workspaces_.all()
  if workspaces: delete_workspaces(workspaces, False)
  if element.rwr_: delete_rwr(element.rwr_, False)
  element.delete()
  if commit: db.session.commit()

def delete_workspaces(elements, commit=True):
  for e in elements:
    boards= e.boards_.all()
    if boards: delete_boards(boards, commit=False)
    if e.rwr_: delete_rwr(e.rwr_, commit=False)
    e.delete()
  if commit: db.session.commit()

def delete_boards(elements, commit=True):
  for e in elements:
    lists= e.lists_.all()
    if lists: delete_lists(lists, commit=False)
    if e.rwr_: delete_rwr(e.rwr_, commit=False)
    e.delete()
  if commit: db.session.commit()

def delete_lists(elements, commit=True):
  for e in elements:
    tasks= e.tasks_.all()
    if tasks: delete_tasks(tasks, commit=False)
    if e.rwr_: delete_rwr(e.rwr_, commit=False)
    e.delete()
  if commit: db.session.commit()

def delete_tasks(elements, commit=True):
  for e in elements:
    if e.rwr_: delete_rwr(e.rwr_, commit=False)
    e.delete()
  if commit: db.session.commit()

def delete_rwr(element, commit=True):
  rules= element.user_rules_.all()
  if rules:
    for r in rules: r.delete()
  element.delete()
  if commit: db.session.commit()
  
def delete_tag(element, commit=True):
  element.delete()
  if commit: db.session.commit()
  
def delete_style(element, commit=True):
  element.delete()
  if commit: db.session.commit()