import State from "State";

export default function initUI(state: State) {
  const toggleCreatorBtn = document.querySelector("#creator-toggle")!
  toggleCreatorBtn.addEventListener("click", () => {
    if (state.view === "preview") state.view = "creator"
    else state.view = "preview"

    state.needRefresh = true
  })
}