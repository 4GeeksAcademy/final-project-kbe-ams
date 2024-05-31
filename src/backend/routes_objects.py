from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required
from .models import db, Board, List, Task, Tag, Style
from .utils import parse_int, parse_bool, get_current_millistamp
from . import api_utils

from .routes_boards import get_board_by_id

# ---------------------------------------------------------------------------- objects.keqqu.com/* ----------------------------------------------------------------------------

objects= Blueprint('objects', __name__, subdomain='objects')
@objects.route('/', methods=['GET'])
def handle_saved(): return "objects subdomain", 200

# -------------------------------------- /healthcheck
# basic health check
@objects.route('/healthcheck', methods=['GET'])
def handle_objects_healthcheck():
    return "objects ok", 200

# -------------------------------------- /board
# get board content
@objects.route('/board/<int:id>', methods=['GET'])
@jwt_required()
def handle_objects_board(id):
  
  user, error= api_utils.get_user_by_identity()
  if error: return error

  bid= parse_int(id, None)
  if not bid or bid < 1: return api_utils.response(400, f"invalid board id: {bid}")

  board, error= get_board_by_id(bid)
  if error: return error

  if user.id != board.owner_id:
    if not user.boards_.filter(Board.id== bid).first(): return api_utils.response(403, "user has no permission to get the requested objects")
  
  return api_utils.response_200(board.serialize_content(deep=4))

# -------------------------------------- /instance-list
# create a list
# required json 'board_id' -- the board to add it on
# required json 'coords' -- the coordinates to place the list in the board canvas
@objects.route('/instance-list', methods=['POST'])
@jwt_required()
@api_utils.endpoint_safe( content_type="application/json", required_props=['board_id', 'coords' ])
def handle_objects_instance_list_create(json):

  user, error= api_utils.get_user_by_identity()
  if error: return error
  
  bid= parse_int(json['board_id'])
  board, error= get_board_by_id(bid)
  if error: return error

  if user.id != board.owner_id:
    if not user.boards_.filter(Board.id== bid).first(): return api_utils.response(403, "user has no permission to modify board")

  coords= json['coords']

  _list= List(
    title='çdefault.title-list',
    board_id= bid,
    settings=f"{coords[0]}|{coords[1]}|-1|-1",
    millistamp= get_current_millistamp()
  )

  _list.users_.append(user)

  db.session.add(_list)
  db.session.commit()
  
  return api_utils.response_200(_list.serialize())

# -------------------------------------- /instance-task
# create a list
# required json 'list_id' -- the list to add it on
# optional json 'position' -- the position to insert the task, from top
@objects.route('/instance-task', methods=['POST'])
@jwt_required()
@api_utils.endpoint_safe( content_type="application/json", required_props=['list_id'] )
def handle_objects_instance_task_create(json):

  user, error= api_utils.get_user_by_identity()
  if error: return error
  
  lid= parse_int(json['list_id'])
  _list, error= get_list_by_id(lid)
  if error: return error

  size= len(_list.tasks_)
  pos= parse_int(json['position'], -1) if 'position' in json else size
  if pos < 0 or pos > size: return api_utils.response(403, "invalid position")

  if pos < size-1:
    tasks_ahead= _list.tasks_.query.filter(Task.position>=pos).all()
    for t in tasks_ahead: t.position= t.position+1

  _task= Task(
    label='çplaceholder.label-task',
    list_id= lid,
    position= pos,
    millistamp= get_current_millistamp()
  )

  db.session.add(_task)
  db.session.commit()
  
  return api_utils.response_200(_task.serialize())

def get_list_by_id(lid):
  if not lid or lid < 1: return None, api_utils.response(400, f"invalid list id: {lid}")
  list_= db.session.query(List).get(lid)
  if not list_: return None, api_utils.response(404, "list not found")
  return list_, None