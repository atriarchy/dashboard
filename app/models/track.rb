class Track < ApplicationRecord
  enum :song_type, %i[original parody cover]
  enum :status, %i[idea demo writing production recording mix_master abandoned finished]

  before_validation :order_self!
  after_create :create_manager!

  has_many :collaborators, dependent: :destroy
  belongs_to :project
  belongs_to :user

  validates :name, length: { minimum: 1, maximum: 255 }
  validates :description, length: { maximum: 1024 }

  private

    def create_manager!
      collaborators.create!(
        user: user,
        role: :manager,
      )
    end

    def order_self!
      return unless self.order.nil?

      self.order = project.tracks.count
    end
end
