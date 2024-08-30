class User < ApplicationRecord
  AVATAR_SIZE = 1 # MB
  AVATAR_FORMATS = %w[image/png image/jpg image/jpeg image/gif image/tiff].freeze
  ROLES = %i[admin artist]
  enum :role, ROLES

  has_many :invites, dependent: :destroy
  has_many :sessions, dependent: :destroy
  has_many :projects, dependent: :destroy
  has_many :tracks, dependent: :destroy
  has_many :collaborations, class_name: "Collaborator", dependent: :destroy
  has_many :collaborated_projects, through: :collaborations, source: :project
  has_one_attached :avatar, dependent: :destroy do |attachable|
    attachable.variant :default, resize_to_fill: [
      300, 300, { crop: :centre }
    ]
  end

  validates :name, presence: true, length: { maximum: 20, minimum: 1 }
  validates :role, presence: true, inclusion: { in: ROLES.map(&:to_s) }
  validates :discord_id, presence: true, uniqueness: true, length: { maximum: 64, minimum: 1 }
  validates :avatar, content_type: AVATAR_FORMATS, size: { less_than: AVATAR_SIZE.megabytes }

  # TODO(dylhack): fix
  def all_projects
    Project.where(user_id: id).or(Project.where(id: collaborated_projects.pluck(:id)))
  end

  def all_tracks
    Track.where(id: collaborations.pluck(:track_id))
  end

  # TODO(dylhack): fix
  def active_invites
    invites.where("expires_at > ?", Time.now)
  end

  def artist?
    role == "artist"
  end

  def admin?
    role == "admin"
  end

  def current_user?
    self == Current.user
  end

  alias_method :me?, :current_user?
end
