module ProjectScoped
  extend ActiveSupport::Concern

  included do
    before_action :set_project
  end

  private

    def set_project
      @project = Project.find(params[:project_id])
    end
end
