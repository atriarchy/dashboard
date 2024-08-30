class CreateTracks < ActiveRecord::Migration[8.0]
  def change
    create_table :tracks do |t|
      t.belongs_to :project, null: false, foreign_key: true
      t.belongs_to :user, null: false, foreign_key: true
      t.string :name, null: false
      t.string :slug, null: false
      t.boolean :explicit, null: false, default: false
      t.string :description, null: false, default: ""
      t.integer :order, null: false
      t.integer :song_type, null: false
      t.integer :status, null: false

      t.timestamps
    end
  end
end
