export function createChart(parentElement, dayList, numberOfMember) {
    const dayArray = Array.from(dayList);

    const blockContainer = document.createElement("div");
    blockContainer.setAttribute("class", "block-container");
    for (let i = 0; i < numberOfMember; i++){
        const blockWrapper = document.createElement("div");
        blockWrapper.setAttribute("class", "block-wrapper");
        dayArray.forEach((day, index) => {
            const block = document.createElement("div");
            block.setAttribute("class", `block ${day.dataset.day}`)
            blockWrapper.appendChild(block);
        });
        blockContainer.appendChild(blockWrapper);
        parentElement.appendChild(blockContainer);
    }
};