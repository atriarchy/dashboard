class CollaboratorsController < ApplicationController
  include ProjectScoped
  include TrackScoped
  before_action :set_collaborator, only: %i[ show edit update destroy ]

  # GET /collaborators or /collaborators.json
  def index
    @collaborators = @track.collaborators.all
  end

  # GET /collaborators/1 or /collaborators/1.json
  def show
  end

  # GET /collaborators/new
  def new
    @collaborator = @track.collaborators.new
  end

  # GET /collaborators/1/edit
  def edit
  end

  # POST /collaborators or /collaborators.json
  def create
    @collaborator = @track.collaborators.new(collaborator_params)

    respond_to do |format|
      if @collaborator.save
        format.html { redirect_to collaborator_url(@collaborator), notice: "Collaborator was successfully created." }
        format.json { render :show, status: :created, location: @collaborator }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @collaborator.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /collaborators/1 or /collaborators/1.json
  def update
    respond_to do |format|
      if @collaborator.update(collaborator_params)
        format.html { redirect_to collaborator_url(@collaborator), notice: "Collaborator was successfully updated." }
        format.json { render :show, status: :ok, location: @collaborator }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @collaborator.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /collaborators/1 or /collaborators/1.json
  def destroy
    @collaborator.destroy!

    respond_to do |format|
      format.html { redirect_to collaborators_url, notice: "Collaborator was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_collaborator
      @collaborator = @track.collaborators.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def collaborator_params
      params.require(:collaborator).permit(:track_id, :user_id)
    end
end
