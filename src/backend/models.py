import json
from flask_sqlalchemy import SQLAlchemy
from .aws_utils import get_public_link

db = SQLAlchemy()

#region ---------------------------------------------------------------------------- ASSOCIATION TABLES

#--- many-to-many relationships ( users<->workspaces, user<->boards, user<->lists, user<->tasks )

users_workspaces_association= db.Table('uwa',
  db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
  db.Column('workspace_id', db.Integer, db.ForeignKey('workspaces.id'), primary_key=True)
)

users_boards_association= db.Table('uba',
  db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
  db.Column('board_id', db.Integer, db.ForeignKey('boards.id'), primary_key=True)
)
    
users_lists_association= db.Table('ula',
  db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
  db.Column('list_id', db.Integer, db.ForeignKey('lists.id'), primary_key=True)
)
    
users_tasks_association= db.Table('uta',
  db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
  db.Column('task_id', db.Integer, db.ForeignKey('tasks.id'), primary_key=True)
)

#--- many-to-many relationships ( tags<->(list & tasks) and styles<->(lists & tasks) )

tags_lists_association= db.Table('tla',
  db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True),
  db.Column('list_id', db.Integer, db.ForeignKey('lists.id'), primary_key=True)
)
    
tags_tasks_association= db.Table('tta',
  db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True),
  db.Column('task_id', db.Integer, db.ForeignKey('tasks.id'), primary_key=True)
)

styles_lists_association= db.Table('sla',
  db.Column('style_id', db.Integer, db.ForeignKey('styles.id'), primary_key=True),
  db.Column('list_id', db.Integer, db.ForeignKey('lists.id'), primary_key=True)
)
    
styles_tasks_association= db.Table('sta',
  db.Column('style_id', db.Integer, db.ForeignKey('styles.id'), primary_key=True),
  db.Column('task_id', db.Integer, db.ForeignKey('tasks.id'), primary_key=True)
)
#endregion

#region ---------------------------------------------------------------------------- USER
class User(db.Model):
  __tablename__="users"
  # public
  id = db.Column(db.Integer, nullable=False, primary_key=True, autoincrement=True)
  username = db.Column(db.String(32), nullable=False, unique=True)
  displayname = db.Column(db.String(64), nullable=False)
  email = db.Column(db.String(32), nullable=False, unique=True)
  avatar = db.Column(db.String(256))
  settings= db.Column(db.String(16))
  last_workspace_id = db.Column(db.Integer)
  last_board_id = db.Column(db.Integer)
  millistamp = db.Column(db.Integer, nullable=False, default=0)
  # private
  password = db.Column(db.LargeBinary, nullable=False) # password is stored hashed
  permission= db.Column(db.Integer, nullable=False, default=0) # 0 user 1 admin
  vericode = db.Column(db.Integer, nullable=False, default=1000000) # if > 0 means the user email is NOT verified, 6 digits
  passcode = db.Column(db.Integer, nullable=False, default=100000000) # current recovery code to reset the pass, 8 digits
  refreshtoken = db.Column(db.LargeBinary) # for security, store the refresh token here as inverted binary

  # workspaces & boards (owned)
  workspaces_owned_ = db.relationship("Workspace", back_populates="owner_", foreign_keys="[Workspace.owner_id]")
  boards_owned_ = db.relationship("Board", back_populates="owner_", foreign_keys="[Board.owner_id]")

  # workspaces, boards, lists & tasks
  workspaces_ = db.relationship("Workspace", secondary=users_workspaces_association, back_populates='users_')
  boards_ = db.relationship("Board", secondary=users_boards_association, back_populates='users_')
  lists_ = db.relationship("List", secondary=users_lists_association, back_populates='users_')
  tasks_ = db.relationship("Task", secondary=users_tasks_association, back_populates='users_')

  def serialize(self, deep=0):
    return {
      "id": self.id,
      "username": self.username,
      "displayname": self.displayname,
      "email": self.email,
      "avatar": get_public_link(self.avatar) if not '://' in self.avatar else self.avatar,
      "settings": self.settings,
      "last_visits": [self.last_workspace_id, self.last_board_id],

      "permission": self.permission,
      "vericode": self.vericode,
      "passcode": self.passcode,

      "millistamp": self.millistamp
    }
  def __repr__(self): return f'<User {self.id}::{self.email}::{self.username} ({self.displayname})>'
#endregion

