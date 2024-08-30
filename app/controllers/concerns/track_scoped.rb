module TrackScoped
  extend ActiveSupport::Concern

  included do
    before_action :set_track
  end

  private

    def set_track
      @track = @project.tracks.find(params[:track_id])
    end
end
