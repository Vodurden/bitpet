defmodule Bitpet.House do
  use GenServer

  # API
  def start_link(pet) do
    GenServer.start_link(__MODULE__, pet)
  end

  @doc """
  Moves time forward one `tick` for all pets in the house.
  """
  def tick(pid) do
    GenServer.cast(pid, :tick)
  end

  def get_pet(pid) do
    GenServer.call(pid, :get_pet)
  end

  # Backend
  def init(pet) do
    state = %{tick: 0, pet: pet}

    {:ok, state}
  end

  def handle_call(:get_pet, _from, state) do
    {:reply, state.pet, state}
  end

  def handle_cast(:tick, state) do
    tick = state.tick + 1
    pet = state.pet
    |> Bitpet.Pet.update_happiness(-1)      # Lose happiness every tick

    {:noreply, %{tick: tick, pet: pet}}
  end
end
