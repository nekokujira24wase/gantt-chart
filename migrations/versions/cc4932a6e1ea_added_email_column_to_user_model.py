"""Added email column to User model

Revision ID: cc4932a6e1ea
Revises: 
Create Date: 2024-02-14 12:12:54.028432

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cc4932a6e1ea'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.String(length=20), nullable=False))
        batch_op.add_column(sa.Column('username', sa.String(length=20), nullable=False))
        batch_op.add_column(sa.Column('start_date', sa.DateTime(), nullable=False))
        batch_op.add_column(sa.Column('end_date', sa.DateTime(), nullable=False))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.drop_column('end_date')
        batch_op.drop_column('start_date')
        batch_op.drop_column('username')
        batch_op.drop_column('user_id')

    # ### end Alembic commands ###