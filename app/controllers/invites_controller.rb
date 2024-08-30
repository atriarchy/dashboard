class InvitesController < ApplicationController
  before_action :require_admin, except: %i[ index show ]
  before_action :set_invite, only: %i[ show edit update destroy ]

  # GET /invites or /invites.json
  def index
    @invite = Invite.new(role: "artist")
    @invites = Invite.all
  end

  # GET /invites/1 or /invites/1.json
  def show
  end

  # GET /invites/new
  def new
  end

  # GET /invites/1/edit
  def edit
  end

  # POST /invites or /invites.json
  def create
    @invite = Invite.new(expires_at: (Time.now + 1.week).beginning_of_day)
    @invite.role = invite_params[:role] if Current.user.admin?
    return confirm_invite if invite_params.dig(:discord, :id).blank?

    find_or_create_user
    respond_to do |format|
      if @invite.save
        format.html { redirect_to invites_url, notice: "Invite was successfully created." }
        format.json { render :show, status: :created, location: @invite }
      else
        format.html { render partial: "invites/form", locals: { invite: @invite }, status: :unprocessable_entity }
        format.json { render json: @invite.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /invites/1 or /invites/1.json
  def update
    respond_to do |format|
      if @invite.update(invite_params)
        format.html { redirect_to invite_url(@invite), notice: "Invite was successfully updated." }
        format.json { render :show, status: :ok, location: @invite }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @invite.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /invites/1 or /invites/1.json
  def destroy
    require_admin
    @invite.destroy!

    respond_to do |format|
      format.html { redirect_to invites_url, notice: "Invite was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_invite
      @invite = Invite.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def invite_params
      params.require(:invite).permit(:role).tap do |whitelisted|
        whitelisted[:discord] = params[:invite][:discord].slice(:id, :username, :avatar_url) if params[:invite][:discord].present?
      end
    end

    def confirm_invite
      username = invite_params.dig(:discord, :username)
      if username.blank?
        @invite.errors.add(:discord, "username is required")
        return respond_to do |format|
          format.html { render partial: "invites/form", locals: { invite: @invite }, status: :unprocessable_entity }
          format.json { render json: { errors: @invite.errors }, status: :unprocessable_entity }
        end
      end

      if member = FetchDiscordUserJob.perform_now(username)
        render partial: "invites/form", locals: { invite: @invite, discord_user: member }
      else
        @invite.errors.add(:discord, "this member is not part of the server")
        respond_to do |format|
          format.html { render partial: "invites/form", locals: { invite: @invite }, status: :unprocessable_entity }
          format.json { render json: { errors: @invite.errors }, status: :unprocessable_entity }
        end
      end
    end

    def find_or_create_user
      discord_id = invite_params.dig(:discord, :id)
      @invite.user = User.find_by(discord_id: discord_id)
      return unless @invite.user.nil?

      @invite.user = User.create!(
        discord_id: discord_id,
        role: "artist",
        name: invite_params.dig(:discord, :username)
      )

      unless Rails.env.test?
        AttachAvatarJob.perform_now(@invite.user.id, invite_params.dig(:discord, :avatar_url))
      end
    end
end
