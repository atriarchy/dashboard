class CreateProjects < ActiveRecord::Migration[8.0]
  def change
    create_table :projects do |t|
      t.belongs_to :user, null: false, foreign_key: true
      t.string :name, null: false
      t.string :slug, null: false
      t.string :description, null: false
      t.timestamp :deadline, null: false
      t.integer :status, null: false

      t.timestamps
    end
  end
end
