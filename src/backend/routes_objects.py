from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required
from .models import db, Board, List, Task, Tag, Style
from .utils import parse_int, parse_bool
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