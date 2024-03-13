import { createButton } from './button.js'
import {
    detailButton,
    logoutButton,
    headerButton,
} from './demoDict.js';
const headerButtonContainer = document.querySelector(".header-button-wrapper");
const projectContainer      = document.querySelector("#project-container");
const projectButtonWrapper  = document.querySelector(".project-button-wrapper");
const dateWrapper           = document.querySelector(".date");
const memberTaskWrapper     = document.querySelector(".member-task-wrapper");
const chartWrapper          = document.querySelector(".chart-wrapper");
const memberContainer       = document.querySelector("#member-container");
const memberCardWrapper     = document.querySelector(".member-card-wrapper");

// プロジェクトを選択状態にする関数
let checkList = [null, null];
export function check(id) {
    if (checkList[0] === checkList[1]) {
        checkList[0] = id;
    } else {
        var preId    = checkList[0] ? checkList[0] : checkList[1];
        checkList[0] = checkList[0] ? null : id;
        checkList[1] = checkList[1] ? null : id;

        var preActiveProject = document.querySelector(`[data-teamId="${preId}"]`);
        preActiveProject.classList.remove('active');
    }
    var activeProject = document.querySelector(`[data-teamid="${id}"`);
    activeProject.classList.add('active');

    sessionStorage.setItem('team_id', id);
};


window.onload = () => {
    // ヘッダーコンテンツ内のボタンを作成
    for (let i = 0; i < 3; i++) { createButton(headerButtonContainer, headerButton, 1, i); }

    // プロジェクトコンテンツ内の（ Project name ）ボタンを作成
    if (buttonDict){ createButton(projectButtonWrapper, buttonDict, 2, 1) }

    // プロジェクトコンテンツ内の（ Logout ）ボタンを作成
    createButton(projectContainer, logoutButton, 1, 1);


    // dateバーとchartマップの横スクロールを同期
    chartWrapper.addEventListener("scroll", () => {
        dateWrapper.scrollLeft = chartWrapper.scrollLeft;
    });

    // taskバーとchartマップの縦スクロールを同期
    chartWrapper.addEventListener("scroll", () => {
        memberTaskWrapper.scrollTop = chartWrapper.scrollTop;
    });

    // Detailボタンを作成
    createButton(memberContainer, detailButton, 1, 1);
};