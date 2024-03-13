from flask import render_template, redirect, url_for, request, flash, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from flask_wtf import FlaskForm
from sqlalchemy import and_
from wtforms import StringField, PasswordField, SubmitField, DateField, IntegerField
from wtforms.validators import DataRequired
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import json
from . import app, db, login_manager
from .models import User, Team, UserTeam, Task

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class SignupForm(FlaskForm):
    username   = StringField('Username', validators=[DataRequired()])
    real_name  = StringField('Realname(アプリ上で表示される名前です。)', validators=[DataRequired()])
    user_color = StringField('イメージカラー(アプリ上で使われるあなたのイメージカラーです)', validators=[DataRequired()])
    email      = StringField('Email', validators=[DataRequired()])
    password   = PasswordField('Password', validators=[DataRequired()])
    submit     = SubmitField('Sign Up')

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit   = SubmitField('Sign In')


@app.route('/home', methods=['GET', 'POST'])
def home():
    if current_user.is_authenticated:
        return redirect(url_for('chart'))

    # サインアップフォーム入力時の処理
    signup_form = SignupForm()
    if signup_form.validate_on_submit():
        username   = signup_form.username.data
        real_name  = signup_form.real_name.data
        user_color = signup_form.user_color.data
        email      = signup_form.email.data
        password   = signup_form.password.data
        user       = User.query.filter_by(username=username).first()

        if user:
            flash('Username already exists.')
            return redirect(url_for('home'))

        new_user = User(
            username   = username,
            real_name  = real_name,
            user_color = user_color,
            email      = email
        )
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        login_user(new_user)
        return redirect(url_for('home'))

    # ログインフォーム入力時の処理
    login_form = LoginForm()
    if login_form.validate_on_submit():
        username = login_form.username.data
        password = login_form.password.data
        user     = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('home'))
        else:
            flash('Invalid username or password.')


    return render_template('home.html', signup_form=signup_form, login_form=login_form)

# アプリページルート
class CreateTeamForm(FlaskForm):
    team_name   = StringField('チーム名', validators=[DataRequired()])
    team_color  = StringField('チームカラー', validators=[DataRequired()])
    description = StringField('詳細', validators=[DataRequired()])
    start_date  = DateField('日付',  format='%Y-%m-%d', validators=[DataRequired()])
    end_date    = DateField('日付',  format='%Y-%m-%d', validators=[DataRequired()])
    create      = SubmitField("チーム作成")

class CreateTaskForm(FlaskForm):
    task_name  = StringField('タスク名', validators=[DataRequired()])
    post_name  = StringField('役職名', validators=[DataRequired()])
    start_date = DateField('開始日',  format='%Y-%m-%d', validators=[DataRequired()])
    end_date   = DateField('終了日',  format='%Y-%m-%d', validators=[DataRequired()])
    create     = SubmitField("タスク作成")

@app.route('/chart', methods=['GET', 'POST'])
@login_required
def chart():
    team_form        = CreateTeamForm()
    task_form        = CreateTaskForm()
    teams            = current_user.team
    team_button_dict = [team.to_team_button_dict() for team in teams]

    if (team_button_dict):
        return render_template(
            'app.html',
            team_form        = team_form,
            task_form        = task_form,
            team_button_dict = team_button_dict,
            # teams = teams,
        )

    return render_template(
        'app.html',
        team_form = team_form,
        task_form = task_form,
    )

# チャートの生成ルート
@app.route('/get_data/<int:team_id>')
def get_data(team_id):
    user_id  = current_user.id
    username = current_user.username

    team = Team.query.filter_by(id=team_id).first()
    if not team:
        return jsonify({'error': 'チームが見つかりません'}), 404
    team_info = team.to_dict()

    # 現在のユーザーに関連するタスクを取得
    current_user_tasks = Task.query.filter_by(user_id=user_id, team_id=team_id).order_by(Task.post).all()

    # 特定のチームに関連する全てのタスクをユーザー名と役職でソートして取得
    tasks = Task.query.filter(
        Task.team_id  == team_id,
        Task.username != username
    ).order_by(Task.username, Task.post).all()

    # ここで必要に応じてデータを JSON 形式に変換してレスポンスを返します
    return jsonify({
        'team_info'         : team_info,
        'current_user_tasks': [task.to_dict() for task in current_user_tasks],
        'tasks'             : [task.to_dict() for task in tasks]
    })

