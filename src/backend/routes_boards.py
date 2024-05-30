from flask import request, Blueprint
from flask_jwt_extended import jwt_required
from .models import db, User, Board, List, Style, Tag
from .utils import parse_int, parse_bool
from . import api_utils
from .aws_utils import uploadFile, DEFAULT_ICON, DEFAULT_THUMBNAIL
from .utils import get_current_millistamp

# ---------------------------------------------------------------------------- boards.keqqu.com/* ----------------------------------------------------------------------------

boards= Blueprint('boards', __name__, subdomain='boards')
@boards.route('/', methods=['GET'])
def handle_boards(): return "boards subdomain", 200

# -------------------------------------- /user
# get all boards available for the current user
@boards.route('/user', methods=['GET'])
@jwt_required()
def handle_boards_user():
  
  user, error= api_utils.get_user_by_identity()
  if error: return error

  last= db.session.query(Board).filter(Board.id== user.last_board_id).first()
  result= {
    "last": last.serialize() if last else None,
    "owned": [v.serialize() for v in user.boards_owned_] if user.boards_owned_ else [],
    "active": [v.serialize() for v in user.boards_] if user.boards_ else []
  }
  
  return api_utils.response_200(result)

# -------------------------------------- /instance
# create a board
# optional json 'workspace_id' -- the workspace to add it on (board will be orphan if ommited)
@boards.route('/instance', methods=['POST'])
@jwt_required()
@api_utils.endpoint_safe( content_type="application/json" )
def handle_boards_instance_create(json):

  print("b")
  
  user, error= api_utils.get_user_by_identity()
  if error: return error

  wid= parse_int(json['workspace_id'], -1) if 'workspace_id' in json else None
  if wid != None and wid < 1: return api_utils.response(400, f"invalid workspace_id: {wid}")

  board= Board(
    name='/default.title-board',
    description="/placeholder.description",
    icon= DEFAULT_ICON['board'],
    thumbnail= DEFAULT_THUMBNAIL['board'],
    owner_id= user.id,
    workspace_id= wid,
    settings="2048|2048|0|0|1.0|#777",
    millistamp= get_current_millistamp()
  )

  db.session.add(board)
  db.session.commit()
  
  return api_utils.response_200(board.serialize())

# get a single board
@boards.route('/instance/<int:id>', methods=['GET'])
@jwt_required()
def handle_boards_instance_get(id):
  
  user, error= api_utils.get_user_by_identity()
  if error: return error

  bid= parse_int(id, None)
  if not bid or bid < 1: return api_utils.response(400, f"invalid board id: {bid}")

  board, error= get_board_by_id(bid)
  if error: return error

  if user.id != board.owner_id:
    if not user.boards_.filter(Board.id== bid).first(): return api_utils.response(403, "user has no permission to get board")
  
  return api_utils.response_200(board.serialize(deep=1))

# delete a workspace (mark it as )
@boards.route('/delete', methods=['POST'])
@jwt_required()
@api_utils.endpoint_safe( content_type="application/json", required_props=("id") )
def handle_boards_instance_delete(json):
  
  user, error= api_utils.get_user_by_identity()
  if error: return error

  bid= parse_int(json['id'], None)

  board, error= get_board_by_id(bid)
  if error: return error

  if user.id != board.owner_id: return api_utils.response(403, "user doesn't own the board")

  if not board.archived:
    board.archived=True
    return api_utils.response(200, "archived")

  api_utils.delete_boards([board]) # this do commit()
  
  return api_utils.response(200, "deleted")
  
# -------------------------------------- /fetch
# get the 'types' ids that require an update for a given 'board_id' and 'millistamp', gets everything if 'millistamp' < 0
@boards.route('/fetch', methods=['POST'])
@jwt_required(optional=True)
@api_utils.endpoint_safe( content_type="application/json", required_props=["board_id", "millistamp"] )
def handle_boards_fecth(json):
  
  bid= parse_int(json['board_id'])
  board, error= get_board_by_id(bid)
  if error: return error
  
  # check here if board is public OR user has access to it

  millistamp= parse_int(json['millistamp'])

  _objects= {}
  if 'lists' in json and len(json['lists']) > 0: _objects['lists']= board.lists_.query.filter(List.millistamp > millistamp).all()
  if 'tags' in json and len(json['tags']) > 0: _objects['tags']= board.tags_.query.filter(Tag.millistamp > millistamp).all()
  if 'styles' in json and len(json['styles']) > 0: _objects['styles']= board.styles_.query.filter(Style.millistamp > millistamp).all()

  return api_utils.response_200(_objects)

# -------------------------------------- /pull
# get the actual objects from a list of ids
@boards.route('/pull', methods=['GET'])
@jwt_required(optional=True)
@api_utils.endpoint_safe( content_type="application/json" )
def handle_boards_pull(json):
  result= {}
  if json['lists']: result['lists']= [db.session.get(List, i) for i in json['lists']]
  if json['tags']: result['tags']= [db.session.get(Tag, i) for i in json['tags']]
  if json['styles']: result['styles']= [db.session.get(Style, i) for i in json['styles']]
  return api_utils.response_200(result)

# -------------------------------------- /push
# replace objects on the board
@boards.route('/push', methods=['POST'])
@jwt_required(optional=True)
@api_utils.endpoint_safe( content_type="application/json" )
def handle_boards_push(json):
  result= {}

  return api_utils.response_200(result)

# -------------------------------------- /list
# get boards list
@boards.route('/list', methods=['GET'])
@jwt_required(optional=True)
def handle_boards_list():
  if api_utils.ENV == "prod":
    error= api_utils.check_user_forbidden(1) # check if admin if we on production
    if error: return error
  boards= db.session.query(Board).all()
  if not boards or len(boards)==0: return api_utils.response(204, "no boards")
  return api_utils.response_200([v.serialize() for v in boards])

# -------------------------------------- /millistamp
# get millistamp
# required ?id -- the boards id to get the millistamp from
# the implementation is intentional, this has to be as fast as possible
@boards.route('/millistamp', methods=['GET'])
def handle_boards_millistamp():
  millis= -1
  try: millis= db.session.get(Board, parse_int(request.args.get("id", -1))).millistamp
  except: return api_utils.response_plain(200, str(millis))


# -------------------------------------- /healthcheck
# basic health check
@boards.route('/healthcheck', methods=['GET'])
def handle_boards_healthcheck():
    return "boards ok", 200

# ---------------------------------------------------------------------------- HELPERS ----------------------------------------------------------------------------

def get_board_by_id(bid):
  if not bid or bid < 1: return api_utils.response(400, f"invalid board id: {bid}")
  board= db.session.query(Board).get(bid)
  if not board: return None, api_utils.response(404, "board not found")
  return board, None

def check_jwt_user_access(board):
  return True