#region ---------------------------------------------------------------------------- WORKSPACE
class Workspace(db.Model):
  __tablename__="workspaces"
  id = db.Column(db.Integer, nullable=False, primary_key=True, autoincrement=True)
  title = db.Column(db.String(64), nullable=False)
  thumbnail = db.Column(db.String(256), nullable=False)
  settings= db.Column(db.String(256))
  archived = db.Column(db.Boolean, nullable=False, default=False)
  millistamp = db.Column(db.Integer, nullable=False, default=0)

  # read_write_rules
  rwr_id = db.Column(db.Integer, db.ForeignKey('read_write_rules.id'))
  rwr_ = db.relationship("ReadWriteRules", remote_side="[ReadWriteRules.id]", uselist=False)

  # owner
  owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  owner_ = db.relationship("User", back_populates="workspaces_owned_", foreign_keys="[Workspace.owner_id]")
  
  # boards
  boards_ = db.relationship("Board", back_populates="workspace_")

  # users
  users_ = db.relationship("User", secondary=users_workspaces_association, back_populates='workspaces_')

  def __get_owner(self, deep=0):
    return self.owner_.serialize() if deep > 0 and self.owner_ else self.owner_id,

  def __get_rwr(self, deep=0):
    return self.rwr_.serialize(deep-1) if deep > 0 and self.rwr_ else self.rwr_id,

  def __get_boards(self, deep=0):
    e= self.boards_
    return ([v.serialize(deep-1) for v in e] if e else []) if deep > 0 else ([v.id for v in e] if e else [])

  def serialize(self, deep=0):

    return {
      "id": self.id,
      "title": self.title,
      "thumbnail": get_public_link(self.thumbnail) if not '://' in self.thumbnail else self.thumbnail,
      "settings": self.settings,
      "rwr": self.__get_rwr(deep),
      "owner": self.__get_owner(deep),
      "users": [v.id for v in self.users_] if self.users_ else [],
      "boards": self.__get_boards(deep),
      "archived": self.archived,
      "millistamp": self.millistamp
    }
  def __repr__(self): return f'<Workspace {self.id}::{self.title}>'
#endregion

#region ---------------------------------------------------------------------------- BOARD
class Board(db.Model):
  __tablename__="boards"
  id = db.Column(db.Integer, nullable=False, primary_key=True, autoincrement=True)
  name = db.Column(db.String(64), nullable=False)
  description = db.Column(db.String(1024))
  icon = db.Column(db.String(256))
  thumbnail = db.Column(db.String(256), nullable= False)
  settings= db.Column(db.String(256))
  archived = db.Column(db.Boolean, nullable=False, default=False)
  millistamp = db.Column(db.Integer, nullable=False, default=0)

  # read_write_rules
  rwr_id = db.Column(db.Integer, db.ForeignKey('read_write_rules.id'))
  rwr_ = db.relationship("ReadWriteRules", remote_side="[ReadWriteRules.id]", uselist=False)

  # owner
  owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  owner_ = db.relationship("User", back_populates="boards_owned_", foreign_keys="[Board.owner_id]")
  
  # workspaces
  workspace_id = db.Column(db.Integer, db.ForeignKey('workspaces.id'))
  workspace_ = db.relationship("Workspace", back_populates="boards_")

  # tags
  tags_ = db.relationship("Tag", back_populates="board_")

  # styles
  styles_ = db.relationship("Style", back_populates="board_")

  # lists
  lists_ = db.relationship("List", back_populates="board_")

  # users
  users_ = db.relationship("User", secondary=users_boards_association, back_populates='boards_')

  def __get_rwr(self, deep=0):
    return self.rwr_.serialize(deep-1) if deep > 0 and self.rwr_ else self.rwr_id,

  def __get_owner(self, deep=0):
    return self.owner_.serialize() if deep > 0 and self.owner_ else self.owner_id,

  def __get_workspace(self, deep=0):
    return self.workspace_.serialize() if deep > 0 and self.workspace_ else self.workspace_id,

  def __get_lists(self, deep=0):
    e= self.lists_
    return ([v.serialize(deep-1) for v in e] if e else []) if deep > 0 else ([v.id for v in e] if e else [])

  def __get_tags(self, deep=0):
    e= self.tags_
    return ([v.serialize(deep-1) for v in e] if e else []) if deep > 0 else ([v.id for v in e] if e else [])

  def __get_styles(self, deep=0):
    e= self.styles_
    return ([v.serialize(deep-1) for v in e] if e else []) if deep > 0 else ([v.id for v in e] if e else [])

  def serialize_content(self, deep=0):
    return {
      "lists": self.__get_lists(deep),
      "tags": self.__get_tags(deep),
      "styles": self.__get_styles(deep)
    }

  def serialize(self, deep=0):
    return {
      "id": self.id,
      "name": self.name,
      "description": self.description,
      "icon": get_public_link(self.icon) if not '://' in self.icon else self.icon,
      "thumbnail": get_public_link(self.thumbnail) if not '://' in self.thumbnail else self.thumbnail,
      "settings": self.settings,
      "rwr": self.__get_rwr(deep),
      "owner": self.__get_owner(deep),
      "users": [v.id for v in self.users_] if self.users_ else [],
      "workspace": self.__get_workspace(deep),
      "archived": self.archived,
      "millistamp": self.millistamp
    }
  def __repr__(self): return f'<Board {self.id}::{self.name}>'
