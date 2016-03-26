defmodule Bitpet.PetChannel do
  use Phoenix.Channel

  def join("pets:" <> _pet_id, _params, socket) do
    pet_id = get_pet_id(socket)

    house = Bitpet.Simulation.get_house(pet_id)

    pet = Bitpet.House.get_pet(house)

    payload = %{
      "name": pet.name,
      "happiness": pet.happiness
    }

    {:ok, payload, socket}
  end

  def handle_in("sync_pet", _payload, socket) do
    pet_id = get_pet_id(socket)

    Bitpet.Simulation.sync_pet(pet_id)

    {:reply, :ok, socket}
  end

  def handle_in("feed_pet", _payload, socket) do
    # Feed our pet!
    pet_id = get_pet_id(socket)

    house = Bitpet.Simulation.get_house(pet_id)

    pet = Bitpet.House.feed_pet(house)

    {:reply, {:ok, pet}, socket}
  end

  defp get_pet_id(socket) do
    "pets:" <> pet_id = socket.topic

    {numeric_id, _} = Integer.parse(pet_id)

    numeric_id
  end
end
