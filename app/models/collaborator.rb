class Collaborator < ApplicationRecord
  enum :role, %i[manager editor contributor]

  default_scope { joins(:user).order(Arel.sql("CASE WHEN collaborators.role = 0 THEN 0 ELSE 1 END, users.name ASC")) }

  belongs_to :track
  has_one :project, through: :track
  belongs_to :user
end
