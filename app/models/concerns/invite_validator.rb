class InviteValidator < ActiveModel::Validator
  def validate(record)
    return unless record.new_record?

    # return because they could already be registered and have an active invite
    return record.errors.add(:user, "already registered") if record.user.verified?

    record.errors.add(:user, "already has an active invite") if record.user.active_invites.any?
  end
end
