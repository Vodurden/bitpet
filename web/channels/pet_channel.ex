defmodule Bitpet.PetChannel do
  use Phoenix.Channel

  def join("pets:" <> _pet_id, _params, socket) do
    {:ok, socket}
  end

  def handle_in("sync_pet", _payload, socket) do
    {:noreply, socket}
  end

  def handle_in("feed_pet", _payload, socket) do
    # Feed our pet!
    "pets:" <> pet_id = socket.topic

    {numeric_id, _} = Integer.parse(pet_id)

    house = Bitpet.Simulation.get_house(numeric_id)

    pet = Bitpet.House.feed_pet(house)

    {:reply, {:ok, pet}, socket}
  end
end
