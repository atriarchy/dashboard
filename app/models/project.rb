class Project < ApplicationRecord
  COVER_SIZE = 1 # MB
  COVER_FORMATS = %w[image/png image/jpg image/jpeg image/gif image/tiff].freeze
  enum :status, %i[draft active closed released]

  belongs_to :user
  has_many :tracks, dependent: :destroy
  has_one_attached :cover, dependent: :destroy do |attachable|
    attachable.variant :default, resize_to_fill: [
      300, 300, { crop: :centre }
    ]
  end

  validates :name, presence: true, length: { maximum: 30, minimum: 1 }
  validates :description, presence: true, length: { maximum: 100, minimum: 1 }
  validates :status, presence: true, inclusion: { in: statuses.keys }
  validates :slug, uniqueness: true, presence: true, length: { maximum: 20, minimum: 1 }
  validates :cover, content_type: COVER_FORMATS, size: { less_than: COVER_SIZE.megabytes }

  def collaborators
    Collaborator.select(:user_id).where(track_id: tracks.all.pluck(:id)).where.not(user_id: user.id).order(:user_id).distinct
  end
end
