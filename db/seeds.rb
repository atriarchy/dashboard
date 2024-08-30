# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
SEED_ROOT = Rails.root.join("db/seeds")

def find_file(name, &block)
  Dir.foreach(SEED_ROOT) do |file|
    if file.include?(name)
      File.open(SEED_ROOT.join(file), "r", &block)
      return true
    end
  end

  false
end

def attach_avatar(user, avatar_url)
  find_file(user.discord_id) do |file|
    image_type = avatar_url.split(".").last
    data = file.read
    file_name = "avatar.#{image_type}"
    user.avatar.attach(io: StringIO.new(data), filename: file_name)
    user.save!
  end && return

  resp = Faraday.get(avatar_url)
  raise "status: #{resp.status}, url: #{avatar_url}" unless resp.success?

  image_type = resp.headers["content-type"].split("/").last
  File.open(SEED_ROOT.join(user.discord_id + "." + image_type), "wb") do |file|
    file.write(resp.body)
  end

  user.avatar.attach(io: StringIO.new(resp.body), filename: "avatar.#{image_type}")
end

def attach_cover(project, cover_url)
  find_file(project.slug) do |file|
    image_type = cover_url.split(".").last
    data = file.read
    file_name = "cover.#{image_type}"
    project.cover.attach(io: StringIO.new(data), filename: file_name)
    project.save!
  end && return

  resp = Faraday.get(cover_url)
  raise "status: #{resp.status}, url: #{cover_url}" unless resp.success?

  image_type = resp.headers["content-type"].split("/").last
  File.open(SEED_ROOT.join(project.slug + "." + image_type), "wb") do |file|
    file.write(resp.body)
  end

  project.cover.attach(io: StringIO.new(resp.body), filename: "cover.#{image_type}")
  project.save!
end

[
  {
    "username": "aca30",
    "role": "admin",
    "avatar": "https://cdn.discordapp.com/avatars/210762063021211649/ff58146a5426f3b7ed133f0e3d295812.png",
    "verified": false
  },
  {
    "username": "vortex",
    "role": "admin",
    "avatar": "https://cdn.discordapp.com/avatars/323944082588041216/1fbec73799ede73b4fe9f7fda551a0d3.png",
    "verified": false
  },
  {
    "username": "chaibyte",
    "role": "admin",
    "avatar": "https://cdn.discordapp.com/avatars/164837347156951040/a_2db0454ac7d2c32f3fc555d10d2efb65.gif",
    "verified": false
  }
].each do |admin_data|
  discord_id = admin_data[:avatar].split("/")[-2]
  user = User.find_by(discord_id: discord_id)
  return user if user

  user = User.create!(discord_id: discord_id, name: admin_data[:username], role: "admin", verified: true)
  attach_avatar(user, admin_data[:avatar])
  user
rescue StandardError => e
  puts "Failed to import admin #{discord_id}"
  raise e
end

def create_invite(user)
  user.invites.create!(
    role: "artist",
    expires_at: (Time.now + 1.year).beginning_of_day
  )
end

# {
#   "type": "DISCORD",
#   "username": "rdcw",
#   "avatar": "https://cdn.discordapp.com/avatars/934960602206572546/472638c75747ad0f3016bdc05c16bfa0.png",
#   "role": "MANAGER"
# },
def import_user(collab)
  # https://cdn.discordapp.com/avatars/934960602206572546/472638c75747ad0f3016bdc05c16bfa0.png
  discord_id = collab[:avatar].split("/")[-2]
  user = User.find_by(discord_id: discord_id)
  return user if user

  user = User.create!(discord_id: discord_id, name: collab[:username], role: "artist", verified: false)
  attach_avatar(user, collab[:avatar])
  create_invite(user)
  user
rescue StandardError => e
  puts "Failed to import user #{discord_id}"
  raise e
end


# {
#   "username": "rdcw",
#   "avatar": "https://cdn.discordapp.com/avatars/934960602206572546/472638c75747ad0f3016bdc05c16bfa0.png",
#   "role": "MANAGER"
# }
def import_collaborator(track, data)
  Collaborator.create!(
    user: import_user(data),
    track: track,
    role: data[:role].downcase
  )
rescue StandardError => e
  puts "Failed to import collaborator #{data[:username]} of track #{track.slug}"
  raise e
end

# {
#   "username": "headless-monkey",
#   "title": "Headless Monkey",
#   "description": null,
#   "musicStatus": "finished",
#   "explicit": false,
#   "collaborators": []
# }
def import_track(project, data)
  user = import_user(data[:collaborators].shift)
  track = Track.create!(
    project: project,
    user: user,
    slug: data[:username],
    name: data[:title],
    song_type: "original",
    description: data[:description] || "#{project.name}: #{data[:title]}",
    status: data[:musicStatus].downcase,
    order: project.tracks.count
  )

  data[:collaborators].each do |collab|
    import_collaborator(track, collab)
  end

  track
rescue StandardError => e
  puts "Failed to import track #{data[:uername]} of project #{project.slug}"
  raise e
end

# {
#   "slug": "tesserae",
#   "name": "Mosaic: Tesserae",
#   "description": "Mosaic: Tesserae",
#   "deadline": "2024-08-21T07:01:00.000Z",
#   "status": "closed",
#   "tracks": []
# }
def import_project(data)
  project = Project.create!(
    user: User.first,
    slug: data[:slug],
    name: data[:name],
    description: data[:description],
    deadline: data[:deadline],
    status: data[:status].downcase
  )

  attach_cover(project, data[:cover_url])
  data[:tracks].each { |track_data| import_track(project, track_data) }

  project
rescue StandardError => e
  puts "Failed to import project #{data[:slug]}"
  raise e
end

require_relative "./seeds/data"
PROJECTS.each do |data|
  import_project(data)
end
