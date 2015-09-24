class CreateMenus < ActiveRecord::Migration
  def change
    create_table :menus do |t|
      t.date :date
      t.text :content

      t.timestamps null: false
    end
  end
end
