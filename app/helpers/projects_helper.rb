module ProjectsHelper
  def project_cover(project, **options)
    options ||= {}
    options[:alt] ||= ""
    if project.cover.attached? && !project.new_record?
      options[:style] ||= ""
      options[:style] += ";background-image: url('#{asset_path("album.webp")}'); background-size: cover; background-position: center;"
      options.delete(:style) if options[:style].blank?
      image_tag project.cover.variant(:default), **options
    else
      image_tag asset_path("album.webp"), **options
    end
  end

  def humanize_status(status)
    case status
    when "draft"
      "✍️ Draft"
    when "active"
      "🎙️ Active"
    when "closed"
      "🚧 Closed"
    when "released"
      "🎉 Released"
    else
      "🤷 Unknown"
    end
  end

  def color_status(status)
    case status
    when "draft"
      "bg-blue-200"
    when "active"
      "bg-green-200"
    when "closed"
      "bg-red-200"
    when "released"
      "bg-yellow-200"
    else
      "bg-gray-500"
    end
  end

  def project_status(project, **options)
    options ||= {}
    options[:tag] ||= :span
    options[:class] ||= "rounded-lg justify-center whitespace-nowrap truncate text-black px-3 py-2"
    options[:class] += " #{color_status(project.status)}"

    content_tag options[:tag], **options do
      humanize_status(project.status)
    end
  end
end
