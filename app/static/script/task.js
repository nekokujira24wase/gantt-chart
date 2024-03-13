export function createTask(parentElement, taskDict) {
    const numberOfMember = taskDict.members.length;
    let blockCnt = 0;

    for (let i = 0; i < numberOfMember; i++) {
        blockCnt += 1;
        const taskMemberWrapper = document.createElement("div");
        taskMemberWrapper.setAttribute("class", "task-member-block");

        const memberBlock = document.createElement("div");
        memberBlock.setAttribute("class", "member-block");

        const memberColor = document.createElement("div");
        memberColor.setAttribute("class", "color-ball");
        memberColor.style.background = taskDict.members[i].memberColor;

        const memberName = document.createElement("p");
        memberName.setAttribute("class", "member-name");
        memberName.textContent = taskDict.members[i].name;

        memberBlock.appendChild(memberColor);
        memberBlock.appendChild(memberName);
        taskMemberWrapper.appendChild(memberBlock);

        const numberOfTask = taskDict.members[i].numberOfTasks;
        for (let j = 0; j < numberOfTask; j++) {
            blockCnt += 1;
            const taskBlock = document.createElement("div");
            taskBlock.setAttribute("class", "task-block");
            // console.log(taskBlock,333);

            const postName = document.createElement("p");
            postName.setAttribute("class", "post-name");
            postName.textContent = taskDict.members[i].tasks[j].post;
            // console.log(postName,222);

            const taskWrapper = document.createElement("div");
            taskWrapper.setAttribute("class", "task-wrapper");

            const taskName = document.createElement("p");
            taskName.setAttribute("class", "task-name");
            taskName.textContent = taskDict.members[i].tasks[j].taskName;

            const taskCheckbox = document.createElement('input');
            taskCheckbox.setAttribute("class", "task-checkbox");
            taskCheckbox.type = 'checkbox';
            taskCheckbox.name = 'completion';
            taskCheckbox.checked = taskDict.members[i].tasks[j].completion;

            // console.log(taskBlock,111);
            taskWrapper.appendChild(taskName);
            taskWrapper.appendChild(taskCheckbox);
            taskBlock.appendChild(postName);
            taskBlock.appendChild(taskWrapper);

            taskMemberWrapper.appendChild(taskBlock);
        }
    
        parentElement.appendChild(taskMemberWrapper);
    }
};