#endregion
 
#region ---------------------------------------------------------------------------- LIST
class List(db.Model):
  __tablename__="lists"
  id = db.Column(db.Integer, nullable=False, primary_key=True, autoincrement=True)
  title = db.Column(db.String(64), nullable=False)
  icon = db.Column(db.String(256))
  settings= db.Column(db.String(256), nullable=False)
  archived = db.Column(db.Boolean, nullable=False, default=False)
  millistamp = db.Column(db.Integer, nullable=False, default=0)

  # read_write_rules
  rwr_id = db.Column(db.Integer, db.ForeignKey('read_write_rules.id'))
  rwr_ = db.relationship("ReadWriteRules", remote_side="[ReadWriteRules.id]", uselist=False)
  
  # boards
  board_id = db.Column(db.Integer, db.ForeignKey('boards.id'))
  board_ = db.relationship("Board", back_populates="lists_")

  # users, tags & styles
  users_ = db.relationship('User', secondary=users_lists_association, back_populates='lists_')
  tags_ = db.relationship("Tag", secondary=tags_lists_association, back_populates='lists_')
  styles_ = db.relationship('Style', secondary=styles_lists_association, back_populates='lists_')

  # tasks
  tasks_ = db.relationship("Task", back_populates="list_")

  def __get_rwr(self, deep=0):
    return self.rwr_.serialize(deep-1) if deep > 0 and self.rwr_ else self.rwr_id,

  def __get_tasks(self, deep=0):
    e= self.tasks_
    return ([v.serialize(deep-1) for v in e] if e else []) if deep > 0 else ([v.id for v in e] if e else [])

  def serialize(self, deep=0):
    return {
      "id": self.id,
      "title": self.title,
      "icon": (get_public_link(self.icon) if not '://' in self.icon else self.icon) if self.icon else None,
      "settings": self.settings,
      "rwr": self.__get_rwr(deep),
      "board": self.board_id,
      "tasks": self.__get_tasks(deep),
      "users": [v.id for v in self.users_] if self.users_ else [],
      "tags": [v.id for v in self.tags_] if self.tags_ else [],
      "styles": [v.id for v in self.styles_] if self.styles_ else [],
      "archived": self.archived,
      "millistamp": self.millistamp,
    }
  def __repr__(self): return f'<List {self.id}::{self.label}>'
#endregion

#region ---------------------------------------------------------------------------- TASK
class Task(db.Model):
  __tablename__="tasks"
  id = db.Column(db.Integer, nullable=False, primary_key=True, autoincrement=True)
  label = db.Column(db.String(64), nullable=False)
  icon = db.Column(db.String(256))
  description = db.Column(db.String(1024))
  position = db.Column(db.Integer, nullable=False)
  due_date = db.Column(db.Integer)
  archived = db.Column(db.Boolean, nullable=False, default=False)
  millistamp = db.Column(db.Integer, nullable=False, default=0)
  
  # read_write_rules
  rwr_id = db.Column(db.Integer, db.ForeignKey('read_write_rules.id'))
  rwr_ = db.relationship("ReadWriteRules", remote_side="[ReadWriteRules.id]", uselist=False)

  # lists
  list_id = db.Column(db.Integer, db.ForeignKey('lists.id'))
  list_ = db.relationship("List", back_populates="tasks_")

  # users, tags & styles
  users_ = db.relationship('User', secondary=users_tasks_association, back_populates='tasks_')
  tags_ = db.relationship("Tag", secondary=tags_tasks_association, back_populates='tasks_')
  styles_ = db.relationship('Style', secondary=styles_tasks_association, back_populates='tasks_')

  def __get_rwr(self, deep=0):
    return self.rwr_.serialize(deep-1) if deep > 0 and self.rwr_ else self.rwr_id,

  def serialize(self, deep=0):
    return {
      "id": self.id,
      "label": self.label,
      "description": self.description,
      "icon": (get_public_link(self.icon) if not '://' in self.icon else self.icon) if self.icon else None,
      "rwr": self.__get_rwr(deep),
      "list": self.list_id,
      "users": [v.id for v in self.users_] if self.users_ else [],
      "tags": [v.id for v in self.tags_] if self.tags_ else [],
      "styles": [v.id for v in self.styles_] if self.styles_ else [],
      "due_date": self.due_date,
      "archived": self.archived,
      "millistamp": self.millistamp
    }
  def __repr__(self): return f'<Task {self.id}::{self.label}>'
