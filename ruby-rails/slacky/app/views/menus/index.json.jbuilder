json.array!(@menus) do |menu|
  json.extract! menu, :id, :id, :date, :content
  json.url menu_url(menu, format: :json)
end
