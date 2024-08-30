class AttachAvatarJob < ApplicationJob
  queue_as :default

  # @param [Integer] user_id
  # @param [String] avatar_url
  # @example AttachAvatarJob.perform(1, "https://cdn.discordapp.com/avatars/164837347156951040/a_2db0454ac7d2c32f3fc555d10d2efb65")
  def perform(user_id, avatar_url)
    user = User.find(user_id)
    raise "User not found" unless user

    resp = Faraday.get(avatar_url)
    raise "Failed to fetch avatar" unless resp.success?

    image_type = resp.headers["content-type"].split("/").last
    user.avatar.attach(io: StringIO.new(resp.body), filename: "avatar.#{image_type}")
  end
end