#endregion

#region ---------------------------------------------------------------------------- TAG
class Tag(db.Model):
  __tablename__="tags"
  id = db.Column(db.Integer, nullable=False, primary_key=True, autoincrement=True)
  label = db.Column(db.String(32))
  color_fg = db.Column(db.Integer, nullable=False)
  color_bg = db.Column(db.Integer, nullable=False)
  archived = db.Column(db.Boolean, nullable=False, default=False)
  millistamp = db.Column(db.Integer, nullable=False, default=0)

  # boards
  board_id = db.Column(db.Integer, db.ForeignKey('boards.id'))
  board_ = db.relationship("Board", back_populates="tags_")

  # lists & tasks
  lists_ = db.relationship("List", secondary=tags_lists_association, back_populates='tags_')
  tasks_ = db.relationship('Task', secondary=tags_tasks_association, back_populates='tags_')

  def serialize(self):
    return {
      "id": self.id,
      "name": self.label,
      "color_fg": self.color_fg,
      "color_bg": self.color_bg,
      "board_id": self.board_id,
      "archived": self.archived,
      "millistamp": self.millistamp
    }
  def __repr__(self): return f'<Tag {self.id}::{self.name}>'
#endregion

#region ---------------------------------------------------------------------------- STYLE
class Style(db.Model):
  __tablename__="styles"
  id = db.Column(db.Integer, nullable=False, primary_key=True, autoincrement=True)
  name = db.Column(db.String(32))
  css = db.Column(db.String(64))
  archived = db.Column(db.Boolean, nullable=False, default=False)
  millistamp = db.Column(db.Integer, nullable=False, default=0)

  # boards
  board_id = db.Column(db.Integer, db.ForeignKey('boards.id'))
  board_ = db.relationship("Board", back_populates="styles_")

  # lists & tasks
  lists_ = db.relationship("List", secondary=styles_lists_association, back_populates='styles_')
  tasks_ = db.relationship('Task', secondary=styles_tasks_association, back_populates='styles_')

  def serialize(self):
    return {
      "id": self.id,
      "name": self.name,
      "css": self.css,
      "board_id": self.board_id,
      "archived": self.archived,
      "millistamp": self.millistamp
    }
  def __repr__(self): return f'<Style {self.id}::{self.name}>'
#endregion

#region ---------------------------------------------------------------------------- READ-WRITE RULES
class ReadWriteRules(db.Model):
  __tablename__="read_write_rules"
  id = db.Column(db.Integer, nullable=False, primary_key=True, autoincrement=True)
  flags_rw = db.Column(db.Integer, nullable=False, default=0)
  enabled = db.Column(db.Boolean, nullable=False, default=True)
  millistamp = db.Column(db.Integer, nullable=False, default=0)
  
  user_rules_ = db.relationship('UserReadWriteRule', back_populates="rwr_")

  def serialize(self):
    return {
      "id": self.id,
      "name": self.label,
      "flags_rw": self.flags_rw,
      "enabled": self.enabled,
      "millistamp": self.millistamp
    }
  def __repr__(self): return f'<Style {self.id}::{self.label}>'
#endregion

#region ---------------------------------------------------------------------------- USER READ-WRITE RULE
class UserReadWriteRule(db.Model):
  __tablename__="user_read_write_rules"
  id = db.Column(db.Integer, nullable=False, primary_key=True, autoincrement=True)
  flags_rw = db.Column(db.Integer, nullable=False, default=0)
  enabled = db.Column(db.Boolean, nullable=False, default=True)
  millistamp = db.Column(db.Integer, nullable=False, default=0)

  # read_write_rules
  rwr_id = db.Column(db.Integer, db.ForeignKey('read_write_rules.id'), nullable=False)
  rwr_ = db.relationship('ReadWriteRules')
  
  # users
  user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  user_ = db.relationship('User')

  def serialize(self):
    return {
      "id": self.id,
      "name": self.label,
      "flags_rw": self.flags_rw,
      "user_id": self.user_id,
      "enabled": self.enabled,
      "millistamp": self.millistamp
    }
  def __repr__(self): return f'<Style {self.id}::{self.label}>'
#endregion