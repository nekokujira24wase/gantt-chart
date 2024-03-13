export function createTaskBlockCard(
    memberTaskWrapper,
    chartWrapper,
    memberCardWrapper,
    blockContainer,
    teamInfo,
    data,
    dayList,
    current_user_name,
    num,
) {
    function createObject(index) {
        var dict = {
            'real_name' : data[index].real_name,
            'user_color': '#e4e4e4',
            'progress'  : [
                [data[index].post, 0, 0],
            ]
        }
        return dict
    }
    var objectCnt = 0;
    var len       = data.length;

    for (let i = 0; i < 200; i++) {
        if (num === 2 && data[objectCnt].username === current_user_name) {

        } else {
            var cardObject = createObject(objectCnt);
            var userSwitch = 0;
            for (let j = 0; j < 200; j++) {
                if (userSwitch === 0) {
                    var taskMemberWrapper = document.createElement('div');
                    taskMemberWrapper.setAttribute("class", "task-member-block");

                    var memberColor = document.createElement("div");
                    memberColor.setAttribute("class", "color-ball");
                    memberColor.style.background = "#e4e4e4";

                    var memberBlock = document.createElement("div");
                    memberBlock.setAttribute("class", "member-block");

                    var memberName = document.createElement("p");
                    memberName.setAttribute("class", "member-name");
                    memberName.textContent = data[objectCnt].username;

                    memberBlock.appendChild(memberColor);
                    memberBlock.appendChild(memberName);
                    taskMemberWrapper.appendChild(memberBlock);

                    memberTaskWrapper.appendChild(taskMemberWrapper);

                } else {
                    // タスク欄の処理
                    var taskBlockWrapper = document.createElement('div');
                    taskBlockWrapper.setAttribute("class", "task-block");

                    var postName = document.createElement('div');
                    postName.setAttribute('class', 'post-name');
                    postName.textContent = data[objectCnt].post;

                    var taskWrapper = document.createElement('div');
                    taskWrapper.setAttribute("class", "task-wrapper");

                    var taskNameWrapper = document.createElement('div');
                    taskNameWrapper.setAttribute('class', 'task-name-wrapper');

                    var taskName = document.createElement("p");
                    taskName.setAttribute("class", "task-name");
                    taskName.textContent = data[objectCnt].task_name;

                    var deleteBtn = document.createElement('button');
                    deleteBtn.setAttribute('class', 'delete-btn');
                    deleteBtn.setAttribute('data-task-id', `${data[objectCnt].task_id}`);

                    deleteBtn.addEventListener('click', function(e) {
                        var task_id = parseInt(this.getAttribute('data-task-id'));
                        console.log(task_id)
                        // 以下はのちに関数化する
                        if (confirm('タスクを削除しますか？')) {
                            fetch(`/delete_task/${task_id}`)
                                .then(response => {
                                    if (response.ok) {
                                        console.log('データの送信に成功しました');
                                    } else {
                                        console.error('データの送信に失敗しました');
                                    }
                                })
                                .catch(error => {
                                    console.error('データの送信中にエラーが発生しました', error);
                                })
                        } else {
                            console.log('削除がキャンセルされました。')
                        }
                    });

                    var deleteIcon = document.createElement('i');
                    deleteIcon.setAttribute('class', 'ri-delete-bin-line');

                    var taskCheckbox = document.createElement('input');
                    taskCheckbox.setAttribute("class", "task-checkbox");
                    taskCheckbox.setAttribute('data-task-id', `${data[objectCnt].task_id}`)
                    taskCheckbox.type = 'checkbox';
                    taskCheckbox.name = 'completion';
                    taskCheckbox.checked = data[objectCnt].status;
                    taskCheckbox.addEventListener('change', function(e) {
                        var task_id = parseInt(e.target.getAttribute('data-task-id'));

                        fetch(`/edit_task/${task_id}`)
                            .then(response => {
                                if (response.ok) {
                                    // 通信が成功した場合の処理
                                    console.log('データの送信に成功しました');
                                } else {
                                    // サーバーからエラーレスポンスが返された場合の処理
                                    console.error('データの送信に失敗しました');
                                }
                            })
                            .catch(error => {
                                // ネットワークエラーなど、リクエスト自体が失敗した場合の処理
                                console.error('データの送信中にエラーが発生しました', error);
                            });
                    });

                    taskNameWrapper.appendChild(taskName);
                    deleteBtn.appendChild(deleteIcon);
                    taskWrapper.appendChild(taskNameWrapper);
                    taskWrapper.appendChild(deleteBtn);
                    taskWrapper.appendChild(taskCheckbox);
                    taskBlockWrapper.appendChild(postName);
                    taskBlockWrapper.appendChild(taskWrapper);

                    memberTaskWrapper.appendChild(taskBlockWrapper);

                    var progressLen = cardObject.progress.length;
                    if (data[objectCnt].post !== cardObject.progress[progressLen - 1][0]) {
                        cardObject.progress.push([data[objectCnt].post, 0, 0]);
                        progressLen += 1;
                    }
                    cardObject.progress[progressLen - 1][1] += data[objectCnt].status ? 1 : 0;
                    cardObject.progress[progressLen - 1][2] += 1;
                }

                // chartブロックの処理
                var dayArray     = Array.from(dayList);
                var blockWrapper = document.createElement('div');
                blockWrapper.setAttribute("class", "block-wrapper");
                dayArray.forEach((day, index) => {
                    var date  = day.getAttribute('data-day');
                    var block = document.createElement('div');
                    block.setAttribute('class', 'block');
                    block.setAttribute('data-day', date);

                    var startDateLis = data[objectCnt].start_date.trim().slice(1, -1).split(',').map(function (item) {
                        return parseInt(item.trim(), 10);
                    });

                    var endDateLis = data[objectCnt].end_date.trim().slice(1, -1).split(',').map(function (item) {
                        return parseInt(item.trim(), 10);
                    });

                    var startDate = new Date(startDateLis[0], startDateLis[1] - 1, startDateLis[2]);
                    var endDate   = new Date(endDateLis[0], endDateLis[1] - 1, endDateLis[2]);

                    const diffInTime = endDate.getTime() - startDate.getTime();
                    const diffInDays = diffInTime / (1000 * 3600 * 24) + 1;
                    if (userSwitch === 0) {
                        block.style.background = teamInfo.progress === 100 ? '#00a381' : '#d9d9d9';
                    }
                    else {
                        // タスクの開始日(データセット抽出するために使用)
                        var taskStartDay = `${startDateLis[0]}-${startDateLis[1]}-${startDateLis[2]}`;

                        // タスクの状態によってブッロクの色を変更
                        block.style.background = data[objectCnt].status ? '#00a381' : '#d9d9d9';
                        if (date === taskStartDay) {

                            // タスクの開始日から終了日までの日数
                            var taskBar = document.createElement('div');
                            taskBar.setAttribute('class', 'task-bar');
                            taskBar.style.width = `${diffInDays * 39 - 14}px`;
                            taskBar.style.background = '#ffa500';
                            block.appendChild(taskBar);
                        }

                    }
                    blockWrapper.appendChild(block);
                    blockContainer.appendChild(blockWrapper);
                }); // forEach

                objectCnt = userSwitch === 0 ? objectCnt : objectCnt + 1;
                userSwitch += 1;

                if (objectCnt === len) { break; }
                if (cardObject.real_name !== data[objectCnt].real_name) { break; }
            }
            // memberCardの処理
            var memberCard = document.createElement('div');
            memberCard.setAttribute('class', 'member-card');

            var partWrapper = document.createElement('div');
            partWrapper.setAttribute("class", 'member-card-part-wrapper');

            var imgColorDiv = document.createElement('div');
            imgColorDiv.setAttribute("class", "img-color-div");
            imgColorDiv.style.background = cardObject.user_color;

            var name = document.createElement("h2");
            name.textContent = cardObject.real_name;

            const progressBarWrapper = document.createElement("div");
            progressBarWrapper.setAttribute("class", "progress-bar-wrapper");

            partWrapper.appendChild(imgColorDiv);
            partWrapper.appendChild(name);

            memberCard.appendChild(partWrapper);

            for (let k = 0; k < cardObject.progress.length; k++) {
                var postName = document.createElement('p');

                postName.textContent = cardObject.progress[k][0];
                postName.setAttribute("class", 'member-card-post-name');

                var progressBar = document.createElement('div');
                progressBar.setAttribute("class", 'member-card-progress-bar');
                var progress = cardObject.progress[k][1] / cardObject.progress[k][2] * 100;

                progressBar.style.backgroundImage = `linear-gradient(to right, ${cardObject.user_color} ${progress}%, white ${progress}%)`;

                progressBarWrapper.appendChild(postName);
                progressBarWrapper.appendChild(progressBar);
                memberCard.appendChild(progressBarWrapper);
            }

            memberCardWrapper.appendChild(memberCard);
            if (objectCnt === len) { break; }
        }
    }
}