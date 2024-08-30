class SessionsController < ApplicationController
  allow_unauthenticated_access only: %i[ new create ]
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { redirect_to login_url, alert: t("sessions.fuck_off") }

  def show
    respond_to do |format|
      format.html { redirect_to after_authentication_url }
      format.json { render json: Current.user }
    end
  end

  def new
    @disable_sidebar = true
    if Rails.env.test?
      @user = User.find_by(discord_id: params[:discord_id])
      login
    end
  end

  def create
    if Rails.env.test?
      @user = User.find_by(discord_id: params[:discord_id])
      login
      return
    end

    set_discord_params
    find_user
    if @user
      login
      return
    end

    redirect_to login_url, alert: t("sessions.invite_required")
  end

  def destroy
    terminate_session
    redirect_to login_url
  end

  private

    def login
      verify_user
      start_new_session_for @user
      redirect_to after_authentication_url
    end

    def verify_user
      return if @user.verified?

      @user.verified = true
      @user.save!
    end

    def set_discord_params
      @discord_params ||= {
        name: request.env.dig("omniauth.auth", "info", "name"),
        avatar: request.env.dig("omniauth.auth", "info", "image"),
        discord_id: request.env.dig("omniauth.auth", "uid")
      }
    end

    def find_user
      @user = User.find_by(discord_id: @discord_params[:discord_id])
      return if @user.nil?

      AttachAvatarJob.perform_now(@user.id, @discord_params[:avatar])
    end
end