# ログアウトルート
@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('home'))

#チーム作成ルート
class CreateTeamForm(FlaskForm):
    team_name   = StringField('チーム名', validators=[DataRequired()])
    team_color  = StringField('チームカラー', validators=[DataRequired()])
    description = StringField('詳細', validators=[DataRequired()])
    start_date  = DateField('日付',  format='%Y-%m-%d', validators=[DataRequired()])
    end_date    = DateField('日付',  format='%Y-%m-%d', validators=[DataRequired()])
    create      = SubmitField("チーム作成")

@app.route('/create_team', methods=['GET', 'POST'])
def create_team():
    form = CreateTeamForm()
    if form.validate_on_submit():
        team = Team.query.filter_by(team_name=form.team_name.data).first()
        if team:
            flash('team_name already exists.')
            return redirect(url_for('create_team'))

        input_start_date  = str(form.start_date.data)
        input_end_date    = str(form.end_date.data)
        input_date_format = "%Y-%m-%d"

        # 日付文字列をdatetimeオブジェクトに変換
        input_start_date_list = datetime.strptime(input_start_date, input_date_format)
        input_end_date_list   = datetime.strptime(input_end_date, input_date_format)

        # datetimeオブジェクトから年、月、日を取得してリストに格納
        formatted_start_date_list = [input_start_date_list.year, input_start_date_list.month, input_start_date_list.day]
        formatted_end_date_list   = [input_end_date_list.year, input_end_date_list.month, input_end_date_list.day]

        new_team = Team(
            team_name       = form.team_name.data,
            team_color      = form.team_color.data,
            description     = form.description.data,
            # start_date    = form.start_date.data,
            # end_date      = form.end_date.data,
            start_date      = json.dumps(formatted_start_date_list),
            end_date        = json.dumps(formatted_end_date_list),
            total_tasks     = 0,
            completed_tasks = 0
        )

        db.session.add(new_team)
        db.session.commit()

        # 中間テーブルへの追加
        user_id = current_user.id
        team_id = Team.query.filter_by(team_name=form.team_name.data).first().id
        new_team_user = UserTeam(
            user_id = user_id,
            team_id = team_id,
        )
        db.session.add(new_team_user)
        db.session.commit()

        return redirect(url_for('chart'))

    return render_template('create_team.html', form=form)

# タスク作成ルート
class CreateTaskForm(FlaskForm):
    task_name = StringField('タスク名', validators=[DataRequired()])
    post = StringField('役職名', validators=[DataRequired()])
    start_date = DateField('開始日',  format='%Y-%m-%d', validators=[DataRequired()])
    end_date = DateField('終了日',  format='%Y-%m-%d', validators=[DataRequired()])
    create = SubmitField("タスクを作成")

@app.route('/create_task', methods=['GET', 'POST'])
def task():
    form = CreateTaskForm()
    if form.validate_on_submit():

        team_id           = request.form.get('extraData')
        input_start_date  = str(form.start_date.data)
        input_end_date    = str(form.end_date.data)
        input_date_format = "%Y-%m-%d"

        # 日付文字列をdatetimeオブジェクトに変換
        input_start_date_list = datetime.strptime(input_start_date, input_date_format)
        input_end_date_list   = datetime.strptime(input_end_date, input_date_format)

        # datetimeオブジェクトから年、月、日を取得してリストに格納
        formatted_start_date_list = [input_start_date_list.year, input_start_date_list.month, input_start_date_list.day]
        formatted_end_date_list   = [input_end_date_list.year, input_end_date_list.month, input_end_date_list.day]

        new_task = Task(
            user_id    = current_user.id,
            username   = current_user.username,
            real_name  = current_user.real_name,
            task_name  = form.task_name.data,
            task_color = current_user.user_color,
            post       = form.post.data,
            start_date = json.dumps(formatted_start_date_list),
            end_date   = json.dumps(formatted_end_date_list),
            status     = False,
            team_id    = team_id,
        )
        db.session.add(new_task)

        # チームのtotal_taskの数を+1する
        team = Team.query.filter_by(id=team_id).first()
        team.total_tasks += 1
        db.session.commit()

        return redirect(url_for('chart'))
    return render_template(
        'create_task.html',
        form = form,
    )

