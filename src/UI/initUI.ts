import State from "State";

export default function initUI(state: State) {
  const toggleCreatorBtn = document.querySelector("#creator-toggle")!
  toggleCreatorBtn.addEventListener("click", () => {
    if (state.view === "preview") state.view = "creator"
    else state.view = "preview"

    state.needRefresh = true
  })

  const playBtn = document.querySelector("#play")!
  playBtn.addEventListener("click", () => {
    if (state.play) {
      state.play = false
    } else {
      state.view = "preview"
      state.play = true
      state.time = 0
      state.needRefresh = true
    }
  })

  const recordCheckbox = document.querySelector<HTMLInputElement>("#recording")!
  recordCheckbox.addEventListener("change", (e) => {
    state.record = (e.target as HTMLInputElement).checked
  })
}