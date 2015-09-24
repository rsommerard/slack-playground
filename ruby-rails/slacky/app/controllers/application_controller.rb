class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  CROUS_URL = 'http://www.crous-lille.fr/admin-site/restauration_menu_print_w.php?ru=25&midi=1'
end
