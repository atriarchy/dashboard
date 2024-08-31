require_relative "../config/environment"

# Your code goes here
User.transaction do
  admin = User.new(
    role: "admin",
  )

  print "Name: "
  admin.name = gets.chomp
  print "Discord ID: "
  admin.discord_id = gets.chomp
  admin.save!
  admin.invites.create!(role: "admin", expires_at: Time.now + 1.day)

  puts "Admin (id: #{admin.id}) created!"
end
