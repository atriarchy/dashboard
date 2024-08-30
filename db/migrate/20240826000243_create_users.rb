class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.integer :role, null: false, default: "artist"
      t.string :discord_id, null: false

      t.timestamps
    end
  end
end
