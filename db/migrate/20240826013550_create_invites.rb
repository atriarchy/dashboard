class CreateInvites < ActiveRecord::Migration[8.0]
  def change
    create_table :invites do |t|
      t.belongs_to :user, null: false, foreign_key: true
      t.integer :role, null: false, default: 0
      t.timestamp :expires_at, null: false

      t.timestamps
    end

    add_column :users, :verified, :boolean, default: false
    User.update_all(verified: true)
  end
end
