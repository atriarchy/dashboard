module UsersHelper
  def user_avatar(user, **options)
    options ||= {}
    options[:alt] ||= ""
    if user.avatar.attached?
      options[:style] ||= "background-image: url('#{asset_path("avatar.webp")}'); background-size: cover; background-position: center;"
      image_tag user.avatar.variant(:default), **options
    else
      image_tag asset_path("avatar.webp"), **options
    end
  end

  def color_role(role)
    case role
    when "artist"
      "bg-blue-400 text-white font-bold"
    when "admin"
      "bg-violet-400 text-white font-bold"
    else
      "bg-gray-500 text-black"
    end
  end

  def user_role(user, **options)
    options ||= {}
    options[:tag] ||= :span
    unless options.key?(:class)
      options[:class] = "flex flex-row rounded-lg w-fit justify-center px-2 py-1 "
      options[:class] += color_role(user.role)
    end

    content_tag options.delete(:tag), **options do
      user.role.humanize
    end
  end
end