# @app.route('/test/<int:task_id>')
# def test(task_id):
#     return jsonify({'message': 'Task updated successfully'}), 200

# タスクの更新
@app.route('/edit_task/<int:task_id>')
def edit_task(task_id):
    # タスクの達成/未達成を入れ替える
    task        = Task.query.filter_by(task_id=task_id).first()
    task.status = False if (task.status) else True

    # チームのタスク状況を更新する
    team = Team.query.filter_by(id=task.team_id).first()
    team.completed_tasks += 1 if (task.status) else -1
    db.session.commit()

    if (task and team) :
        return jsonify({'message': 'Task updated successfully'}), 200
    else:
        # タスクが見つからない場合のエラーメッセージ
        return jsonify({'error': 'Task not found'}), 404

@app.route('/delete_task/<int:task_id>')
def delete_task(task_id):
    task = Task.query.filter_by(task_id=task_id).first()

    if (task):
        db.session.delete(task)
        db.session.commit()
        return f'タスクの削除が完了しました。'

    return f'指定のタスクが見つかりませんでした。'

class SearchForm(FlaskForm):
    username = StringField('', validators=[DataRequired()])
    search   = SubmitField('検索')

class InvitationForm(FlaskForm):
    user_id    = IntegerField('', validators=[DataRequired()])
    team_id    = IntegerField('', validators=[DataRequired()])
    invitation = SubmitField('招待')

# invitation
@app.route('/invitation', methods=['GET', 'POST'])
def invitation():
    search_form     = SearchForm()
    invitation_form = InvitationForm()

    user = None
    if search_form.validate_on_submit():
        username = search_form.username.data
        user     = User.query.filter_by(username=username).first()

    if invitation_form.validate_on_submit():
        user_id = invitation_form.user_id.data
        team_id = invitation_form.team_id.data

        new_team_user = UserTeam(
            user_id = user_id,
            team_id = team_id,
        )
        db.session.add(new_team_user)
        db.session.commit()

        return redirect(url_for('chart'))

    return render_template(
        'invitation.html',
        user            = user,
        search_form     = search_form,
        invitation_form = invitation_form,
    )

#チーム作成ルート
class CreateTeamForm(FlaskForm):
    team_name   = StringField('チーム名', validators=[DataRequired()])
    team_color  = StringField('チームカラー', validators=[DataRequired()])
    description = StringField('詳細', validators=[DataRequired()])
    start_date  = DateField('日付',  format='%Y-%m-%d', validators=[DataRequired()])
    end_date    = DateField('日付',  format='%Y-%m-%d', validators=[DataRequired()])
    create      = SubmitField("チーム作成")

@app.route('/other/<int:teamId>', methods=['GET', 'POST'])
def other(teamId):
    edit_team_form = CreateTeamForm()

    if edit_team_form.validate_on_submit():
        edit_team       = Team(
            team_name   = edit_team_form.team_name.data,
            team_color  = edit_team_form.team_color.data,
            description = edit_team_form.description.data,
            start_date  = edit_team_form.start_date.data,
            end_data    = edit_team_form.end_date.data,
        )

        db.session.add(edit_team)
        db.session.commit()
        return redirect(url_for('chart'))

    team_info = Team.query.filter_by(team_id = teamId).first()

    return render_template(
        'edit_team.html',
        team_info = team_info
    )