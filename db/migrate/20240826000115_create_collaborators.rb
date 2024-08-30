class CreateCollaborators < ActiveRecord::Migration[8.0]
  def change
    create_table :collaborators do |t|
      t.belongs_to :track, null: false, foreign_key: true
      t.belongs_to :user, null: false, foreign_key: true
      t.integer :role, null: false, default: "contributor"

      t.timestamps
    end
  end
end
