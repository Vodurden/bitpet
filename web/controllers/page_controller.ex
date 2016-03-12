defmodule Bitpet.PageController do
  use Bitpet.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
