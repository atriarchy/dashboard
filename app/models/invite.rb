class Invite < ApplicationRecord
  enum :role, User::ROLES

  default_scope { order(created_at: :desc) }

  belongs_to :user

  validates_with InviteValidator
end
