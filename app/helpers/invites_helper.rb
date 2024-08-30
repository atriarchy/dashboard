module InvitesHelper
  def relative_timestamp(timestamp)
    days = ((timestamp - Time.now) / 1.day).round
    if days >= 7
      t("invite.expires_in", when: t("weeks", count: days / 7))
    else
      t("invite.expires_in", when: t("days", count: days))
    end
  end

  def color_invite(invite)
    if invite.user.verified?
      "bg-green-400 text-white"
    elsif invite.expires_at > Time.now
      "bg-violet-400 text-white"
    else
      "bg-red-400 text-white"
    end
  end

  def invite_status(invite, **options)
    options ||= {}
    options[:tag] ||= :span
    options[:class] ||= "font-bold rounded-full px-2 py-1 "
    options[:class] += " " + color_invite(invite)
    content_tag options.delete(:tag), **options do
      if invite.user.verified?
        t("invite.accepted")
      elsif invite.expires_at > Time.now
        [ t("invite.expires"), local_time_ago(invite.expires_at) ].join(" ").html_safe
      else
        t("invite.expired")
      end
    end
  end
end
