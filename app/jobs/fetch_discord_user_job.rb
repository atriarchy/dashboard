class FetchDiscordUserJob < ApplicationJob
  queue_as :default

  # {
  #  id: "164837347156951040",
  #  username: "chaibyte",
  #  avatar_url: "https://cdn.discordapp.com/avatars/164837347156951040/a_2db0454ac7d2c32f3fc555d10d2efb65"
  # }
  def perform(username)
    @username = username
    set_endpoint
    set_token
    fetch_members
    retrieve_member
  end

  private

    # [
    #   {
    #     "avatar": null,
    #     "banner": null,
    #     "communication_disabled_until": null,
    #     "flags": 0,
    #     "joined_at": "2024-08-24T20:32:23.029000+00:00",
    #     "nick": null,
    #     "pending": false,
    #     "premium_since": null,
    #     "roles": [],
    #     "unusual_dm_activity_until": null,
    #     "user": {
    #       "id": "164837347156951040",
    #       "username": "chaibyte",
    #       "avatar": "a_2db0454ac7d2c32f3fc555d10d2efb65",
    #       "discriminator": "0",
    #       "public_flags": 4194944,
    #       "flags": 4194944,
    #       "banner": null,
    #       "accent_color": null,
    #       "global_name": "chai",
    #       "avatar_decoration_data": null
    #     },
    #     "mute": false,
    #     "deaf": false
    #   }
    # ]
    def fetch_members
      resp = Faraday.get(@endpoint, nil, { "Authorization" => @token })
      @members = JSON.parse(resp.body)
      # TODO(dylhack): cache members
    end

    def retrieve_member
      member = @members.find { |member| member.dig("user", "username") == @username }
      return nil if member.nil?

      avatar = member.dig("user", "avatar")
      id = member.dig("user", "id")
      if avatar.nil?
        avatar_url = "https://cdn.discordapp.com/embed/avatars/#{member.dig("user", "discriminator").to_i % 5}.png"
      else
        avatar_url = "https://cdn.discordapp.com/avatars/#{id}/#{avatar}"
      end

      {
        id: id,
        username: member.dig("user", "username"),
        avatar_url: avatar_url
      }
    end

    def set_endpoint
      raise "Missing DISCORD_GUILD_ID" unless ENV.key?("DISCORD_GUILD_ID")

      username = URI.encode_www_form_component(@username)
      @endpoint = "https://discord.com/api/v10/guilds/#{ENV["DISCORD_GUILD_ID"]}/members/search?limit=1&query=#{username}"
    end

    def set_token
      raise "Missing DISCORD_BOT_TOKEN" unless ENV.key?("DISCORD_BOT_TOKEN")

      @token = "Bot #{ENV["DISCORD_BOT_TOKEN"]}"
    end
end
