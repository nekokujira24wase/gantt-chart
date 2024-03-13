import { check } from './app.js'
import { createDate } from './date.js';
import { createTaskBlockCard } from './createChart.js';

export function createButton(parentElement, dict, index, i) {

    // header / logout / Detail ボタンを生成
    if (index === 1) {
        const newButton = document.createElement('button');
        newButton.setAttribute("class", `${dict.class}-button`);

        newButton.textContent = dict.buttonType === "headerButton" ? dict.text[i] : dict.text;
        newButton.setAttribute("class", `${dict.class}-button`);

        // header欄のボタンの機能設定
        if (dict.class === "header") {
            newButton.addEventListener('click', function () {
                if (sessionStorage.getItem('team_id')) {
                    var teamId = sessionStorage.getItem('team_id');
                    if (dict.text[i] === 'Other') {
                        window.location.href = `${dict.endpoint[i]}/${teamId}`
                    } else {
                        window.location.href = `${dict.endpoint[i]}`;
                    }
                }
            })
        }

        // logoutボタンの機能設定
        else if (dict.class === 'logout') {
            newButton.addEventListener('click', function () {
                window.location.href = '/logout';
            });
        }

        // detailボタンの機能設定
        else {

        }
        parentElement.appendChild(newButton);
    }

    // projectButtonを生成
    if (index === 2) {
        // console.log(dict[0].team_color);
        for (let i = 0; i < dict.length; i++) {
            const newButton = document.createElement('button');
            newButton.setAttribute("class", 'project-name-button');
            newButton.setAttribute('data-teamId', `${dict[i].id}`);
            newButton.addEventListener("click", (e) => {
                if (
                    e.target.tagName === 'DIV' ||
                    e.target.tagName === 'H2'
                    ) {
                        console.log("くりっくされた");
                    }
                var id = parseInt(e.target.dataset.teamid);
                check(id);
                fetch(`/get_data/${id}`)
                    .then(response => response.json())
                    .then(data => {
                        // console.log(JSON.parse(data.team_info.start_date));
                        // console.log(data.current_user_tasks);
                        // console.log(data);
                        // console.log(data.current_user_tasks.length);

                        // 日付欄を生成
                        var dateWrapper = document.querySelector(".date");
                        dateWrapper.innerHTML = '';
                        createDate(
                            dateWrapper,
                            JSON.parse(data.team_info.start_date),
                            JSON.parse(data.team_info.end_date),
                        )

                        // タスク欄/ブッロク/メンバーカードを生成
                        var memberTaskWrapper       = document.querySelector(".member-task-wrapper");
                        var chartWrapper            = document.querySelector(".chart-wrapper");
                        var memberCardWrapper       = document.querySelector(".member-card-wrapper");
                        var dayList                 = document.querySelectorAll('.day-block');
                        memberTaskWrapper.innerHTML = '';
                        chartWrapper.innerHTML      = '';
                        memberCardWrapper.innerHTML = '';
                        dayList.innerHTML           = '';

                        var blockContainer = document.createElement('div');
                        blockContainer.setAttribute('class', 'block-container');
                        chartWrapper.appendChild(blockContainer);

                        if (data.current_user_tasks.length > 0) {
                            createTaskBlockCard(
                                memberTaskWrapper,
                                chartWrapper,
                                memberCardWrapper,
                                blockContainer,
                                data.team_info,
                                data.current_user_tasks,
                                dayList,
                            );
                        }


                        if (data.tasks.length > 0) {
                            createTaskBlockCard(
                                memberTaskWrapper,
                                chartWrapper,
                                memberCardWrapper,
                                blockContainer,
                                data.team_info,
                                data.tasks,
                                dayList,
                            );
                        }
                    })
                    .catch(error => console.error('Error:', error));
            });

            const partWrapper = document.createElement('span');
            partWrapper.setAttribute('class', `${dict[0].class}-part-wrapper`);

            const imgColorDiv = document.createElement('span');
            imgColorDiv.setAttribute('class', "img-color-div");
            imgColorDiv.style.background = `${dict[i].team_color}`;

            var projectNameWrapper = document.createElement('span');
            projectNameWrapper.setAttribute('class', 'project-name-wrapper');

            const projectName = document.createElement('span');
            projectName.textContent = dict[i].team_name;

            const progressBarWrapper = document.createElement('span');
            progressBarWrapper.setAttribute('class', 'progress-bar-wrapper');

            const progressBar = document.createElement('span');
            progressBar.setAttribute('class', `${dict[0].class}-progress-bar`);
            progressBar.style.backgroundImage = `
                    linear-gradient(to right, ${dict[i].team_color} ${dict[i].progress}%, white ${dict[i].progress}%)
                `;
            // console.log(dict[i].progress, 'progressBarの%', progressBar.style.backgroundImage)
            projectNameWrapper.appendChild(projectName);
            partWrapper.appendChild(imgColorDiv);
            partWrapper.appendChild(projectNameWrapper);
            progressBarWrapper.append(progressBar);
            newButton.appendChild(partWrapper);
            newButton.appendChild(progressBarWrapper);
            parentElement.appendChild(newButton);
        }
    }
}