module ApplicationHelper
  def nav_link(scope, &block)
    class_name = "btn clicky flex w-full items-center justify-start gap-2 rounded-lg p-2 font-semibold "
    class_name += current_page?(controller: scope) ? "bg-violet-700" : "bg-gray-700 transition hover:bg-violet-500"

    link_to send("#{scope}_path"), class: class_name, &block
  end

  def nav_button(back_to = nil)
    back_to_component = link_to back_to, class: "clicky flex flex-col justify-center max-sm:hidden" do
      icon(:arrow_left, class: "size-8")
    end
    nav_component = button_tag class: "clicky flex flex-col justify-center sm:hidden", data: { action: "reveal#toggle" } do
      icon(:bars_3, class: "size-10")
    end

    if back_to
      [ back_to_component, nav_component ].join.html_safe
    else
      nav_component
    end
  end

  def select_enum(hash)
    hash.keys.map { |k| [ k.humanize, k ] }
  end

  def accepted_formats(formats)
    formats.join(",")
  end

  def destroy_btn(target, message, **options, &block)
    options ||= {}
    options[:data] ||= { controller: "confirm", action: "confirm#confirm", "confirm-message-value": message }
    button_to(target, method: :delete, **options, &block)
  end
end
