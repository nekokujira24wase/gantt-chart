from flask_login import UserMixin
from . import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id            = db.Column(db.Integer, primary_key=True)
    username      = db.Column(db.String(80), unique=True, nullable=False)
    real_name     = db.Column(db.String(80), nullable=False)
    user_color    = db.Column(db.String(10), default="#ffffff")
    email         = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    team          = db.relationship('Team', secondary='user_team', backref=db.backref('users', lazy='dynamic'))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Team(db.Model):
    __tablename__   = 'teams'
    id              = db.Column(db.Integer, primary_key=True)
    team_name       = db.Column(db.String(80), nullable=False)
    team_color      = db.Column(db.String(10), default="#ffffff")
    description     = db.Column(db.String(10000))
    start_date      = db.Column(db.JSON, nullable=False)
    end_date        = db.Column(db.JSON, nullable=False)
    total_tasks     = db.Column(db.Integer, nullable=False)
    completed_tasks = db.Column(db.Integer, nullable=False)

    @property
    def progress(self):
        if self.total_tasks > 0:
            return (self.completed_tasks / self.total_tasks) * 100
        return 100

    def to_team_button_dict(self):
        return {
            "item"      : "project_name",
            "class"     : "project-name",
            'id'        : self.id,
            'team_name' : self.team_name,
            'team_color': self.team_color,
            'progress'  : self.progress
        }

    def to_dict(self):
        return {
            'id'             : self.id,
            'team_name'      : self.team_name,
            'team_color'     : self.team_color,
            'description'    : self.description,
            'start_date'     : self.start_date,
            'end_date'       : self.end_date,
            # 'start_date'   : self.start_date.isoformat(),  # 日付をISO 8601形式の文字列に変換
            # 'end_date'     : self.end_date.isoformat(),
            'total_tasks'    : self.total_tasks,
            'completed_tasks': self.completed_tasks,
            'progress'       : self.progress
        }


class UserTeam(db.Model):
    __tablename__ = 'user_team'
    user_id       = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    team_id       = db.Column(db.Integer, db.ForeignKey('teams.id'), primary_key=True)


class Task(db.Model):
    __tablename__ = 'tasks'
    task_id       = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.String(20), nullable=False)
    username      = db.Column(db.String(20), nullable=False)
    real_name     = db.Column(db.String(20), nullable=False)
    task_name     = db.Column(db.String(20), nullable=False)
    task_color    = db.Column(db.String(10), nullable=False)
    post          = db.Column(db.String(15), nullable=False)
    start_date    = db.Column(db.JSON, nullable=False)
    end_date      = db.Column(db.JSON, nullable=False)
    status        = db.Column(db.Boolean, default=False)
    team_id       = db.Column(db.Integer, db.ForeignKey('teams.id'))

    def to_dict(self):
        return{
            'task_id'   : self.task_id,
            'user_id'   : self.user_id,
            'username'  : self.username,
            'real_name' : self.real_name,
            'task_name' : self.task_name,
            'task_color': self.task_color,
            'post'      : self.post,
            'start_date': self.start_date,
            'end_date'  : self.end_date,
            'status'    : self.status,
        }