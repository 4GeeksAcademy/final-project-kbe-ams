from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required
from .models import db, Workspace, Board
from .utils import parse_int, parse_bool
from . import api_utils
from .aws_utils import uploadFile, DEFAULT_THUMBNAIL
from .utils import get_current_millistamp

# ---------------------------------------------------------------------------- workspaces.keqqu.com/* ----------------------------------------------------------------------------

workspaces= Blueprint('workspaces', __name__, subdomain='workspaces')
@workspaces.route('/', methods=['GET'])
def handle_workspaces(): return "workspaces subdomain", 200

# -------------------------------------- /user
# get all workspaces available for the current user
@workspaces.route('/user', methods=['GET'])
@jwt_required()
def handle_workspaces_user():
  
  user, error= api_utils.get_user_by_identity()
  if error: return error

  last_id= user.last_workspace_id
  last, error= get_workspace_by_id(last_id)
  if error: last= None

  result= {
    "last": last.serialize() if last else None,
    "owned": [v.serialize() for v in user.workspaces_owned_] if user.workspaces_owned_ else [],
    "active": [v.serialize() for v in user.workspaces_] if user.workspaces_ else []
  }
  
  return api_utils.response_200(result)

# -------------------------------------- /instance
# create a workspace
@workspaces.route('/instance', methods=['POST'])
@jwt_required()
def handle_workspaces_instance_create():

  print("w")
  
  user, error= api_utils.get_user_by_identity()
  if error: return error

  workspace= Workspace(
    title='çdefault.title-workspace',
    thumbnail= DEFAULT_THUMBNAIL['workspace'],
    owner_id= user.id,
    millistamp= get_current_millistamp()
  )

  db.session.add(workspace)
  db.session.commit()
  
  return api_utils.response_200(workspace.serialize())

# get a single workspace
@workspaces.route('/instance/<int:id>', methods=['GET'])
@jwt_required()
def handle_workspaces_instance_get(id):
  
  user, error= api_utils.get_user_by_identity()
  if error: return error

  wid= parse_int(id, None)
  if not wid or wid < 1: return api_utils.response(400, f"invalid workspace id: {wid}")

  workspace, error= get_workspace_by_id(wid)
  if error: return error

  if user.id != workspace.owner_id:
    if not user.workspaces_.filter(Workspace.id == wid).first(): return api_utils.response(403, "user is not allowed in workspace")
  
  return api_utils.response_200(workspace.serialize(deep=1))

# delete a workspace (mark it as )
@workspaces.route('/delete', methods=['POST'])
@jwt_required()
@api_utils.endpoint_safe( content_type="application/json", required_props=("id") )
def handle_workspaces_instance_delete(json):
  
  user, error= api_utils.get_user_by_identity()
  if error: return error

  wid= parse_int(json['id'], None)
  if not wid or wid < 1: return api_utils.response(400, f"invalid workspace id: {wid}")

  workspace, error= get_workspace_by_id(wid)
  if error: return error

  if user.id != workspace.owner_id: return api_utils.response(403, "user doesn't own the workspace")

  if not workspace.archived:
    workspace.archived=True
    return api_utils.response(200, "archived")

  api_utils.delete_workspaces([workspace]) # this do commit()
  
  return api_utils.response(200, "deleted")

# -------------------------------------- /fetch
# get the board ids that require an update for a given 'board_id' and 'millistamp', gets everything if 'millistamp' < 0
@workspaces.route('/fetch', methods=['GET'])
@jwt_required()
def handle_workspaces_fetch():
  
  user, error= api_utils.get_user_by_identity()
  if error: return error

  # TODOOOOOO

  return api_utils.response_200()

# -------------------------------------- /list
# get workspaces lists
@workspaces.route('/list', methods=['GET'])
@jwt_required(optional=True)
def handle_workspaces_list():
  if api_utils.ENV == "prod":
    error= api_utils.check_user_forbidden(1) # check if admin if we on production
    if error: return error
  workspaces= db.session.query(Workspace).all()
  if not workspaces or len(workspaces)==0: return api_utils.response(204, "no workspaces")
  return api_utils.response_200([v.serialize() for v in workspaces])

# -------------------------------------- /millistamp
# get millistamp
# required ?id -- the workspaces id to get the millistamp from
# the implementation is intentional, this has to be as fast as possible
@workspaces.route('/millistamp', methods=['GET'])
def handle_workspaces_millistamp():
  millis= -1
  try: millis= db.session.get(Workspace, parse_int(request.args.get("id", -1))).millistamp
  except: return api_utils.response_plain(200, str(millis))

# -------------------------------------- /healthcheck
# basic health check
@workspaces.route('/healthcheck', methods=['GET'])
def handle_workspaces_healthcheck():
    return "workspaces ok", 200

# ---------------------------------------------------------------------------- HELPERS ----------------------------------------------------------------------------

def get_workspace_by_id(wid):
  if not wid or wid < 1: return None, api_utils.response(400, f"invalid workspace id: {wid}")
  workspace= db.session.get(Workspace, wid)
  if not workspace: return None, api_utils.response(404, "workspace not found")
  return workspace, None