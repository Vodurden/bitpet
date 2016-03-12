defmodule Bitpet.PetChannel do
  use Phoenix.Channel

  def join("pets:" <> _pet_id, _params, socket) do
    {:ok, socket}
  end

  def handle_in("sync_pet", _payload, socket) do
    {:noreply, socket}
  end
end
